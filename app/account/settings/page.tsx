"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, User, Mail, Lock, Bell, Shield, Trash2,
  Check, AlertCircle, Eye, EyeOff, Smartphone, Globe,
  CreditCard, Loader2, Camera,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getProfile, upsertProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import { fmt } from "@/lib/Utils"

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "security"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",      icon: User   },
  { id: "notifications", label: "Notifications", icon: Bell   },
  { id: "security",      label: "Security",      icon: Shield },
]

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, error }: { msg: string; error?: boolean }) {
  if (!msg) return null
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-2 ${
      error ? "bg-red-500 text-white" : "bg-orange-500 text-white"
    }`}>
      {error ? <AlertCircle size={14} /> : <Check size={14} />}
      {msg}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? "bg-orange-500" : "bg-white/10"}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth()
  const router   = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [toast, setToast]         = useState({ msg: "", error: false })

  const showToast = useCallback((msg: string, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast({ msg: "", error: false }), 3000)
  }, [])

  // ── Profile state (from Supabase profiles table) ──────────────────────────
  const [fullName,   setFullName]   = useState("")
  const [phone,      setPhone]      = useState("")
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile,  setSavingProfile]  = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Email comes from auth, not profiles table
  const email = user?.email ?? ""

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    getProfile(user.id).then((p) => {
      if (p) {
        setFullName(p.full_name ?? "")
        setAvatarUrl(p.avatar_url)
        // phone isn't in profiles schema — read from user_metadata if set
        setPhone(user.user_metadata?.phone ?? "")
      }
      setProfileLoading(false)
    })
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return showToast("You must be signed in", true)
    if (!fullName.trim()) return showToast("Name is required", true)
    setSavingProfile(true)
    try {
      await upsertProfile(user.id, { full_name: fullName.trim(), avatar_url: avatarUrl })
      // Also persist phone in auth metadata
      await supabase.auth.updateUser({ data: { phone } })
      showToast("Profile updated successfully")
    } catch (err: any) {
      showToast(err.message ?? "Failed to save profile", true)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 2 * 1024 * 1024) return showToast("Avatar must be under 2MB", true)

    setUploadingAvatar(true)
    try {
      const ext  = file.name.split(".").pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      setAvatarUrl(publicUrl)
      await upsertProfile(user.id, { avatar_url: publicUrl })
      showToast("Avatar updated")
    } catch (err: any) {
      showToast(err.message ?? "Upload failed", true)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPw,    setCurrentPw]    = useState("")
  const [newPw,        setNewPw]        = useState("")
  const [confirmPw,    setConfirmPw]    = useState("")
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [savingPw,     setSavingPw]     = useState(false)

  const handleChangePassword = async () => {
    if (!newPw || !confirmPw) return showToast("All fields required", true)
    if (newPw !== confirmPw)   return showToast("Passwords do not match", true)
    if (newPw.length < 6)      return showToast("Minimum 6 characters", true)
    setSavingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
      showToast("Password changed successfully")
    } catch (err: any) {
      showToast(err.message ?? "Failed to change password", true)
    } finally {
      setSavingPw(false)
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account and all data. Are you sure?")) return
    setDeletingAccount(true)
    try {
      // Supabase requires service role to delete users — call your own API route
      const res = await fetch("/api/account/delete", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete account")
      await supabase.auth.signOut()
      router.replace("/")
    } catch (err: any) {
      showToast(err.message ?? "Failed to delete account", true)
      setDeletingAccount(false)
    }
  }

  // ── Notifications state ───────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    newArrivals:  true,
    promotions:   false,
    newsletter:   true,
    smsAlerts:    false,
  })
  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))

  // ── Redirect if not logged in ─────────────────────────────────────────────
  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Sign in to view settings</h2>
          <a href="/account/login" className="text-orange-400 hover:underline text-sm">Go to login</a>
        </div>
      </div>
    )
  }

  const initials = fullName?.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toast msg={toast.msg} error={toast.error} />

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d0d0d] px-6 py-4 flex items-center gap-4">
        <a href="/" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </a>
        <div>
          <h1 className="text-lg font-black">Settings</h1>
          <p className="text-xs text-gray-500">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 flex gap-6 flex-col lg:flex-row">

        {/* Sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-white/5 last:border-0 ${
                  activeTab === tab.id
                    ? "text-orange-400 bg-orange-500/10 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? "text-orange-400" : "text-gray-600"} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
              <h2 className="font-black text-base">Profile Information</h2>

              {profileLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-orange-500" />
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-orange-400">{initials}</span>
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-400 transition-colors"
                      >
                        {uploadingAvatar
                          ? <Loader2 size={10} className="animate-spin text-white" />
                          : <Camera size={10} className="text-white" />
                        }
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{fullName || "—"}</p>
                      <p className="text-xs text-gray-500">{email}</p>
                    </div>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Full name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email — read-only from auth */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Email address <span className="text-gray-700">(managed by auth)</span></label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={email}
                        readOnly
                        className="w-full bg-[#0a0a0a]/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Phone number</label>
                    <div className="relative">
                      <Smartphone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === "notifications" && (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <h2 className="font-black text-base mb-5">Notification Preferences</h2>
              {[
                { key: "orderUpdates" as const, label: "Order updates",  sub: "Track your orders in real-time",      icon: CreditCard },
                { key: "newArrivals"  as const, label: "New arrivals",   sub: "Be first to know about new drops",    icon: Globe },
                { key: "promotions"   as const, label: "Promotions",     sub: "Sales, discounts and special offers", icon: Bell },
                { key: "newsletter"   as const, label: "Newsletter",     sub: "Weekly style tips and inspiration",   icon: Mail },
                { key: "smsAlerts"    as const, label: "SMS alerts",     sub: "Receive alerts via text message",     icon: Smartphone },
              ].map(({ key, label, sub, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
                      <Icon size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                  </div>
                  <Toggle on={notifs[key]} onToggle={() => toggleNotif(key)} />
                </div>
              ))}
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <div className="space-y-4">
              {/* Change password */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-black text-base">Change Password</h2>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Current password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">New password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Confirm new password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 transition-colors"
                    />
                  </div>
                </div>

                {/* Password strength */}
                {newPw && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          newPw.length >= i * 3
                            ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-yellow-500" : i <= 3 ? "bg-blue-500" : "bg-green-500"
                            : "bg-white/10"
                        }`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      {newPw.length < 6 ? "Too short" : newPw.length < 9 ? "Weak" : newPw.length < 12 ? "Fair" : "Strong"}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={savingPw}
                  className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                >
                  {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Update Password
                </button>
              </div>

              {/* Account info */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="font-black text-base mb-4">Account Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-white">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account created</span>
                    <span className="text-white">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last sign in</span>
                    <span className="text-white">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en-NG") : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6">
                <h2 className="font-black text-base text-red-400 mb-2">Danger Zone</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Once you delete your account, all your data — orders, wishlist, and profile — will be permanently removed.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 px-6 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                >
                  {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}