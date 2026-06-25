// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal IERC20 surface (transfer/transferFrom/balanceOf).
/// @dev Inlined so the contract compiles in Remix with no imports.
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}

/// @title AgentVault — Agent.OS paper-trading session vault
/// @notice One session per user. User deposits native ETH or USDC, then every
///         agent action (Deploy / OpenTrade / CloseTrade / Terminate) is an
///         on-chain transaction. The vault NEVER moves funds anywhere except
///         back to the depositor on Terminate or Withdraw. Owner cannot pull.
contract AgentVault {
    // ─── Types ────────────────────────────────────────────────────────────
    enum SessionStatus { NONE, ACTIVE, PAUSED, TERMINATED }
    enum Side { LONG, SHORT }

    struct Session {
        address asset;          // address(0) == native ETH
        uint256 deposited;      // raw token units
        uint256 riskBps;        // basis points, 10..500
        uint256 maxDrawdownBps; // basis points, 100..10_000
        SessionStatus status;
        uint64 deployedAt;
        uint64 terminatedAt;
    }

    struct Trade {
        bytes32 id;
        address owner;
        bytes32 symbol;
        Side side;
        uint256 sizeUsdt;
        uint256 entryPrice;
        uint256 stopLoss;
        uint256 takeProfit;
        bool open;
        uint64 openedAt;
        uint64 closedAt;
    }

    // ─── Storage ──────────────────────────────────────────────────────────
    mapping(address => Session) public sessions;
    mapping(bytes32 => Trade) public trades;
    mapping(address => bytes32[]) private _userTradeIds;
    uint256 private _nonce;

    // ─── Events ───────────────────────────────────────────────────────────
    event Deployed(address indexed user, address asset, uint256 amount, uint256 riskBps, uint256 maxDdBps);
    event TradeOpened(bytes32 indexed id, address indexed user, bytes32 symbol, Side side, uint256 sizeUsdt, uint256 entry, uint256 sl, uint256 tp);
    event TradeClosed(bytes32 indexed id, address indexed user, uint256 exitPrice, int256 pnl, string reason);
    event Paused(address indexed user);
    event Resumed(address indexed user);
    event Terminated(address indexed user, uint256 refunded);
    event Withdrawn(address indexed user, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────
    error NoActiveSession();
    error SessionAlreadyActive();
    error AssetMismatch();
    error AmountZero();
    error TradeNotOpen();
    error NotTradeOwner();
    error TransferFailed();

    // ─── Modifiers ────────────────────────────────────────────────────────
    modifier onlyActive() {
        if (sessions[msg.sender].status != SessionStatus.ACTIVE) revert NoActiveSession();
        _;
    }

    // ─── User actions: every one of these requires a wallet signature ────

    /// @notice Open a session by depositing collateral. Spec §4 Deploy Agent.
    /// @param asset    address(0) for native ETH, else ERC20 token address (e.g. USDC).
    /// @param amount   token amount in raw units (wei for ETH, 6-decimals for USDC).
    /// @param riskBps  Risk per trade in basis points (10 = 0.1%, 500 = 5%).
    /// @param maxDdBps Max drawdown kill-switch in basis points of deposited capital.
    /// @dev For native ETH send msg.value == amount. For ERC20 the user must have
    ///      approved this contract for `amount` first (separate approve() tx).
    function deploy(
        address asset,
        uint256 amount,
        uint256 riskBps,
        uint256 maxDdBps
    ) external payable {
        Session storage s = sessions[msg.sender];
        if (s.status == SessionStatus.ACTIVE) revert SessionAlreadyActive();
        if (amount == 0) revert AmountZero();

        if (asset == address(0)) {
            if (msg.value != amount) revert AmountZero();
        } else {
            if (msg.value != 0) revert AssetMismatch();
            bool ok = IERC20(asset).transferFrom(msg.sender, address(this), amount);
            if (!ok) revert TransferFailed();
        }

        sessions[msg.sender] = Session({
            asset: asset,
            deposited: amount,
            riskBps: riskBps,
            maxDrawdownBps: maxDdBps,
            status: SessionStatus.ACTIVE,
            deployedAt: uint64(block.timestamp),
            terminatedAt: 0
        });

        emit Deployed(msg.sender, asset, amount, riskBps, maxDdBps);
    }

    /// @notice Record an Order-Block-triggered trade on-chain.
    function openTrade(
        bytes32 symbol,
        Side side,
        uint256 sizeUsdt,
        uint256 entryPrice,
        uint256 stopLoss,
        uint256 takeProfit
    ) external onlyActive returns (bytes32 id) {
        id = keccak256(abi.encodePacked(msg.sender, ++_nonce, block.timestamp));
        trades[id] = Trade({
            id: id,
            owner: msg.sender,
            symbol: symbol,
            side: side,
            sizeUsdt: sizeUsdt,
            entryPrice: entryPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            open: true,
            openedAt: uint64(block.timestamp),
            closedAt: 0
        });
        _userTradeIds[msg.sender].push(id);
        emit TradeOpened(id, msg.sender, symbol, side, sizeUsdt, entryPrice, stopLoss, takeProfit);
    }

    /// @notice Close a trade. `pnl` is informational (paper-trade, not settled here).
    function closeTrade(bytes32 id, uint256 exitPrice, int256 pnl, string calldata reason) external {
        Trade storage t = trades[id];
        if (!t.open) revert TradeNotOpen();
        if (t.owner != msg.sender) revert NotTradeOwner();
        t.open = false;
        t.closedAt = uint64(block.timestamp);
        emit TradeClosed(id, msg.sender, exitPrice, pnl, reason);
    }

    /// @notice Pause perception. Existing trades stay open; no new ones recorded.
    function pause() external onlyActive {
        sessions[msg.sender].status = SessionStatus.PAUSED;
        emit Paused(msg.sender);
    }

    /// @notice Resume perception after a pause.
    function resume() external {
        Session storage s = sessions[msg.sender];
        if (s.status != SessionStatus.PAUSED) revert NoActiveSession();
        s.status = SessionStatus.ACTIVE;
        emit Resumed(msg.sender);
    }

    /// @notice Terminate the session. Closes all open trades, returns deposit.
    /// @dev Pure refund — paper PnL is not settled on-chain.
    function terminate() external {
        Session storage s = sessions[msg.sender];
        if (s.status == SessionStatus.NONE || s.status == SessionStatus.TERMINATED) revert NoActiveSession();

        bytes32[] storage ids = _userTradeIds[msg.sender];
        for (uint256 i = 0; i < ids.length; ++i) {
            Trade storage t = trades[ids[i]];
            if (t.open) {
                t.open = false;
                t.closedAt = uint64(block.timestamp);
                emit TradeClosed(ids[i], msg.sender, 0, 0, "TERMINATE");
            }
        }

        uint256 refund = s.deposited;
        address asset = s.asset;
        s.deposited = 0;
        s.status = SessionStatus.TERMINATED;
        s.terminatedAt = uint64(block.timestamp);

        if (refund > 0) {
            if (asset == address(0)) {
                (bool ok, ) = msg.sender.call{value: refund}("");
                if (!ok) revert TransferFailed();
            } else {
                bool ok = IERC20(asset).transfer(msg.sender, refund);
                if (!ok) revert TransferFailed();
            }
        }

        emit Terminated(msg.sender, refund);
    }

    /// @notice Withdraw remaining deposit from a TERMINATED session (rescue path).
    function withdraw() external {
        Session storage s = sessions[msg.sender];
        if (s.status != SessionStatus.TERMINATED) revert NoActiveSession();
        uint256 amt = s.deposited;
        if (amt == 0) revert AmountZero();
        s.deposited = 0;
        address asset = s.asset;
        if (asset == address(0)) {
            (bool ok, ) = msg.sender.call{value: amt}("");
            if (!ok) revert TransferFailed();
        } else {
            bool ok = IERC20(asset).transfer(msg.sender, amt);
            if (!ok) revert TransferFailed();
        }
        emit Withdrawn(msg.sender, amt);
    }

    // ─── Views ────────────────────────────────────────────────────────────
    function getSession(address user) external view returns (Session memory) {
        return sessions[user];
    }
    function getTradeIds(address user) external view returns (bytes32[] memory) {
        return _userTradeIds[user];
    }
    function isActive(address user) external view returns (bool) {
        return sessions[user].status == SessionStatus.ACTIVE;
    }

    // Native ETH safety — direct sends without calling deploy() are rejected.
    receive() external payable { revert("use deploy()"); }
    fallback() external payable { revert("unknown selector"); }
}
