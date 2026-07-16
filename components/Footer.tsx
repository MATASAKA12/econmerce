"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone, Mail, MapPin, ArrowUp,
  Send, MessageCircle, X,
} from "lucide-react"

// ── Motion variants ──────────────────────────────────────────────────────
const easeOutExpo = [0.16, 1, 0.3, 1] as const

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

const viewportOnce = { once: true, margin: "-60px" }

// ── Facebook SVG (lucide-react doesn't include it) ────────────────────────────
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// ── Scroll-to-top ─────────────────────────────────────────────────────────────
// Not scroll-reveal content — this fades based on scroll position (CSS),
// which is a different concern, so left as-is.
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-50 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  )
}

// ── About Us modal ─────────────────────────────────────────────────────────────
// A modal opens/closes via state — it isn't scrolled into view, so it uses
// AnimatePresence for enter/exit transitions instead of whileInView.
function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="relative bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>

            <div className="mb-6">
              <p className="text-[11px] font-bold tracking-[0.2em] text-orange-400 uppercase mb-2">About Us</p>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                Built on Credibility.<br />Driven by Diligence.
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900">Bodega Fabrics Store</strong> is a premium African fabric
                retailer operating from the heart of <strong className="text-gray-900">Ekeoha Shopping Centre,
                Aba — Nigeria's fashion capital</strong>. We supply high-quality fabrics to tailors, designers,
                fashion houses, and businesses across Nigeria and beyond.
              </p>
              <p>
                Our catalogue spans the finest authentic African materials —{" "}
                <strong className="text-gray-900">Ankara, Lace, Damask, Indian George, Duchess/Crepe,
                Beaded Lace, Native Woven Krubite</strong> and Suiting/Senator materials — each sourced
                directly from trusted mills and verified suppliers.
              </p>
              <p>We have built our reputation on two pillars:</p>
              <ul className="space-y-3 pl-2">
                {[
                  { title: "Credibility", body: "Every fabric we sell is quality-checked and honestly described. No substitutions, no shortcuts. What you order is exactly what arrives." },
                  { title: "Diligence",   body: "From the moment you place an order to the day it lands in your hands, we handle every step with care. Our team is available 7 days a week for orders, custom sourcing, and bulk inquiries." },
                ].map(({ title, body }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                    <span><strong className="text-gray-800">{title}</strong> — {body}</span>
                  </li>
                ))}
              </ul>
              <p>
                Whether you are a sole tailor, a bridal house, or an export business,
                Bodega Fabrics Store is your most reliable fabric partner in Nigeria.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-3 rounded-full text-sm transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── Main Footer ────────────────────────────────────────────────────────────────
export function Footer() {
  const [year, setYear] = useState(2025)
  const [aboutOpen, setAboutOpen] = useState(false)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  const MAP_SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.0!2d7.3678!3d5.1172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1042902749d5f58f%3A0x9e0f2d7e0c1f0e0a!2sEkeoha%20Shopping%20Centre%2C%20Aba!5e0!3m2!1sen!2sng!4v1688000000000!5m2!1sen!2sng"

  const NAV_LINKS = [
    { label: "Services", href: "#products",  action: undefined },
    { label: "About us", href: "#",           action: () => setAboutOpen(true) },
  ]

  const SOCIALS = [
    { label: "Telegram",  href: "https://t.me/bodegafabrics",                  bg: "#229ED9", hover: "#1a8bbf", icon: <Send size={15} /> },
    { label: "WhatsApp",  href: "https://wa.me/2348012345678",                  bg: "#25D366", hover: "#1dba57", icon: <MessageCircle size={15} /> },
    { label: "Facebook",  href: "https://www.facebook.com/bodegafabrics",       bg: "#1877F2", hover: "#1560cc", icon: <FacebookIcon size={15} /> },
  ]

  return (
    <>
      <ScrollToTop />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <footer className="bg-white text-gray-800 border-t border-gray-100">
        <motion.div
          className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >

          {/* ── 3-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_160px] gap-10 lg:gap-12">

            {/* Logo */}
            <motion.div variants={staggerItem}>
              <p className="text-2xl font-black tracking-tight text-center">
                <span style={{ color: "black" }}>BODEGA FABRICS</span>
                <span style={{ color: "#d4a017" }}>STORE</span>
              </p>
            </motion.div>

            {/* COL 1 — Info + socials */}
            <motion.div variants={staggerItem} className="flex flex-col gap-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Info</p>
                <nav className="flex flex-col gap-2.5">
                  {NAV_LINKS.map(({ label, href, action }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={action ? (e) => { e.preventDefault(); action() } : undefined}
                      className="text-sm text-gray-600 hover:text-orange-500 transition-colors font-medium cursor-pointer"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Social icons */}
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3">Follow Us</p>
                <div className="flex gap-2">
                  {SOCIALS.map(({ label, href, bg, icon }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center shadow-sm transition-opacity hover:opacity-90"
                      style={{ background: bg }}
                    >
                      {icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* COL 2 — Logo + Map + Contact */}
            <motion.div variants={staggerItem} className="flex flex-col gap-5">

              {/* Map + Contact side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 200 }}>
                  <iframe
                    title="Ekeoha Shopping Centre Aba"
                    src={MAP_SRC}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "grayscale(15%)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Contact details */}
                <div className="flex flex-col gap-4 justify-center">
                  {[
                    {
                      label: "Contact Us",
                      icon: <Phone size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />,
                      content: <a href="tel:+2348012345678" className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">+234 801 234 5678</a>,
                    },
                    {
                      label: "Email",
                      icon: <Mail size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />,
                      content: <a href="mailto:support@bodegafabricsstore.com" className="text-sm text-gray-600 hover:text-orange-500 transition-colors break-all">support@bodegafabricsstore.com</a>,
                    },
                    {
                      label: "Location",
                      icon: <MapPin size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />,
                      content: <address className="not-italic text-sm text-gray-600 leading-relaxed">Ekeoha Shopping Centre,<br />Aba, Abia State, Nigeria</address>,
                    },
                  ].map(({ label, icon, content }) => (
                    <div key={label}>
                      <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1.5">{label}</p>
                      <div className="flex items-start gap-2">{icon}{content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* COL 3 — empty / future use */}
            <div className="hidden lg:block" />
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="border-t border-gray-100 px-6 lg:px-10 py-5"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">© {year} — Bodega Fabrics Store. All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </motion.div>
      </footer>
    </>
  )
}