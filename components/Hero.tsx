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

// Each orbit ring: tilt gives the 3D sphere illusion
interface RingDef {
  images:     typeof ORBIT_IMAGES
  radius:     number   // px
  size:       number   // image px
  duration:   number   // seconds
  tiltX:      number   // degrees — rotateX for 3D feel
  tiltZ:      number   // degrees — rotateZ for variety
  reverse?:   boolean
  startAngle: number
}

function OrbitRing({ images, radius, size, duration, tiltX, tiltZ, reverse = false, startAngle }: RingDef) {
  const count = images.length
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        // 3D tilt transforms the flat ring into an ellipse — sphere illusion
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
              // Counter-rotate so images stay upright
              animation: `orbit-counter ${duration}s linear infinite ${reverse ? "normal" : "reverse"}`,
              background: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
              // Vary border color per image for richness
              border: `2px solid rgba(255,255,255,${0.1 + (i % 3) * 0.1})`,
              // Images "behind" the equator appear smaller — depth cue
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

// ── Motion variants ──────────────────────────────────────────────────────
// Parent containers stagger their direct motion children automatically.
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
  // Gates OrbitRing to client-only rendering. This is unrelated to the
  // motion animations below — it exists purely to avoid a hydration
  // mismatch, since the ring's inline `calc()` position strings can
  // serialize with different float precision between server and client.
  const [canRenderRings, setCanRenderRings] = useState(false)
  useEffect(() => setCanRenderRings(true), [])

  // Sphere size: fills the viewport width on desktop
  const SPHERE = 700   // px — the bounding box of the 3D sphere

  const rings: RingDef[] = [
    // Single ring — all fabric images, near-flat tilt for a clean circular orbit
    {
      images:     ORBIT_IMAGES,
      radius:     260,
      size:       80,
      duration:   28,
      tiltX:      72,   // near-horizontal → looks like equator
      tiltZ:      0,
      startAngle: 0,
    },
  ]

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden">

      {/* ── Background glows ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
        style={{ animation: "float 6s ease-in-out infinite" }} />

      {/* ── Headline section ── */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 grid lg:grid-cols-2 gap-12 items-center relative">

        {/* Left copy — staggers in on page load (above the fold, so animate on mount, not on scroll) */}
        <motion.div initial="hidden" animate="visible" variants={container}>
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-6"
          >
            <Zap size={12} className="animate-pulse" /> NEW COLLECTION DROPPED
          </motion.div>

          <motion.h1
            variants={container}
            className="text-5xl lg:text-7xl font-black leading-none mb-6 tracking-tighter"
          >
            {["WEAR THE", "HERITAGE.", "OWN THE", "CULTURE."].map((line) => (
              <motion.div
                key={line}
                variants={item}
                className="block"
                style={{ color: line === "HERITAGE." ? "#d4a017" : "white" }}
              >
                {line}
              </motion.div>
            ))}
          </motion.h1>

          <motion.p variants={item} className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
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
              className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-full font-black text-sm transition-colors duration-300 hover:bg-white/5 flex items-center gap-2"
            >
              <Sparkles size={14} className="text-orange-400" /> New Arrivals
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right — logo image. Also plays on mount, slightly delayed after the copy. */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: easeOutExpo }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 blur-xl" />
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
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
            className="absolute -left-4 top-1/3 bg-[#111] border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: easeOutExpo }}
            style={{ animation: "float 4s ease-in-out infinite 1s" }}
          >
            <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">🚚</div>
            <div>
              <p className="text-xs font-black text-white">Free Delivery</p>
              <p className="text-[10px] text-gray-500">Orders over ₦30,000</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-6 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: easeOutExpo }}
          >
            <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">FEATURED DROP</p>
            <p className="text-sm font-black text-white">Lagos Nights Collection</p>
            <p className="text-orange-400 font-bold text-sm mt-0.5">From ₦18,500</p>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════
          3D SPHERE — full width, below headline.
          This is far enough down to genuinely be a scroll reveal,
          so it uses whileInView instead of animate-on-mount.
          ══════════════════════════════════════════ */}
      <motion.div
        className="relative w-full flex flex-col items-center pb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: easeOutExpo }}
      >
        {/* Section label */}
        <p className="text-xs text-gray-600 font-bold tracking-[0.3em] mb-6 uppercase">
          Our Fabric Collection
        </p>

        {/* Full-width sphere stage */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            height: `${SPHERE}px`,
            perspective: 1200,          // CSS perspective for depth
          }}
        >
          {/* Sphere container — preserve-3d makes children live in 3D space */}
          <div
            style={{
              position:      "relative",
              width:          `${SPHERE}px`,
              height:         `${SPHERE}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Subtle sphere glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, rgba(212,160,23,0.08), transparent 70%)",
                boxShadow:  "0 0 120px 40px rgba(212,160,23,0.04)",
              }}
            />

            {/* Outer guide ring (decorative ellipse, matches the single orbit's tilt) */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: "rotateX(72deg)" }}
            >
              <div
                className="rounded-full border border-orange-500/10"
                style={{ width: "580px", height: "580px" }}
              />
            </div>

            {/* Center image — the Figma collage */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <div
                className="relative rounded-full overflow-hidden shadow-2xl"
                style={{
                  width: "220px",
                  height: "220px",
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

            {/* Single orbit ring — creates sphere illusion */}
            {canRenderRings && rings.map((ring, i) => (
              <OrbitRing key={i} {...ring} />
            ))}
          </div>
        </div>

        {/* Fabric labels */}
        <div className="flex flex-wrap justify-center gap-2 px-8 max-w-2xl mt-4">
          {ORBIT_IMAGES.map(({ label }) => (
            <span
              key={label}
              className="text-[10px] text-gray-600 border border-white/5 px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Keyframes (continuous idle motion — left as CSS, not part of the reveal system) ── */}
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