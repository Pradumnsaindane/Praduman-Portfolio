import { useEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'

interface ThermodynamicGridProps extends HTMLAttributes<HTMLDivElement> {
  resolution?: number
  coolingFactor?: number
}

const ThermodynamicGrid = ({
  className,
  coolingFactor = 0.98,
  resolution = 25,
  style,
  ...props
}: ThermodynamicGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const context = canvas?.getContext('2d', { alpha: false })

    if (!canvas || !container || !context) return

    const cellSize = Math.max(8, resolution)
    const decay = Math.min(0.999, Math.max(0.8, coolingFactor))
    const desktopViewport = window.matchMedia('(min-width: 1024px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 1
    let height = 1
    let columns = 1
    let rows = 1
    let temperatures = new Float32Array(1)
    let animationFrame = 0
    let isVisible = false
    let previousPoint: { x: number; y: number } | null = null

    const drawStaticGrid = () => {
      context.fillStyle = '#050505'
      context.fillRect(0, 0, width, height)
      context.fillStyle = '#242424'

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          context.fillRect(
            column * cellSize + cellSize / 2 - 1,
            row * cellSize + cellSize / 2 - 1,
            2,
            2
          )
        }
      }
    }

    const hasHeat = () => temperatures.some(temperature => temperature > 0.045)

    const requestDraw = () => {
      if (
        animationFrame ||
        !isVisible ||
        document.visibilityState !== 'visible' ||
        !desktopViewport.matches ||
        reducedMotion.matches
      ) return

      animationFrame = window.requestAnimationFrame(drawFrame)
    }

    const drawFrame = () => {
      animationFrame = 0
      context.fillStyle = '#050505'
      context.fillRect(0, 0, width, height)
      let heatRemains = false

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = column + row * columns
          const temperature = temperatures[index]

          if (temperature > 0.045) {
            const value = Math.round(24 + temperature * 231)
            const opacity = 0.12 + temperature * 0.78
            const size = cellSize * (0.8 + temperature * 0.5)
            const offset = (cellSize - size) / 2

            context.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity})`
            context.fillRect(column * cellSize + offset, row * cellSize + offset, size, size)

            temperatures[index] = temperature * decay
            if (temperatures[index] > 0.045) heatRemains = true
          } else {
            temperatures[index] = 0
            context.fillStyle = '#242424'
            context.fillRect(
              column * cellSize + cellSize / 2 - 1,
              row * cellSize + cellSize / 2 - 1,
              2,
              2
            )
          }
        }
      }

      if (heatRemains) requestDraw()
    }

    const addHeat = (x: number, y: number) => {
      const centerColumn = Math.floor(x / cellSize)
      const centerRow = Math.floor(y / cellSize)
      const radius = 2

      for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
        for (let columnOffset = -radius; columnOffset <= radius; columnOffset++) {
          const column = centerColumn + columnOffset
          const row = centerRow + rowOffset

          if (column < 0 || column >= columns || row < 0 || row >= rows) continue

          const distance = Math.hypot(columnOffset, rowOffset)
          if (distance > radius) continue

          const index = column + row * columns
          temperatures[index] = Math.min(1, temperatures[index] + 0.3 * (1 - distance / radius))
        }
      }
    }

    const resize = () => {
      const bounds = container.getBoundingClientRect()
      width = Math.max(1, Math.floor(bounds.width))
      height = Math.max(1, Math.floor(bounds.height))

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      columns = Math.ceil(width / cellSize)
      rows = Math.ceil(height / cellSize)
      temperatures = new Float32Array(columns * rows)
      previousPoint = null
      drawStaticGrid()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (
        event.pointerType === 'touch' ||
        !isVisible ||
        document.visibilityState !== 'visible' ||
        !desktopViewport.matches ||
        reducedMotion.matches
      ) return

      const bounds = container.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top

      if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) {
        previousPoint = null
        return
      }

      if (!previousPoint) {
        previousPoint = { x, y }
        addHeat(x, y)
        requestDraw()
        return
      }

      const deltaX = x - previousPoint.x
      const deltaY = y - previousPoint.y
      const steps = Math.min(64, Math.max(1, Math.ceil(Math.hypot(deltaX, deltaY) / (cellSize / 2))))

      for (let step = 0; step <= steps; step++) {
        const progress = step / steps
        addHeat(previousPoint.x + deltaX * progress, previousPoint.y + deltaY * progress)
      }

      previousPoint = { x, y }
      requestDraw()
    }

    const handlePointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) previousPoint = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        previousPoint = null
        return
      }

      if (hasHeat()) requestDraw()
      else drawStaticGrid()
    }

    const handleMotionPreferenceChange = () => {
      if (!desktopViewport.matches || reducedMotion.matches) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        previousPoint = null
        temperatures.fill(0)
        drawStaticGrid()
        return
      }

      if (hasHeat()) requestDraw()
    }

    const resizeObserver = new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting

      if (!isVisible) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        previousPoint = null
        return
      }

      if (hasHeat()) requestDraw()
      else drawStaticGrid()
    }, { rootMargin: '80px' })

    resizeObserver.observe(container)
    intersectionObserver.observe(container)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerout', handlePointerOut)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    desktopViewport.addEventListener('change', handleMotionPreferenceChange)
    reducedMotion.addEventListener('change', handleMotionPreferenceChange)
    resize()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerout', handlePointerOut)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      desktopViewport.removeEventListener('change', handleMotionPreferenceChange)
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [coolingFactor, resolution])

  const rootClassName = [
    'pointer-events-none absolute inset-0 z-0 overflow-hidden',
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      {...props}
      ref={containerRef}
      aria-hidden='true'
      className={rootClassName}
      style={style}
    >
      <canvas ref={canvasRef} aria-hidden='true' className='block h-full w-full' />
    </div>
  )
}

export default ThermodynamicGrid
