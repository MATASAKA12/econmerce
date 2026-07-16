"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Check, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ["", "Weak", "Good", "Strong"]
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("Passwords do not match")
    if (!agreed) return setError("Please accept the terms and conditions")
    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)
    if (result.success) router.push("/")
    else setError(result.error || "Registration failed")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tighter">
            BODEGA-FABRICS<span className="text-orange-500">STORE</span>
          </a>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
        {/* ✕ Close button */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <h1 className="text-xl font-black mb-2">Join Bodega fabrics tStore</h1>
          <p className="text-gray-500 text-sm mb-6">Get exclusive access to drops and deals</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-700 outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-700 outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-700 outline-none focus:border-orange-500/60 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength ? strengthColor[passwordStrength] : "bg-white/10"
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength === 1 ? "text-red-400" : passwordStrength === 2 ? "text-yellow-400" : "text-green-400"}`}>
                    {strengthLabel[passwordStrength]} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-700 outline-none focus:border-orange-500/60 transition-colors"
                />
                {confirm && (
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${password === confirm ? "text-green-400" : "text-red-400"}`}>
                    {password === confirm ? <Check size={16} /> : <AlertCircle size={16} />}
                  </span>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                  agreed ? "bg-orange-500 border-orange-500" : "border-white/20 bg-transparent"
                }`}>
                {agreed && <Check size={12} className="text-white" />}
              </button>
              <p className="text-xs text-gray-500 leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-orange-400 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a href="/account/signin" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}