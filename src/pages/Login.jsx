import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react' // 👈 ضفنا ايقونة السهم
import { toast } from 'react-hot-toast'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. محاولة تسجيل الدخول (Auth Check)
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw new Error("Invalid email or password")

            // 2. التحقق من الصلاحيات (Role Check)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError || !profile) {
                await supabase.auth.signOut()
                throw new Error("Access Denied: No profile found.")
            }

            // 3. التحقق من الحظر (Block Check)
            if (profile.is_blocked) {
                await supabase.auth.signOut()
                throw new Error("Access Denied: Your account has been blocked.")
            }

            // 4. التحقق من الدور (لازم يكون admin أو employee)
            if (!['admin', 'employee'].includes(profile.role)) {
                await supabase.auth.signOut()
                throw new Error("Access Denied: You are not authorized.")
            }

            // كله تمام ✅
            toast.success(`Welcome back, ${profile.full_name || 'Admin'}!`)
            navigate('/dashboard')

        } catch (error) {
            console.error(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2 font-script">Henawy's Art</h2>
                    <p className="text-gray-400 text-sm">Staff & Admin Access Only</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition-all"
                                placeholder="admin@store.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
                    </button>

                    {/* Warning Message */}
                    <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>Only registered staff members can log in. Contact the administrator if you need access.</p>
                    </div>

                    {/* 👇 زرار الرجوع الجديد 👇 */}
                    <div className="pt-2 text-center border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/')} // بيرجع للصفحة الرئيسية
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium p-2"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default Login