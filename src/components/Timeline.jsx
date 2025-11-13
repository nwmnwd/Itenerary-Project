import { useState, useRef } from 'react'
import CardInfo from './CardInfo.jsx'

export default function Timeline({ items = [] }) {
  // currentIndex: the index of the "current" step (outlined with dot)
  // completedUpTo: highest index that has been completed (shows check)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedUpTo, setCompletedUpTo] = useState(-1)
  const refs = useRef([])

  refs.current = items.map((_, i) => refs.current[i] ?? null)

  function handleStepClick(i) {
    if (i <= completedUpTo) {
      // clicking a previously completed step: make it the current step
      setCurrentIndex(i)
      setCompletedUpTo(i - 1)
      const el = refs.current[i]
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // mark clicked step as done, advance current to next step (or stay on last)
    setCompletedUpTo(prev => Math.max(prev, i))
    const next = i + 1 < items.length ? i + 1 : i
    setCurrentIndex(next)

    const el = refs.current[next]
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // layout constants used to position buttons and draw the connector
  const rowHeight = 260
  const btnCenterOffset = 26 // approx top padding (2) + half button (24)
  const lineTop = btnCenterOffset
  const lineBottom = items.length > 0 ? (items.length - 1) * rowHeight + btnCenterOffset : 0
  const totalHeight = items.length > 0 ? items.length * rowHeight + 24 : 0

  return (
    <div className="mx-8 mt-5 mb-8">
      <div className="flex gap-4 relative">
        {/* Left column: timeline with buttons and connecting line */}
        <div className="relative" style={{ width: '48px', minHeight: `${totalHeight}px` }}>
          {/* SVG line connecting all buttons */}
          <svg
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
            height={totalHeight}
            style={{ minHeight: totalHeight }}
            aria-hidden
            preserveAspectRatio="none"
          >
            {items.length > 1 && (
              <>
                {/* base gray line - stops at the center of the last button so there's no tail under final step */}
                <line x1="24" y1={lineTop} x2="24" y2={lineBottom} stroke="#e5e7eb" strokeWidth="3" />
                {/* completed violet line - clamp to same bottom so it never extends past final step */}
                {completedUpTo >= 0 && (
                  <line
                    x1="24"
                    y1={lineTop}
                    x2="24"
                    y2={Math.min(lineBottom, completedUpTo * rowHeight + btnCenterOffset)}
                    stroke="#6d28d9"
                    strokeWidth="4"
                  />
                )}
              </>
            )}
          </svg>

          {/* Buttons - positioned to align with time labels */}
          {items.map((it, i) => (
            <div
              key={i}
              className="absolute z-10"
              style={{ top: `${i * 260 + 2}px`, left: '50%', transform: 'translateX(-50%)' }}
            >
              <button
                type="button"
                onClick={() => handleStepClick(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-0 focus:outline-none shrink-0 transition-all ${
                  i <= completedUpTo
                    ? 'bg-violet-600 text-white'
                    : i === currentIndex
                    ? 'bg-white border-4 border-violet-300'
                    : 'bg-gray-300'
                }`}
              >
                {i <= completedUpTo ? (
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i === currentIndex ? (
                  <span className="h-3 w-3 rounded-full bg-violet-600 inline-block" />
                ) : null}
              </button>
            </div>
          ))}
        </div>

        {/* Right column: time + cards */}
        <div className="flex-1 flex flex-col gap-0">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-3" style={{ minHeight: '260px' }}>
              <div ref={el => (refs.current[i] = el)} className="flex-1">
                <div className="text-md font-semibold text-gray-900 mb-3" style={{ marginTop: '4px' }}>{it.time}</div>
                <CardInfo
                  title={it.title}
                  location={it.location}
                  isActive={i === currentIndex}
                  onClick={() => handleStepClick(i)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
