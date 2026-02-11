import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' // 👈 تأكد من المسار
import { MapPin, Smartphone, Monitor, Clock, ArrowLeft, Loader2, Globe, Cpu, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'

const VisitorLogs = () => {
    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVisits()

        // 👇👇👇 السحر هنا: الاشتراك في التحديثات اللحظية 👇👇👇
        const channel = supabase
            .channel('realtime-logs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'site_visits' },
                (payload) => {
                    // أول ما تيجي زيارة جديدة، ضيفها في أول القائمة
                    setVisits((prevVisits) => [payload.new, ...prevVisits])
                }
            )
            .subscribe()

        // تنظيف الاشتراك لما تخرج من الصفحة
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchVisits = async () => {
        try {
            const { data, error } = await supabase
                .from('site_visits')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

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
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 bg-white rounded-full border hover:bg-gray-50 text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Live Visitor Logs 🔴</h1>
                    <p className="text-gray-500 text-sm">Watching traffic in real-time...</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-medium uppercase tracking-wider text-xs">User Info</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-xs">Source & ISP</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-xs">Tech Specs</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-xs">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visits.map((visit) => (
                                    // بنستخدم key فريد عشان الرياكت ميتلخبطش في التحديث
                                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-top-2 duration-500">

                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-800 font-bold">
                                                    {visit.device_type === 'Mobile' ? <Smartphone size={18} className="text-purple-600" /> : <Monitor size={18} className="text-blue-600" />}
                                                    {visit.city || 'Unknown'}, {visit.country || 'Unknown'}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin size={12} /> {visit.device_type}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-bold flex items-center gap-2 ${visit.referrer && !visit.referrer.includes('Direct') ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    <Globe size={14} /> {visit.referrer || 'Direct'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Wifi size={12} /> {visit.isp || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-4 align-top">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <Monitor size={12} className="text-gray-400" /> {visit.screen_res}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Globe size={12} className="text-gray-400" /> {visit.browser_lang}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                <Clock size={16} className="text-gray-400" />
                                                {formatDate(visit.created_at)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitorLogs