"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Zap, ArrowRight, Sparkles } from "lucide-react"

interface HeroProps {
  onShopNow: () => void
}

const ORBIT_IMAGES = [
  { src: "/fabrics/ankara.jpg",                  label: "Ankara" },
  { src: "/fabrics/lace.jpeg",                   label: "Lace" },
  { src: "/fabrics/damask.jpeg",                 label: "Damask" },
  { src: "/fabrics/ankara1.png",                 label: "Ankara1" },
  { src: "/fabrics/duchess.jpg",                 label: "Duchess" },
  { src: "/fabrics/suiting.jpeg",                label: "Suiting" },
  { src: "/fabrics/Native-Woven-Krubite.jpeg",   label: "Native Woven" },
  { src: "/fabrics/lace-beads.jpeg",             label: "Lace Beads" },
  { src: "/fabrics/indian-george.jpeg",          label: "Indian George" },
  { src: "/fabrics/beaded-lace.jpeg",            label: "Beaded Lace" },
]

const FALLBACK_COLORS = [
  "#c0392b","#2980b9","#27ae60",
  "#8e44ad","#e67e22","#16a085",
  "#d35400","#1abc9c","#2c3e50","#8e44ad",
]

interface RingDef {
  images:     typeof ORBIT_IMAGES
  radius:     number
  size:       number
  duration:   number
  tiltX:      number
  tiltZ:      number
  reverse?:   boolean
  startAngle: number
}

function OrbitRing({ images, radius, size, duration, tiltX, tiltZ, reverse = false, startAngle }: RingDef) {
  const count = images.length
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
        transformStyle: "preserve-3d",
        animation: `orbit-spin ${duration}s linear infinite ${reverse ? "reverse" : "normal"}`,
      }}
    >
      {images.map((img, i) => {
        const angle = startAngle + (i / count) * 360
        const rad   = (angle * Math.PI) / 180
        const x     = Math.cos(rad) * radius
        const y     = Math.sin(rad) * radius

        return (
          <div
            key={i}
            className="absolute rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width:  `${size}px`,
              height: `${size}px`,
              left:   `calc(50% + ${x}px - ${size / 2}px)`,
              top:    `calc(50% + ${y}px - ${size / 2}px)`,
              animation: `orbit-counter ${duration}s linear infinite ${reverse ? "normal" : "reverse"}`,
              background: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
              border: `2px solid rgba(255,255,255,${0.1 + (i % 3) * 0.1})`,
              transform: `scale(${0.75 + 0.25 * Math.abs(Math.cos(rad))})`,
            }}
          >
            <img
              src={img.src}
              alt={img.label}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none" }}
            />
          </div>
        )
      })}
    </div>
  )
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

export function Hero({ onShopNow }: HeroProps) {
  const [canRenderRings, setCanRenderRings] = useState(false)
  useEffect(() => setCanRenderRings(true), [])

  // Responsive sphere sizing — the old fixed 700px sphere/260px radius/80px
  // image size only worked on desktop; on a ~375-430px phone it just got
  // visually crushed and images overlapped, which is what showed up in
  // testing. These scale down properly instead of staying one fixed size.
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    function updateBreakpoint() {
      const w = window.innerWidth
      if (w < 480)       setBreakpoint("mobile")
      else if (w < 1024) setBreakpoint("tablet")
      else                setBreakpoint("desktop")
    }
    updateBreakpoint()
    window.addEventListener("resize", updateBreakpoint)
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  const SPHERE_SIZES = {
    mobile:  { sphere: 280, radius: 95,  imageSize: 40, guideRing: 230, emblem: 130, perspective: 700 },
    tablet:  { sphere: 480, radius: 170, imageSize: 60, guideRing: 400, emblem: 170, perspective: 1000 },
    desktop: { sphere: 700, radius: 260, imageSize: 80, guideRing: 580, emblem: 220, perspective: 1200 },
  }
  const { sphere: SPHERE, radius, imageSize, guideRing, emblem, perspective } = SPHERE_SIZES[breakpoint]

  const rings: RingDef[] = [
    {
      images:     ORBIT_IMAGES,
      radius,
      size:       imageSize,
      duration:   28,
      tiltX:      72,
      tiltZ:      0,
      startAngle: 0,
    },
  ]

  return (
    <section className="relative bg-white dark:bg-[#0a0a0a] overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
        style={{ animation: "float 6s ease-in-out infinite" }} />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 grid lg:grid-cols-2 gap-12 items-center relative">

        <motion.div initial="hidden" animate="visible" variants={container}>
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 dark:text-orange-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6"
          >
            <Zap size={12} className="animate-pulse" /> NEW COLLECTION DROPPED
          </motion.div>

          <motion.h1
            variants={container}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6 tracking-tighter break-words"
          >
            {["WEAR THE", "HERITAGE.", "OWN THE", "CULTURE."].map((line) => (
              <motion.div
                key={line}
                variants={item}
                className={`block ${line === "HERITAGE." ? "" : "text-black dark:text-white"}`}
                style={line === "HERITAGE." ? { color: "#d4a017" } : undefined}
              >
                {line}
              </motion.div>
            ))}
          </motion.h1>

          <motion.p variants={item} className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
            Premium authentic Africa fabrics — Ankara, Lace, Damask, Indian George,
            Duchess/Crepe, Suiting/Senator materials.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onShopNow}
              className="group bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-black text-sm transition-colors duration-300 flex items-center gap-2 hover:gap-3 hover:shadow-lg hover:shadow-orange-500/25"
            >
              Shop Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onShopNow}
              className="border border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/40 text-black dark:text-white px-8 py-4 rounded-full font-black text-sm transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2"
            >
              <Sparkles size={14} className="text-orange-500 dark:text-orange-400" /> New Arrivals
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easeOutExpo }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 blur-xl" />
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-2xl"
            style={{ animation: "float 5s ease-in-out infinite" }}>
            <img
              src="/bodega-fabrics-store.jpg"
              alt="Bodega Fabrics Store"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <motion.div
            className="absolute -left-4 top-1/3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: easeOutExpo }}
            style={{ animation: "float 4s ease-in-out infinite 1s" }}
          >
            <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center">🚚</div>
            <div>
              <p className="text-xs font-black text-black dark:text-white">Free Delivery</p>
              <p className="text-[10px] text-gray-500">Orders over ₦30,000</p>
            </div>
          </motion.div>

          {/* Sits directly on the photo — dark overlay is for legibility
              against the image, not page theme, so left as-is intentionally. */}
          <motion.div
            className="absolute bottom-6 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: easeOutExpo }}
          >
            <p className="text-[10px] text-gray-400 font-bold tracking-widest mb-1">FEATURED DROP</p>
            <p className="text-sm font-black text-white">Lagos Nights Collection</p>
            <p className="text-orange-400 font-bold text-sm mt-0.5">From ₦18,500</p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="relative w-full flex flex-col items-center pb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: easeOutExpo }}
      >
        <p className="text-xs text-gray-500 dark:text-gray-600 font-bold tracking-[0.3em] mb-6 uppercase">
          Our Fabric Collection
        </p>

        <div
          className="relative w-full flex items-center justify-center"
          style={{ height: `${SPHERE}px`, perspective }}
        >
          <div
            style={{
              position:      "relative",
              width:          `${SPHERE}px`,
              height:         `${SPHERE}px`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(212,160,23,0.08), transparent 70%)",
                boxShadow:  "0 0 120px 40px rgba(212,160,23,0.04)",
              }}
            />

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: "rotateX(72deg)" }}
            >
              <div
                className="rounded-full border border-orange-500/10"
                style={{ width: `${guideRing}px`, height: `${guideRing}px` }}
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <div
                className="relative rounded-full overflow-hidden shadow-2xl"
                style={{
                  width: `${emblem}px`,
                  height: `${emblem}px`,
                  animation:  "float 4s ease-in-out infinite",
                  background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                  border:     "3px solid rgba(212,160,23,0.4)",
                  boxShadow:  "0 0 60px 10px rgba(212,160,23,0.15)",
                }}
              >
                <img
                  src="/fabric-collage.png"
                  alt="Fabric Collection"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none" }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-orange-400 font-black text-sm text-center leading-tight px-4">
                    BODEGA<br />FABRICS
                  </p>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-pulse" />
              </div>
            </div>

            {canRenderRings && rings.map((ring, i) => (
              <OrbitRing key={i} {...ring} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 px-8 max-w-2xl mt-4">
          {ORBIT_IMAGES.map(({ label }) => (
            <span
              key={label}
              className="text-[10px] text-gray-600 dark:text-gray-600 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-2 py-0.5 rounded-full font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes orbit-spin {
          from { transform: rotateX(var(--tx,0deg)) rotateZ(var(--tz,0deg)) rotate(0deg); }
          to   { transform: rotateX(var(--tx,0deg)) rotateZ(var(--tz,0deg)) rotate(360deg); }
        }
        @keyframes orbit-counter {
          from { transform: scale(1) rotate(0deg); }
          to   { transform: scale(1) rotate(-360deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
      `}</style>
    </section>
  )
}