import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' // ✅ كدة صح
import { Users, TrendingUp, TrendingDown, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const VisitorsCard = () => {
    const [currentMonthVisits, setCurrentMonthVisits] = useState(0)
    const [growthPercentage, setGrowthPercentage] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()

        // 👇 استماع لحظي (Realtime) لأي زيارة جديدة
        const channel = supabase
            .channel('realtime-visits')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_visits' }, () => {
                // لما حد يدخل، زود الرقم 1 فوراً قدام عينك
                setCurrentMonthVisits(prev => prev + 1)
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    const fetchStats = async () => {
        try {
            const now = new Date()

            // تحديد تواريخ الشهر الحالي والشهر اللي فات
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

            // 1. زيارات الشهر الحالي
            const { count: thisMonthCount } = await supabase
                .from('site_visits')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfThisMonth)

            // 2. زيارات الشهر الماضي (عشان نحسب النسبة)
            const { count: lastMonthCount } = await supabase
                .from('site_visits')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfLastMonth)
                .lt('created_at', endOfLastMonth)

            setCurrentMonthVisits(thisMonthCount || 0)

            // 3. حساب نسبة النمو
            if (lastMonthCount > 0) {
                const growth = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
                setGrowthPercentage(growth.toFixed(1))
            } else {
                setGrowthPercentage(100) // لو مفيش شهر فات، يبقى النمو 100%
            }

        } catch (error) {
            console.error("Stats Error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full relative group hover:shadow-md transition-shadow">

            {/* الجزء العلوي: الرقم والنسبة */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Visitors (This Month)</p>
                    {loading ? <Loader2 className="animate-spin text-primary" /> : (
                        <h3 className="text-3xl font-bold text-gray-800">{currentMonthVisits}</h3>
                    )}

                    {!loading && (
                        <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${Number(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {Number(growthPercentage) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{growthPercentage > 0 ? '+' : ''}{growthPercentage}% from last month</span>
                        </div>
                    )}
                </div>
                <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                    <Users size={28} />
                </div>
            </div>

            {/* الجزء السفلي: زرار التفاصيل */}
            <div className="mt-4 pt-4 border-t border-gray-50">
                <Link to="/dashboard/visitors" className="flex items-center gap-2 text-sm text-primary font-bold hover:gap-3 transition-all group-hover:text-blue-700">
                    View Detailed Logs <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    )
}

export default VisitorsCard