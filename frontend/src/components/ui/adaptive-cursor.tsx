import { useEffect, useRef } from 'react'

type CursorTone = 'light' | 'dark' | 'mixed'

type ParsedColor = {
  red: number
  green: number
  blue: number
  alpha: number
}

const TEXT_ENTRY_SELECTOR = 'input, textarea, [contenteditable="true"], [role="textbox"]'
const CURSOR_TONES: CursorTone[] = ['light', 'dark', 'mixed']

function parseColor(value: string): ParsedColor | null {
  const channels = value.match(/rgba?\(([^)]+)\)/i)?.[1]
  if (!channels) return null

  const values = channels.split(/[\s,/]+/).filter(Boolean).map(Number)
  if (values.length < 3 || values.slice(0, 3).some((channel) => !Number.isFinite(channel))) return null

  return {
    red: values[0],
    green: values[1],
    blue: values[2],
    alpha: values[3] ?? 1,
  }
}

function getLuminance({ red, green, blue }: ParsedColor) {
  const linearize = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue)
}

function getTone(color: ParsedColor): CursorTone {
  const luminance = getLuminance(color)
  if (luminance < 0.3) return 'dark'
  if (luminance > 0.7) return 'light'
  return 'mixed'
}

function getBackgroundTone(target: Element | null): CursorTone {
  let current = target

  while (current) {
    const before = parseColor(window.getComputedStyle(current, '::before').backgroundColor)
    if (before && before.alpha > 0.72) return getTone(before)

    const background = parseColor(window.getComputedStyle(current).backgroundColor)
    if (background && background.alpha > 0.72) return getTone(background)

    current = current.parentElement
  }

  return 'mixed'
}

function getCursorState(target: Element | null) {
  if (target?.closest(TEXT_ENTRY_SELECTOR)) return 'typing'
  if (target?.closest('.id-card-photo')) return 'card'
  if (target?.closest('.project-name, .project-row')) return 'project'
  if (target?.closest('button, [role="button"]')) return 'button'
  if (target?.closest('a, [data-cur]')) return 'link'
  return 'default'
}

function placeAt(element: HTMLElement | null, x: number, y: number) {
  if (!element) return
  element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
}

export default function AdaptiveCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)
  const trailRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const head = headRef.current
    const trail = trailRef.current
    const label = labelRef.current
    if (!cursor || !head || !trail || !label) return

    const root = document.documentElement
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let targetX = -100
    let targetY = -100
    let currentX = targetX
    let currentY = targetY
    let trailX = targetX
    let trailY = targetY
    let animationFrame = 0
    let toneCheckedAt = Number.NEGATIVE_INFINITY
    let clickTimer = 0

    const supported = () => finePointer.matches && !reducedMotion.matches

    const setTone = (tone: CursorTone) => {
      for (const value of CURSOR_TONES) cursor.classList.toggle(`tone-${value}`, value === tone)
    }

    const setCursorState = (target: Element | null) => {
      const state = getCursorState(target)
      cursor.dataset.state = state
      cursor.classList.toggle('is-typing', state === 'typing')
      label.textContent = target?.closest('[data-cur]')?.getAttribute('data-cur')?.trim() ?? ''
      cursor.classList.toggle('has-label', label.textContent.length > 0)
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.34
      currentY += (targetY - currentY) * 0.34
      trailX += (currentX - trailX) * 0.16
      trailY += (currentY - trailY) * 0.16
      placeAt(head, currentX, currentY)
      placeAt(trail, trailX, trailY)

      const headIsSettled = Math.abs(targetX - currentX) < 0.15 && Math.abs(targetY - currentY) < 0.15
      const trailIsSettled = Math.abs(currentX - trailX) < 0.2 && Math.abs(currentY - trailY) < 0.2
      if (headIsSettled && trailIsSettled) {
        currentX = targetX
        currentY = targetY
        trailX = currentX
        trailY = currentY
        placeAt(head, currentX, currentY)
        placeAt(trail, trailX, trailY)
        animationFrame = 0
        return
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    const hide = () => {
      cursor.classList.remove('is-visible', 'is-pressed', 'is-clicking', 'is-typing', 'has-label')
      root.classList.remove('has-adaptive-cursor')
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      window.clearTimeout(clickTimer)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !supported()) {
        hide()
        return
      }

      targetX = event.clientX
      targetY = event.clientY
      root.classList.add('has-adaptive-cursor')
      cursor.classList.add('is-visible')
      setCursorState(event.target instanceof Element ? event.target : document.elementFromPoint(targetX, targetY))

      const now = performance.now()
      if (now - toneCheckedAt > 90) {
        setTone(getBackgroundTone(document.elementFromPoint(targetX, targetY)))
        toneCheckedAt = now
      }

      if (!animationFrame) {
        currentX = targetX
        currentY = targetY
        if (trailX < 0) {
          trailX = targetX
          trailY = targetY
        }
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !supported()) {
        hide()
        return
      }

      cursor.classList.add('is-pressed', 'is-clicking')
      window.clearTimeout(clickTimer)
      clickTimer = window.setTimeout(() => cursor.classList.remove('is-clicking'), 420)
    }

    const handlePointerUp = () => cursor.classList.remove('is-pressed')
    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hide()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') hide()
    }
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.closest(TEXT_ENTRY_SELECTOR)) {
        setCursorState(event.target)
      }
    }
    const handleFocusOut = () => {
      setCursorState(document.elementFromPoint(targetX, targetY))
    }
    const handleCapabilityChange = () => {
      if (!supported()) hide()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerUp, { passive: true })
    window.addEventListener('pointerout', handlePointerOut)
    window.addEventListener('blur', hide)
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    finePointer.addEventListener('change', handleCapabilityChange)
    reducedMotion.addEventListener('change', handleCapabilityChange)

    return () => {
      hide()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('blur', hide)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      finePointer.removeEventListener('change', handleCapabilityChange)
      reducedMotion.removeEventListener('change', handleCapabilityChange)
    }
  }, [])

  return (
    <div className="adaptive-cursor" ref={cursorRef} aria-hidden="true">
      <span className="adaptive-cursor__trail" ref={trailRef} />
      <span className="adaptive-cursor__head" ref={headRef}>
        <span className="adaptive-cursor__glow" />
        <span className="adaptive-cursor__ring" />
        <span className="adaptive-cursor__core" />
        <span className="adaptive-cursor__label" ref={labelRef} />
      </span>
    </div>
  )
}
