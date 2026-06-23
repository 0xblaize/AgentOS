'use client'

import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import { PHASE } from '@/lib/phases'
import { AgentState } from '@/lib/clips'
import AgentModel from './AgentModel'
import ThoughtCloud from './ThoughtCloud'
import HeroBox from './HeroBox'
import Staircase, { stairPoint, STAIR_TOP, STAIR_BOTTOM } from './Staircase'
import DeskRig, { SEAT_POS } from './DeskRig'

interface AgentSceneProps {
  phase: number
  phaseProgress: number
}

// ── Camera anchors ─────────────────────────────────────────────────────────
// During intro/morph the camera looks at the world origin where the box
// floats. As the morph progresses we lerp to the agent-tracking pose.
const HERO_CAM_POS = new THREE.Vector3(0, 0.5, 5)
const HERO_LOOK_AT = new THREE.Vector3(0, 0, 0)

/**
 * Per-phase camera offset relative to the agent's focus point (agent feet).
 *  - morph:  pulled back at body-center height for a full-body second-person
 *            shot — the agent stands calm on the pavement, breathing, with
 *            the thought cloud above its head. Stationary view.
 *  - data:   pulled out to the side while the agent walks toward the desk.
 *  - later:  3/4 over-shoulder view at the desk.
 */
function cameraOffsetForPhase(phase: number): THREE.Vector3 {
  if (phase <= PHASE.morph) return new THREE.Vector3(0, 0.9, 4.8)
  if (phase === PHASE.data) return new THREE.Vector3(4.2, 1.4, 2.4)
  return new THREE.Vector3(2.6, 1.6, 3.4)
}

/**
 * Which way the agent should be facing, in radians around Y.
 *  - intro / morph: face the camera (+Z). On the podium, idle + thinking, the
 *    BTC thought cloud floats above its head.
 *  - data → seated: face the desk (-Z) so it walks toward, then sits at, the
 *    monitors.
 */
function facingForPhase(phase: number): number {
  if (phase <= PHASE.morph) return Math.PI
  return 0
}

function stateForPhase(phase: number): AgentState {
  switch (phase) {
    case PHASE.intro:
      return 'stand_idle'
    case PHASE.morph:
      // Stand idle on the podium, "thinking" (breathing bone animation +
      // thought cloud). No mid-morph walk transition — descent happens in
      // the data phase.
      return 'thinking'
    case PHASE.data:
      return 'walk'
    case PHASE.shadows:
      return 'sit_down'
    case PHASE.fusion:
      return 'typing'
    case PHASE.cta:
    default:
      return 'sit_idle'
  }
}

function walkProgress(phase: number, p: number): number {
  if (phase <= PHASE.morph) return 0
  if (phase === PHASE.data) return p
  return 1
}

// Descent + walk choreography for the data phase. First half = drop straight
// down off the podium to the ground; second half = walk along the floor to
// the seat. (We'll replace the straight drop with a real climb-down once the
// podium reads correctly on screen.)
const DROP_FRAC = 0.35

function journeyPoint(w: number, out: THREE.Vector3): THREE.Vector3 {
  if (w <= DROP_FRAC) return stairPoint(w / DROP_FRAC, out)
  const f = (w - DROP_FRAC) / (1 - DROP_FRAC)
  return out.lerpVectors(STAIR_BOTTOM, SEAT_POS, f)
}

function thoughtShow(phase: number, p: number): number {
  // Cloud is visible the whole time the agent is standing idle on the podium,
  // fading in at the start of morph and out at the very end.
  if (phase !== PHASE.morph) return 0
  if (p < 0.15) return Math.max(0, p / 0.15)
  if (p > 0.9) return Math.max(0, 1 - (p - 0.9) / 0.1)
  return 1
}

/**
 * 0 = "look at the floating box at the origin" (intro)
 * 1 = "track the agent on the pavement" (morph onward)
 *
 * Quick swoop: as the box bursts (early morph), the camera reveals the agent
 * on the pavement and then HOLDS steady for the remainder of the thinking
 * phase — the user explicitly asked for a stationary observation view.
 */
function heroToAgentBlend(phase: number, p: number): number {
  if (phase < PHASE.morph) return 0
  if (phase === PHASE.morph) return Math.min(1, Math.max(0, (p - 0.2) / 0.25))
  return 1
}

