import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { MapPin, Smartphone, Monitor, Clock, ArrowLeft, Loader2, Globe, Cpu, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'

const VisitorLogs = () => {
    const [visits, setVisits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVisits()
    }, [])

    const fetchVisits = async () => {
        try {
            // هنجيب آخر 100 زيارة فقط عشان الصفحة متبقاش تقيلة
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

    // دالة لتنسيق التاريخ والوقت
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 bg-white rounded-full border hover:bg-gray-50 text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Visitor Logs</h1>
                    <p className="text-gray-500 text-sm">Detailed records of recent site visits.</p>
                </div>
            </div>

            {/* Table */}
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
                                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors">

                                        {/* 1. User Info (Device & Location) */}
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-800 font-bold">
                                                    {visit.device_type === 'Mobile' ? <Smartphone size={18} className="text-purple-600" /> : <Monitor size={18} className="text-blue-600" />}
                                                    {visit.city || 'Unknown City'}, {visit.country || 'Unknown Country'}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin size={12} /> {visit.device_type} Device
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Source & ISP (المصدر وشركة النت) */}
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-sm font-bold flex items-center gap-2 ${visit.referrer && !visit.referrer.includes('Direct') ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    <Globe size={14} /> {visit.referrer || 'Direct Traffic'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Wifi size={12} /> {visit.isp || 'Unknown ISP'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 3. Tech Specs (الشاشة واللغة) */}
                                        <td className="p-4 align-top">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div className="flex items-center gap-1" title="Screen Resolution">
                                                    <Monitor size={12} className="text-gray-400" />
                                                    {visit.screen_res || 'Unknown Res'}
                                                </div>
                                                <div className="flex items-center gap-1" title="Browser Language">
                                                    <Globe size={12} className="text-gray-400" />
                                                    {visit.browser_lang || 'Unknown Lang'}
                                                </div>
                                                <div className="flex items-center gap-1 max-w-[150px] truncate" title={visit.user_agent}>
                                                    <Cpu size={12} className="text-gray-400" />
                                                    {visit.user_agent}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Time */}
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
                        {visits.length === 0 && (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <Globe size={48} className="mb-4 opacity-20" />
                                <p>No visitor logs found yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitorLogs