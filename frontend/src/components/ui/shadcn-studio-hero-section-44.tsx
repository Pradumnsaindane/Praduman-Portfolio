'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRightIcon } from 'lucide-react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import type { RapierRigidBody, RigidBodyProps } from '@react-three/rapier'

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const focusRing =
  'focus-visible:ring-ring/60 focus-visible:border-ring outline-none focus-visible:ring-[3px]'

/* -------------------------------------------------------------------------- */
/*                                  ID card                                   */
/* -------------------------------------------------------------------------- */

// Physics-driven hanging badge: a card clipped to a cord that swings under gravity and can be dragged.
// Adapted from React Bits' "Lanyard" example. Every RigidBody uses `colliders: false` so Rapier's
// auto-collider doesn't fight the manual ones, and angular velocity is counter-rotated instead of
// locking rotations.

const PIN_IMAGE_URL = 'https://cdn.21st.dev/assets/mirror/ad/ad5d58b0ab86bd893f0ab4792d68136796a8a319061f9a834bbee109941617c0.png'

const ROPE_RADIUS = 0.1
const ROPE_RADIAL_SEGMENTS = 24
const ROPE_TAPER_FRACTION = 0.06
const CARD_ROPE_ANCHOR_Y = 1.1
const ROPE_TOP_EXTENSION = -0.5

const PIN_IMAGE_ASPECT = 1024 / 1536
const PIN_IMAGE_BOTTOM_PAD_FRACTION = (1536 - 1432) / 1536
const CARD_TOP_EDGE_Y = 0.93
const PIN_PLANE_HEIGHT = 1.4
const PIN_PLANE_WIDTH = PIN_PLANE_HEIGHT * PIN_IMAGE_ASPECT
const PIN_PLANE_Y = CARD_TOP_EDGE_Y + PIN_PLANE_HEIGHT * -PIN_IMAGE_BOTTOM_PAD_FRACTION
const PIN_PLANE_X = 0
const PIN_PLANE_Z = ROPE_RADIUS + 0.06

// Card face in the group's local space (the group is scaled x4 below).
const CARD_WIDTH = 0.716
const CARD_HEIGHT = 1
const CARD_BOTTOM_Y = 0.023
const CARD_CORNER_RADIUS = 0.05
const CARD_CANVAS_SCALE = 1000
const ACCENT_STRIPE_HEIGHT_RATIO = 0.03

// Rounded-rectangle face with UVs spanning the full texture.
const buildCardFaceGeometry = () => {
  const x0 = -CARD_WIDTH / 2
  const x1 = CARD_WIDTH / 2
  const y0 = CARD_BOTTOM_Y
  const y1 = CARD_BOTTOM_Y + CARD_HEIGHT
  const r = CARD_CORNER_RADIUS
  const shape = new THREE.Shape()

  shape.moveTo(x0 + r, y0)
  shape.lineTo(x1 - r, y0)
  shape.quadraticCurveTo(x1, y0, x1, y0 + r)
  shape.lineTo(x1, y1 - r)
  shape.quadraticCurveTo(x1, y1, x1 - r, y1)
  shape.lineTo(x0 + r, y1)
  shape.quadraticCurveTo(x0, y1, x0, y1 - r)
  shape.lineTo(x0, y0 + r)
  shape.quadraticCurveTo(x0, y0, x0 + r, y0)

  const geometry = new THREE.ShapeGeometry(shape, 12)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')

  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - x0) / CARD_WIDTH, (position.getY(i) - y0) / CARD_HEIGHT)
  }

  return geometry
}

type LanyardRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 }

const getLerped = (body: LanyardRigidBody) => {
  if (!body.lerped) {
    body.lerped = new THREE.Vector3().copy(body.translation())
  }

  return body.lerped
}

// TubeGeometry with a per-ring radius that tapers to 0 at t=0, instead of a flat cut.
const buildTaperedTubeGeometry = (
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radius: number,
  radialSegments: number,
  taperFraction: number
) => {
  const frames = curve.computeFrenetFrames(tubularSegments, false)
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const vertex = new THREE.Vector3()
  const normal = new THREE.Vector3()

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments
    const point = curve.getPointAt(t)
    const N = frames.normals[i]
    const B = frames.binormals[i]
    const ringRadius = t < taperFraction ? radius * (t / taperFraction) : radius

    for (let j = 0; j <= radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2
      const sin = Math.sin(angle)
      const cos = -Math.cos(angle)

      normal.x = cos * N.x + sin * B.x
      normal.y = cos * N.y + sin * B.y
      normal.z = cos * N.z + sin * B.z
      normal.normalize()
      normals.push(normal.x, normal.y, normal.z)

      vertex.x = point.x + ringRadius * normal.x
      vertex.y = point.y + ringRadius * normal.y
      vertex.z = point.z + ringRadius * normal.z
      positions.push(vertex.x, vertex.y, vertex.z)

      uvs.push(t, j / radialSegments)
    }
  }

  for (let j = 1; j <= tubularSegments; j++) {
    for (let i = 1; i <= radialSegments; i++) {
      const a = (radialSegments + 1) * (j - 1) + (i - 1)
      const b = (radialSegments + 1) * j + (i - 1)
      const c = (radialSegments + 1) * j + i
      const d = (radialSegments + 1) * (j - 1) + i

      indices.push(a, b, d)
      indices.push(b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()

  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

  return geometry
}

// Resolves any CSS colour (including oklch from the theme tokens) to an rgb() string three.js can parse.
const resolveRgb = (cssColor: string) => {
  const canvas = document.createElement('canvas')

  canvas.width = 1
  canvas.height = 1

  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) return 'rgb(0 0 0)'

  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)

  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data

  return `rgb(${r}, ${g}, ${b})`
}

type CardColors = { accent: string; rope: string }

type BandProps = {
  frontImage: string
  isMobile: boolean
  colors: CardColors
}

const Band = ({ frontImage, isMobile, colors }: BandProps) => {
  const rope = useRef<THREE.Mesh>(null!)
  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<LanyardRigidBody>(null!)
  const j2 = useRef<LanyardRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const cardQuat = new THREE.Quaternion()

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 1.5,
    linearDamping: 1.5
  }

  const frontTexture = useTexture(frontImage)
  const pinTexture = useTexture(PIN_IMAGE_URL)
  const cardGeometry = useMemo(() => buildCardFaceGeometry(), [])

  const cardMap = useMemo(() => {
    const width = Math.round(CARD_WIDTH * CARD_CANVAS_SCALE)
    const height = Math.round(CARD_HEIGHT * CARD_CANVAS_SCALE)
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    const image = frontTexture.image as HTMLImageElement

    if (ctx) {
      // Cover-fit the photo, then add the accent stripe along the top edge.
      const scale = Math.max(width / image.width, height / image.height)
      const dw = image.width * scale
      const dh = image.height * scale

      ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh)
      ctx.fillStyle = colors.accent
      ctx.fillRect(0, 0, width, height * ACCENT_STRIPE_HEIGHT_RATIO)
    }

    const texture = new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 16
    texture.needsUpdate = true

    return texture
  }, [frontTexture, colors.accent])

  const [curve] = useState(() => {
    const ropeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ])

    ropeCurve.curveType = 'chordal'

    return ropeCurve
  })

  const [dragged, drag] = useState<THREE.Vector3 | false>(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.85])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.85])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.85])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, CARD_ROPE_ANCHOR_Y, 0]
  ])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }

    if (fixed.current) {
      ;[j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current)
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())))

        lerped.lerp(ref.current.translation(), delta * 50 * clampedDistance)
      })

      // Keeps the rope glued to the pin at any card orientation.
      const cardPos = card.current.translation()
      const cardRot = card.current.rotation()

      cardQuat.set(cardRot.x, cardRot.y, cardRot.z, cardRot.w)
      curve.points[0]
        .set(0, CARD_ROPE_ANCHOR_Y + ROPE_TOP_EXTENSION, 0)
        .applyQuaternion(cardQuat)
        .add(vec.set(cardPos.x, cardPos.y, cardPos.z))
      curve.points[1].copy(getLerped(j2.current))
      curve.points[2].copy(getLerped(j1.current))
      curve.points[3].copy(fixed.current.translation())

      const oldRopeGeometry = rope.current.geometry

      rope.current.geometry = buildTaperedTubeGeometry(
        curve,
        isMobile ? 16 : 32,
        ROPE_RADIUS,
        ROPE_RADIAL_SEGMENTS,
        ROPE_TAPER_FRACTION
      )
      oldRopeGeometry.dispose()

      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation() as unknown as THREE.Vector3)
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
    }
  })

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type='fixed' />
        <RigidBody position={[0.425, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.85, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.275, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.7, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[1.42, 2.0, 0.018]} />
          <group
            scale={4}
            position={[0, -3.16, -0.09]}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).releasePointerCapture(e.pointerId)
              drag(false)
              document.body.style.userSelect = ''
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              ;(e.target as Element).setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation())))
              document.body.style.userSelect = 'none'
            }}
          >
            <mesh geometry={cardGeometry} position={[0, 0, 0.004]}>
              <meshBasicMaterial map={cardMap} toneMapped={false} />
            </mesh>
            <mesh geometry={cardGeometry} position={[0, 0, 0.001]} rotation={[0, Math.PI, 0]}>
              <meshBasicMaterial map={cardMap} toneMapped={false} />
            </mesh>
          </group>

          <mesh position={[PIN_PLANE_X, PIN_PLANE_Y, PIN_PLANE_Z]}>
            <planeGeometry args={[PIN_PLANE_WIDTH, PIN_PLANE_HEIGHT]} />
            <meshBasicMaterial map={pinTexture} transparent alphaTest={0.1} toneMapped={false} />
          </mesh>
        </RigidBody>
      </group>

      {/* Geometry is swapped imperatively each frame, so there is no JSX tubeGeometry child. */}
      <mesh ref={rope} frustumCulled={false}>
        <meshStandardMaterial color={colors.rope} roughness={0.55} metalness={0.15} />
      </mesh>
    </>
  )
}

const LIGHT = new THREE.Color().setRGB(1, 1, 1)

const StudioLighting = () => (
  <Environment blur={0.75}>
    <Lightformer intensity={2} color={LIGHT} position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer intensity={3} color={LIGHT} position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer intensity={3} color={LIGHT} position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
    <Lightformer
      intensity={10}
      color={LIGHT}
      position={[-10, 0, 14]}
      rotation={[0, Math.PI / 2, Math.PI / 3]}
      scale={[100, 10, 1]}
    />
  </Environment>
)

const REFERENCE_HEIGHT_PX = 520
const CAMERA_Z = 20
const CAMERA_FOV_DEG = 20
const WORLD_UNITS_PER_PX = (2 * CAMERA_Z * Math.tan((CAMERA_FOV_DEG / 2) * (Math.PI / 180))) ** -1
const PX_PER_WORLD_UNIT = REFERENCE_HEIGHT_PX * WORLD_UNITS_PER_PX
const TARGET_FROM_RIGHT_FRACTION = 0.3
const TARGET_FROM_RIGHT_FRACTION_AT_LG = 0.15
const LG_BREAKPOINT_PX = 1024
const XL_BREAKPOINT_PX = 1280

const CameraAlign = () => {
  useFrame(state => {
    const widthT = THREE.MathUtils.clamp(
      (state.size.width - LG_BREAKPOINT_PX) / (XL_BREAKPOINT_PX - LG_BREAKPOINT_PX),
      0,
      1
    )

    const targetFromRightFraction = THREE.MathUtils.lerp(
      TARGET_FROM_RIGHT_FRACTION_AT_LG,
      TARGET_FROM_RIGHT_FRACTION,
      widthT
    )

    const targetFromRightPx = targetFromRightFraction * state.size.width

    state.camera.position.x = (targetFromRightPx - state.size.width / 2) / PX_PER_WORLD_UNIT
    state.camera.position.z = CAMERA_Z * (state.size.height / REFERENCE_HEIGHT_PX)
  })

  return null
}

const IdCard = ({ frontImage, name, role, className }: { frontImage: string; name: string; role: string; className?: string }) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [contextLossKey, setContextLossKey] = useState(0)
  const [webglAvailable, setWebglAvailable] = useState(false)
  const eventSourceRef = useRef<HTMLElement | null>(typeof document !== 'undefined' ? document.body : null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    let renderer: THREE.WebGLRenderer | undefined

    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      setWebglAvailable(true)
    } catch {
      setWebglAvailable(false)
    } finally {
      renderer?.dispose()
      renderer?.forceContextLoss()
    }
  }, [])

  // Hidden elements that bridge resolved Tailwind theme colours into canvas / three.js.
  const primaryProbeRef = useRef<HTMLSpanElement>(null)
  const foregroundProbeRef = useRef<HTMLSpanElement>(null)
  const [colors, setColors] = useState<CardColors>({ accent: 'currentColor', rope: 'currentColor' })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const updateColors = () => {
      if (!primaryProbeRef.current || !foregroundProbeRef.current) return

      const accent = resolveRgb(getComputedStyle(primaryProbeRef.current).fill)
      const rope = resolveRgb(getComputedStyle(foregroundProbeRef.current).fill)

      setColors(prev => (prev.accent === accent && prev.rope === rope ? prev : { accent, rope }))
    }

    updateColors()

    // Watches ancestors' class/style so light/dark switches re-colour the card and rope.
    const observers: MutationObserver[] = []

    for (let node: HTMLElement | null = primaryProbeRef.current; node; node = node.parentElement) {
      const observer = new MutationObserver(updateColors)

      observer.observe(node, { attributes: true, attributeFilter: ['class', 'style'] })
      observers.push(observer)
    }

    return () => observers.forEach(observer => observer.disconnect())
  }, [])

  const staticCard = (
    <div className='hero-id-fallback'>
      <img src={frontImage} alt='' />
      <div className='hero-id-fallback-copy'>
        <span>Interactive portfolio · ID 01</span>
        <h2>{name}</h2>
        <p>{role}</p>
      </div>
    </div>
  )

  return (
    <div aria-hidden='true' className={cn('pointer-events-none drop-shadow-xl', className)}>
      <span ref={primaryProbeRef} className='fill-primary hidden' />
      <span ref={foregroundProbeRef} className='fill-foreground hidden' />
      {webglAvailable ? (
        <Canvas
          key={contextLossKey}
        eventSource={eventSourceRef as RefObject<HTMLElement>}
        camera={{ position: [0, 0, 20], fov: 20 }}
        dpr={[1, isMobile ? 1.25 : 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        fallback={staticCard}
        onCreated={state => {
          state.gl.setClearAlpha(0)

          state.gl.domElement.addEventListener('webglcontextlost', event => {
            event.preventDefault()
            setContextLossKey(key => key + 1)
          })

          // Pointer NDC from the canvas's own rect, since eventSource is document.body.
          state.setEvents({
            compute: (event, s) => {
              const rect = s.gl.domElement.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top

              s.pointer.set((x / s.size.width) * 2 - 1, -(y / s.size.height) * 2 + 1)
              s.raycaster.setFromCamera(s.pointer, s.camera)
            }
          })
        }}
      >
        <CameraAlign />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band frontImage={frontImage} isMobile={isMobile} colors={colors} />
        </Physics>
        <StudioLighting />
        </Canvas>
      ) : staticCard}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Greeting rotator                             */
/* -------------------------------------------------------------------------- */

const GreetingWord = ({ greetings, intervalMs = 2200 }: { greetings: string[]; intervalMs?: number }) => {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || greetings.length < 2) return

    const timer = setInterval(() => setIndex(prev => (prev + 1) % greetings.length), intervalMs)

    return () => clearInterval(timer)
  }, [greetings.length, intervalMs, reduceMotion])

  return (
    <>
      <span className='sr-only'>{greetings[0]}</span>
      <span aria-hidden='true' className='mr-2 inline-grid overflow-hidden align-bottom'>
        {/* Invisible sizers reserve space for the widest greeting so surrounding text doesn't shift */}
        {greetings.map(word => (
          <span key={word} className='invisible col-start-1 row-start-1 whitespace-nowrap'>
            {word}
          </span>
        ))}

        <AnimatePresence mode='popLayout' initial={false}>
          <motion.span
            key={greetings[index]}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className='col-start-1 row-start-1 inline-block whitespace-nowrap'
          >
            {greetings[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Marquee                                   */
/* -------------------------------------------------------------------------- */

const MARQUEE_REPEAT = 4
const MARQUEE_GAP_REM = 2

const LogoTile = ({ logo, decorative }: { logo: BrandLogo; decorative: boolean }) => {
  const [imageFailed, setImageFailed] = useState(false)
  const mark = logo.name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('') || logo.name.slice(0, 2)

  return (
    <div className='bg-muted flex size-16 shrink-0 items-center justify-center rounded-md' title={logo.name}>
      {imageFailed ? (
        <span className='logo-mark-fallback' role='img' aria-label={decorative ? undefined : logo.name}>{mark}</span>
      ) : (
        <img src={logo.image} alt={decorative ? '' : logo.name} loading='lazy' className='size-10 object-contain grayscale' onError={() => setImageFailed(true)} />
      )}
    </div>
  )
}

const LogoMarquee = ({ logos, durationSeconds = 25 }: { logos: BrandLogo[]; durationSeconds?: number }) => (
  <div
    className='group flex overflow-hidden p-3'
    style={{ gap: `${MARQUEE_GAP_REM}rem` }}
    role='group'
    aria-label='Technology stack'
  >
    <style>{`@keyframes hero-section-44-marquee{from{transform:translateX(0)}to{transform:translateX(calc(-100% - ${MARQUEE_GAP_REM}rem))}}@media (prefers-reduced-motion:reduce){.hero-section-44-marquee{animation:none!important}}`}</style>
    {Array.from({ length: MARQUEE_REPEAT }, (_, copy) => (
      <div
        key={copy}
        aria-hidden={copy > 0 || undefined}
        className='hero-section-44-marquee flex shrink-0 justify-around group-hover:[animation-play-state:paused]'
        style={{
          gap: `${MARQUEE_GAP_REM}rem`,
          animation: `hero-section-44-marquee ${durationSeconds}s linear infinite`
        }}
      >
        {logos.map((logo, index) => (
          <LogoTile key={`${logo.image}-${index}`} logo={logo} decorative={copy > 0} />
        ))}
      </div>
    ))}
  </div>
)

/* -------------------------------------------------------------------------- */
/*                                 Hero section                               */
/* -------------------------------------------------------------------------- */

export type BrandLogo = {
  image: string
  name: string
}

export type ActionLink = {
  label: string
  href: string
}

export type HeroSection44Props = {
  greetings?: string[]
  name?: string
  role?: string
  description?: ReactNode
  availabilityLabel?: string
  profileImage?: string
  downloadAction?: ActionLink
  connectAction?: ActionLink
  brandLogos?: BrandLogo[]
  className?: string
}

// Fallbacks so the component still renders when mounted without props (e.g. in a preview sandbox).
const CDN_BASE = 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/zolt'

const DEFAULT_BRAND_LOGOS: BrandLogo[] = Array.from({ length: 20 }, (_, index) => {
  const position = String(index + 1).padStart(2, '0')

  return { image: `${CDN_BASE}/logo-${position}.png`, name: `Tech stack logo ${position}` }
})

export const HeroSection44 = ({
  greetings = ['Hello', 'नमस्ते', '你好', 'Ciao'],
  name = 'Zolt',
  role = 'Design engineer',
  description = "Design engineer based in Austin. I don't just bridge design and engineering - I own the entire experience, from the first sketch to the final shipped product.",
  availabilityLabel = 'Available',
  profileImage = `${CDN_BASE}/profile.png`,
  downloadAction = { label: 'Download CV', href: '#' },
  connectAction = { label: "Let's connect", href: '#' },
  brandLogos = DEFAULT_BRAND_LOGOS,
  className
}: HeroSection44Props) => {
  return (
    <section className={cn('bg-background text-foreground overflow-x-clip lg:relative', className)}>
      <div className='max-sm:pt-20 sm:py-16 lg:pt-32 lg:pb-24'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
          <div className='space-y-6 lg:max-w-lg'>
            <span className='bg-card text-primary border-border inline-flex h-6.5 w-fit items-center gap-1 rounded-full border px-2 text-xs font-medium'>
              <span className='relative inline-flex size-1.5' aria-hidden='true'>
                <span className='bg-primary/40 absolute -inset-0.5 rounded-full opacity-75 motion-safe:animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]' />
                <span className='bg-primary relative inline-flex size-1.5 rounded-full' />
              </span>
              {availabilityLabel}
            </span>

            <h1 className='mb-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[64px] lg:font-bold'>
              <GreetingWord greetings={greetings} />I am {name}
            </h1>

            <p className='text-muted-foreground text-xl font-medium sm:text-2xl lg:text-3xl'>{role}</p>

            <p className='text-muted-foreground mb-8 max-w-2xl text-base'>{description}</p>

            <div className='flex items-center gap-2.5 pt-2'>
              <a
                href={downloadAction.href}
                className={cn(
                  'border-border bg-background hover:bg-muted inline-flex h-11 items-center justify-center rounded-full border px-4 text-base font-medium whitespace-nowrap transition-colors',
                  focusRing
                )}
              >
                {downloadAction.label}
              </a>

              <a
                href={connectAction.href}
                className={cn(
                  'border-border bg-card group inline-flex h-11 items-center justify-center gap-2.5 rounded-full border pr-4 pl-4 text-base font-medium whitespace-nowrap shadow-sm transition-[padding] duration-300 hover:pl-2 focus-visible:pl-2',
                  focusRing
                )}
              >
                <span className='bg-primary relative flex size-2.5 items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:size-6.5 group-focus-visible:size-6.5'>
                  <ArrowRightIcon
                    aria-hidden='true'
                    className='text-primary-foreground absolute size-4.5 -translate-x-3 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
                  />
                </span>
                {connectAction.label}
              </a>
            </div>
          </div>
        </div>
      </div>

      <IdCard
        frontImage={profileImage}
        name={name}
        role={role}
        className='mx-auto mt-8 aspect-4/5 w-full max-w-80 max-lg:hidden lg:absolute lg:-top-31 lg:right-0 lg:left-0 lg:z-10 lg:mt-0 lg:aspect-auto lg:h-182 lg:max-w-none'
      />

      <div className='relative mx-auto mt-10 mb-10 w-full max-w-5xl'>
        <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-1 w-16 bg-linear-to-r to-transparent sm:w-35' />
        <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-1 w-16 bg-linear-to-l to-transparent sm:w-35' />
        <div className='mx-auto w-full max-w-5xl overflow-hidden'>
          <LogoMarquee logos={brandLogos} />
        </div>
      </div>
    </section>
  )
}

export default HeroSection44