export default function AgentScene({ phase, phaseProgress }: AgentSceneProps) {
  const { camera } = useThree()
  const agentRef = useRef<THREE.Group>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const tmp2 = useMemo(() => new THREE.Vector3(), [])
  const camTarget = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  const state = stateForPhase(phase, phaseProgress)
  const seated = phase >= PHASE.shadows
  const screenGlow = phase === PHASE.fusion ? 1 : phase > PHASE.fusion ? 0.5 : 0
  const cloud = thoughtShow(phase, phaseProgress)

  // Hero box drive: 0 while idle in intro, ramps 0→1 across the morph.
  const heroExplode =
    phase === PHASE.intro
      ? phaseProgress * 0.15
      : phase === PHASE.morph
        ? 0.15 + phaseProgress * 0.85
        : 1
  const heroVisible = phase <= PHASE.morph

  // World visibility: keep the staircase/desk hidden during the intro so the
  // user only sees the floating box on black. They snap in as the morph plays.
  const worldVisible = phase >= PHASE.morph

  useFrame(() => {
    const g = agentRef.current
    if (!g) return

    if (seated) {
      g.position.lerp(SEAT_POS, 0.15)
    } else {
      const w = walkProgress(phase, phaseProgress)
      journeyPoint(w, tmp)
      g.position.lerp(tmp, 0.2)
    }

    // Facing: face the camera during morph, then turn to face the desk as
    // the descent begins (see facingForPhase).
    const targetRotY = facingForPhase(phase, phaseProgress)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRotY, 0.1)

    // Agent-tracking camera target uses a per-phase offset so the staircase
    // reads as stairs (side angle) during the walk and as a portrait shot
    // during the reveal.
    const focus = seated ? SEAT_POS : g.position
    const off = cameraOffsetForPhase(phase)
    tmp2.set(focus.x + off.x, focus.y + off.y, focus.z + off.z)
    // Aim at body center (≈0.9 above the agent's feet) so the full body fits
    // in frame for the morph pavement shot. For the seated phase this lands
    // around the torso which is still a natural read.
    lookTarget.set(focus.x, focus.y + 0.9, focus.z)

    // Blend between hero-view (looking at the box at the origin) and the
    // agent-tracking view as the morph progresses.
    const t = heroToAgentBlend(phase, phaseProgress)
    camTarget.lerpVectors(HERO_CAM_POS, tmp2, t)
    camera.position.lerp(camTarget, 0.08)

    tmp.lerpVectors(HERO_LOOK_AT, lookTarget, t)
    camera.lookAt(tmp.x, tmp.y, tmp.z)
  })

  return (
    <>
      <color attach="background" args={['#04050a']} />
      <fog attach="fog" args={['#04050a', 8, 22]} />
      <ambientLight intensity={0.25} />

      {/* Hero box lights — used during intro when the world is hidden. */}
      {heroVisible && (
        <>
          <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fff8e0" />
          <pointLight position={[0, 3, 2]} intensity={2} color="#d4a017" distance={8} />
          <pointLight position={[0, -2, 3]} intensity={0.8} color="#1a4fff" distance={6} />
        </>
      )}

      {/* World lighting — only when the staircase/desk are visible. */}
      {worldVisible && (
        <>
          <spotLight
            position={[4, 8, 4]}
            angle={0.5}
            penumbra={0.8}
            intensity={120}
            color="#fff4e0"
            distance={30}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.0002}
          />
          <spotLight
            position={[-5, 5, -5]}
            angle={0.7}
            penumbra={1}
            intensity={50}
            color="#c8ff00"
            distance={25}
          />
          <pointLight position={[-3, 2, 4]} intensity={8} color="#1a4fff" distance={14} />
          <Suspense fallback={null}>
            <Environment preset="studio" />
          </Suspense>
        </>
      )}

      <HeroBox explodeProgress={heroExplode} visible={heroVisible} />

      {worldVisible && (
        <>
          <Staircase />
          <DeskRig screenGlow={screenGlow} />

          <group
            ref={agentRef}
            position={[STAIR_TOP.x, STAIR_TOP.y, STAIR_TOP.z]}
            scale={1.0}
          >
            <AgentModel state={state} />
            <pointLight position={[0, 2.4, 1.2]} intensity={6} color="#ffd98a" distance={6} />
            <pointLight position={[0.6, 1.2, 0.8]} intensity={3} color="#c8ff00" distance={5} />
            <ThoughtCloud show={cloud} />
          </group>

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -1]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial color="#06070c" metalness={0.4} roughness={0.7} />
          </mesh>
        </>
      )}
    </>
  )
}
