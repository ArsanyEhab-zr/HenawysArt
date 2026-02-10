import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Loader2 } from 'lucide-react'

const RequireAuth = ({ children, allowedRoles = [] }) => {
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isRoleAllowed, setIsRoleAllowed] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // 1. هل المستخدم مسجل دخول في Supabase Auth؟
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    // لو مش مسجل، وقف تحميل وقول إنه مش موثوق
                    setIsAuthenticated(false)
                    setLoading(false)
                    return
                }

                // 2. هات بياناته من جدول profiles (عشان نعرف دوره وحالته)
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                // لو حصل خطأ أو ملوش بروفايل (حالة نادرة)، اطرده
                if (error || !profile) {
                    await supabase.auth.signOut()
                    setIsAuthenticated(false)
                    setLoading(false)
                    return
                }

                // 3. هل الحساب محظور؟ (Block Check)
                if (profile.is_blocked) {
                    alert("Your account has been blocked by the administrator.")
                    await supabase.auth.signOut() // طرد فوري
                    setIsAuthenticated(false)
                    setLoading(false)
                    return
                }

                // المستخدم سليم وموجود ✅
                setIsAuthenticated(true)

                // 4. هل معاه الصلاحية المطلوبة للصفحة دي؟ (Role Check)
                // لو مبعتناش allowedRoles (المصفوفة فاضية)، يبقى أي حد يدخل
                // لو بعتنا ['admin'] والمستخدم 'employee'، يبقى ممنوع
                if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
                    setIsRoleAllowed(false)
                } else {
                    setIsRoleAllowed(true)
                }

            } catch (error) {
                console.error("Auth Check Error:", error)
                setIsAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAccess()
    }, [location.pathname]) // عيد الفحص لو المسار اتغير

    // ===============================================
    // حالات العرض (Render States)
    // ===============================================

    // 1. لسه بيحمل (بيكلم الداتابيز)
    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
                <p className="text-gray-500 font-medium text-sm">Verifying Access...</p>
            </div>
        )
    }

    // 2. مش مسجل دخول أصلاً -> روح لصفحة الـ Login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 3. مسجل دخول بس بيحاول يفتح صفحة مش بتاعته (مثلاً موظف بيفتح صفحة المديرين)
    if (!isRoleAllowed) {
        // رجعه للصفحة الرئيسية للداش بورد (أمان)
        return <Navigate to="/dashboard" replace />
    }

    // 4. كله تمام -> اعرض الصفحة المطلوبة ✅
    return children
}

export default RequireAuth