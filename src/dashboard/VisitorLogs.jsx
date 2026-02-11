import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { MapPin, Smartphone, Monitor, Clock, ArrowLeft, Loader2, Globe, Wifi, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

const VisitorLogs = () => {
    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVisits()

        // 👇 السحر هنا: الاشتراك اللحظي في الزيارات والأنشطة الجديدة
        const channel = supabase
            .channel('realtime-activity')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'site_visits' },
                () => fetchVisits() // بنعيد التحميل عشان نجيب الزيارة الجديدة كاملة بالعلاقات
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'visit_activities' },
                () => fetchVisits() // لو حد شاف منتج جديد والصفحة مفتوحة، الجدول يتحدث فوراً
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchVisits = async () => {
        try {
            // جلب الزيارات + الأنشطة المرتبطة + تفاصيل المنتج لكل نشاط
            const { data, error } = await supabase
                .from('site_visits')
                .select(`
                    *,
                    visit_activities (
                        product: products (title, image_url)
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            setVisits(data || [])
        } catch (error) {
            console.error("Error fetching logs:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 bg-white rounded-full border hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Journey Logs 🕵️‍♂️</h1>
                    <p className="text-gray-500 text-sm">Real-time tracking of who is browsing what.</p>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-bold">Visitor Info</th>
                                    <th className="p-4 font-bold">Source & Network</th>
                                    <th className="p-4 font-bold text-blue-600">Items Viewed (The Journey)</th>
                                    <th className="p-4 font-bold">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-top-1 duration-500">

                                        {/* 1. Visitor Info */}
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-800 font-bold">
                                                    {visit.device_type === 'Mobile' ? <Smartphone size={16} className="text-purple-500" /> : <Monitor size={16} className="text-blue-500" />}
                                                    {visit.city || 'Unknown'}, {visit.country || 'Unknown'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono">{visit.screen_res} • {visit.browser_lang}</div>
                                            </div>
                                        </td>

                                        {/* 2. Source & ISP */}
                                        <td className="p-4 align-top text-sm">
                                            <div className="font-bold text-gray-700 flex items-center gap-1">
                                                <Globe size={14} className="text-blue-400" />
                                                <span className="truncate max-w-[150px]">{visit.referrer || 'Direct'}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <Wifi size={12} /> {visit.isp || 'Unknown ISP'}
                                            </div>
                                        </td>

                                        {/* 3. Viewed Items (Journey) */}
                                        <td className="p-4 align-top">
                                            <div className="flex flex-wrap gap-2">
                                                {visit.visit_activities && visit.visit_activities.length > 0 ? (
                                                    visit.visit_activities.map((activity, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100 group">
                                                            <img
                                                                src={activity.product?.image_url}
                                                                alt="p"
                                                                className="w-6 h-6 rounded object-cover shadow-sm"
                                                            />
                                                            <span className="text-[11px] font-bold text-blue-700 max-w-[100px] truncate">
                                                                {activity.product?.title}
                                                            </span>
                                                            <Eye size={10} className="text-blue-300" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-300 italic">No items viewed yet...</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 4. Time */}
                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full w-fit border">
                                                <Clock size={14} className="text-gray-400" />
                                                {formatDate(visit.created_at)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visits.length === 0 && (
                            <div className="p-20 text-center text-gray-400 italic">
                                No visitor activity recorded yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitorLogs