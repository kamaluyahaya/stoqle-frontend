"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type SlideItem =
  | { type?: "image"; img: string; text?: string }
  | { type: "video"; video: string; cover?: string; text?: string }

const slides: { label: string; items: SlideItem[] }[] = [
  {
    label: "Sell online and in person.",
    items: [

      { type: "video", video: "/videos/buy2.mp4", cover: "/images/online2.webp", text: "Seamless checkout demo" },
            { type: "image", img: "/images/inperson1.jpg", text: "Point of Sale made easy" },
      { type: "image", img: "/images/online3.png", text: "Mobile-friendly selling" },
    ],
  },
  {
    label: "Sell locally and nationwide.",
    items: [
      { type: "image", img: "/images/bought.jpg", text: "Multi-currency support" },
      { type: "video", video: "/videos/sell.mp4",  cover:"/images/globally.jpg", text: "Global shipping options"  },
      { type: "image", img: "/images/online2.webp", text: "Localized storefronts" },
    ],
  },
  {
    label: "Sell direct and wholesale.",
    items: [
      { type: "image", img: "/images/online4.webp", text: "Wholesale pricing" },
      { type: "image", img: "/images/inperson2.jpg", text: "Bulk ordering made simple" },
            { type: "video", video: "/videos/sell3.mp4",  cover:"/images/globally.jpg", text: "Global shipping options"  },
    ],
  },
  {
    label: "Sell on desktop and mobile.",
    items: [
      { type: "image", img: "/images/purchase.jpg", text: "Responsive design" },
      { type: "image", img: "/images/desktop.png", text: "Cross-device sync" },
      { type: "video", video: "/videos/bg.mp4",  cover:"/images/globally.jpg", text: "Global shipping options"  },
    ],
  },
]


export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [playingMap, setPlayingMap] = useState<Record<string, boolean>>({})
  const INTERVAL_MS = 5000
  const TRANSITION_DURATION = 0.6

  const timerRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const videoListeners = useRef<Record<string, { onPlay: () => void; onPause: () => void }>>({})

  const startTimer = () => {
    stopTimer()
    // guard: don't start if there are no slides (avoid modulo by 0)
    if (!slides || slides.length === 0) return
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => {
        // double-check slides length here so we don't divide by 0
        const len = slides.length || 1
        return (prev + 1) % len
      })
    }, INTERVAL_MS)
  }
  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    startTimer()
    return () => stopTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // clamp index when slides length changes (safety)
  useEffect(() => {
    if (index >= slides.length) setIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length])

  const pause = () => {
    isPausedRef.current = true
    stopTimer()
  }
  const resume = () => {
    if (!isPausedRef.current) return
    isPausedRef.current = false
    startTimer()
  }

  const handleTabClick = (i: number) => {
    setIndex(i)
    if (!isPausedRef.current) startTimer()
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onMouseEnter = () => pause()
    const onMouseLeave = () => resume()
    const onTouchStart = () => pause()
    const onTouchEnd = () => setTimeout(() => resume(), 300)

    el.addEventListener("mouseenter", onMouseEnter)
    el.addEventListener("mouseleave", onMouseLeave)
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter)
      el.removeEventListener("mouseleave", onMouseLeave)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  // helper to assign video refs
  const setVideoRef = (key: string) => (el: HTMLVideoElement | null) => {
    const prevListeners = videoListeners.current[key]
    const prevEl = videoRefs.current[key]
    if (prevEl && prevListeners) {
      prevEl.removeEventListener("play", prevListeners.onPlay)
      prevEl.removeEventListener("pause", prevListeners.onPause)
      delete videoListeners.current[key]
    }

    if (el) {
      videoRefs.current[key] = el
      el.muted = true
      el.loop = true
      el.playsInline = true

      const onPlay = () => setPlayingMap((p) => ({ ...p, [key]: true }))
      const onPause = () => setPlayingMap((p) => ({ ...p, [key]: false }))

      el.addEventListener("play", onPlay)
      el.addEventListener("pause", onPause)
      videoListeners.current[key] = { onPlay, onPause }
    } else {
      delete videoRefs.current[key]
      setPlayingMap((p) => {
        const np = { ...p }
        delete np[key]
        return np
      })
    }
  }

  const pauseAllVideos = () => {
    Object.entries(videoRefs.current).forEach(([k, v]) => {
      try {
        v?.pause()
        if (v) {
          v.currentTime = 0
          v.controls = false
        }
      } catch (e) {
        /* ignore */
      }
    })
    setPlayingMap({})
  }

  // play attempt when slide changes; use safe access to items
  useEffect(() => {
    pauseAllVideos()

    const items = slides[index]?.items ?? []
    items.forEach((item, i) => {
      if ("type" in item && item.type === "video") {
        const key = `${index}-${i}`
        const videoEl = videoRefs.current[key]
        if (videoEl) {
          videoEl.muted = true
          videoEl.loop = true
          videoEl.playsInline = true
          videoEl.controls = false
          const p = videoEl.play()
          if (p && p instanceof Promise) {
            p.catch(() => {
              // browser blocked autoplay; user can tap to play
            })
          }
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    return () => {
      Object.entries(videoListeners.current).forEach(([k, listeners]) => {
        const el = videoRefs.current[k]
        if (el) {
          el.removeEventListener("play", listeners.onPlay)
          el.removeEventListener("pause", listeners.onPause)
        }
      })
    }
  }, [])

  const toggleVideoPlay = (key: string) => {
    const v = videoRefs.current[key]
    if (!v) return
    if (v.paused) {
      v.muted = true
      const p = v.play()
      if (p && p instanceof Promise) {
        p.catch(() => {
          // blocked
        })
      }
      v.controls = true
      setPlayingMap((p) => ({ ...p, [key]: true }))
    } else {
      v.pause()
      v.controls = false
      setPlayingMap((p) => ({ ...p, [key]: false }))
    }
  }
useEffect(() => {
  if (slides.length === 0) return
  // only update if different
  setIndex(prev => (prev >= slides.length ? 0 : prev))
}, [slides.length])
  const smallPos = index % 3
  const gridColsClass =
    smallPos === 0
      ? "md:grid-cols-[minmax(140px,0.8fr)_1fr_1fr]"
      : smallPos === 1
      ? "md:grid-cols-[1fr_minmax(140px,0.8fr)_1fr]"
      : "md:grid-cols-[1fr_1fr_minmax(140px,0.8fr)]"

  // safe read of current items
  const currentItems = slides[index]?.items ?? []

  return (
    <section aria-label="Hero summary" className="relative z-20 -mt-10 md:-mt-30 lg:-mt-35">
      <div className="mx-auto">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className="bg-white/95 text-black rounded-t-4xl p-8 md:p-10 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto lg:pt-10 pt-10">
            <h2 className="text-3xl md:text-6xl font-semibold leading-tight">The one commerce platform behind it all</h2>

            <nav aria-label="Hero tabs" className="mt-6">
              <p className="text-xl lg:text-4xl md:text-2xl leading-tight whitespace-normal break-words">
                {slides.map((slide, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleTabClick(i)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleTabClick(i)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`inline align-baseline no-underline px-0 py-0 focus:outline-none ${index === i ? "font-semibold" : "text-black/70"}`}
                    aria-current={index === i ? "true" : "false"}
                  >
                    <span className="whitespace-normal break-words leading-tight">{slide.label}</span>
                    {i < slides.length - 1 && " "}
                  </a>
                ))}
              </p>
            </nav>
          </div>

          <div ref={containerRef} className="mt-8 relative overflow-hidden max-w-7xl mx-auto" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: TRANSITION_DURATION }}
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${gridColsClass}`}
              >
                {currentItems.map((item, i) => {
                  const key = `${index}-${i}`
                  const isPlaying = !!playingMap[key]

                  return (
                    <div key={i} className="relative flex flex-col text-center bg-white rounded-2xl p-2 transition-all duration-500">
                      {(!("type" in item) || item.type === "image") && (
                        <>
                          <img src={item.img} alt={item.text ?? ""} className="w-full h-64 md:h-80 object-cover rounded-xl mb-4" draggable={false} />
                          <p className="text-sm md:text-base font-medium text-black/80">{item.text}</p>
                        </>
                      )}

                      {"type" in item && item.type === "video" && (
                        <>
                          <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-4 bg-black/5">
                            <video
                            //   ref={setVideoRef(key)}
                              src={item.video}
                              poster={item.cover ?? undefined}
                              muted
                              loop
                              playsInline
                              autoPlay
                              onClick={() => toggleVideoPlay(key)}
                              className="w-full h-full object-cover cursor-pointer"
                            />
                            {/* {!isPlaying && (
                              <button
                                onClick={() => toggleVideoPlay(key)}
                                aria-label="Play video"
                                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/40 flex items-center justify-center text-white"
                              >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
                                </svg>
                              </button>
                            )} */}
                          </div>

                          {!isPlaying && item.text && <p className="text-sm md:text-base font-medium text-black/80">{item.text}</p>}
                        </>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}