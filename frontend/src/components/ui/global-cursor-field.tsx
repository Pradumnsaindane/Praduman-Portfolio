import { useEffect } from 'react'

type Point = { x: number; y: number }

let initialized = false

function initGlobalCursorField() {
  if (initialized) return
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  initialized = true

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

  if (!finePointer.matches || reducedMotion.matches) return

  const canvas = document.createElement('canvas')
  canvas.className = 'global-cursor-field'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)

  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return

  let width = 0
  let height = 0
  let pixelRatio = 1
  let animationFrame = 0
  let isVisible = document.visibilityState === 'visible'
  const trail: Point[] = []
  const maxTrail = 36
  let hasPointer = false
  let movedThisFrame = false
  let stationaryFrames = 0

  const resize = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(1, window.innerWidth)
    height = Math.max(1, window.innerHeight)
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  const supported = () => finePointer.matches && !reducedMotion.matches

  const clear = () => {
    context.clearRect(0, 0, width, height)
  }

  const draw = () => {
    animationFrame = 0

    if (!isVisible || !supported()) {
      clear()
      trail.length = 0
      hasPointer = false
      movedThisFrame = false
      return
    }

    if (!movedThisFrame) {
      stationaryFrames += 1
      if (stationaryFrames > 18 && trail.length > 0) {
        trail.shift()
        stationaryFrames = 0
      }
    } else {
      stationaryFrames = 0
    }
    movedThisFrame = false

    clear()

    if (hasPointer && trail.length > 0) {
      const length = trail.length

      for (let index = 1; index < length; index += 1) {
        const previous = trail[index - 1]
        const current = trail[index]
        const progress = index / length
        const alpha = 0.08 + progress * 0.18

        context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        context.lineWidth = 8 + progress * 10
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.beginPath()
        context.moveTo(previous.x, previous.y)
        context.lineTo(current.x, current.y)
        context.stroke()
      }

      for (let index = 1; index < length; index += 1) {
        const previous = trail[index - 1]
        const current = trail[index]
        const progress = index / length
        const alpha = 0.25 + progress * 0.65

        context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        context.lineWidth = 1 + progress * 2
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.beginPath()
        context.moveTo(previous.x, previous.y)
        context.lineTo(current.x, current.y)
        context.stroke()
      }

      const head = trail[length - 1]
      const gradient = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.beginPath()
      context.arc(head.x, head.y, 16, 0, Math.PI * 2)
      context.fill()
    }

    if (trail.length > 0) {
      animationFrame = window.requestAnimationFrame(draw)
    } else {
      animationFrame = 0
    }
  }

  const requestDraw = () => {
    if (animationFrame || !isVisible || !supported()) return
    animationFrame = window.requestAnimationFrame(draw)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !supported()) {
      trail.length = 0
      clear()
      hasPointer = false
      return
    }

    hasPointer = true
    movedThisFrame = true
    trail.push({ x: event.clientX, y: event.clientY })
    if (trail.length > maxTrail) trail.shift()
    requestDraw()
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !supported()) return
    hasPointer = true
    movedThisFrame = true
    trail.push({ x: event.clientX, y: event.clientY })
    if (trail.length > maxTrail) trail.shift()
    requestDraw()
  }

  const handlePointerOut = (event: PointerEvent) => {
    if (!event.relatedTarget) {
      hasPointer = false
    }
  }

  const handleVisibilityChange = () => {
    isVisible = document.visibilityState === 'visible'
    if (!isVisible) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      trail.length = 0
      clear()
      return
    }
    if (trail.length > 0) requestDraw()
  }

  const handleCapabilityChange = () => {
    if (!supported()) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      trail.length = 0
      clear()
      hasPointer = false
      canvas.style.display = 'none'
    } else {
      canvas.style.display = ''
    }
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
  window.addEventListener('pointerout', handlePointerOut)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  finePointer.addEventListener('change', handleCapabilityChange)
  reducedMotion.addEventListener('change', handleCapabilityChange)

}

export default function GlobalCursorField() {
  useEffect(() => {
    initGlobalCursorField()
  }, [])

  return null
}
