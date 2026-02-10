// src/dashboard/Orders.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import useSound from 'use-sound'
import notificationSfx from '../assets/sounds/notification.mp3' // نزل أي ملف صوت mp3

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [play] = useSound(notificationSfx) // هوك الصوت

    // 1. جلب الطلبات القديمة
    useEffect(() => {
        const fetchOrders = async () => {
            const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
            setOrders(data)
        }
        fetchOrders()

        // 2. الاشتراك في التحديثات اللحظية (Realtime)
        const channel = supabase
            .channel('realtime orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                // لما يجي طلب جديد:
                play() // شغل الصوت 🔊
                setOrders(prev => [payload.new, ...prev]) // ضيفه في الأول
                alert(`New Order from ${payload.new.customer_name}!`)
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [play])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-left">Total</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-bold">{order.customer_name}</td>
                                <td className="p-3">{order.governorate}</td>
                                <td className="p-3 text-green-600 font-bold">{order.total_price} EGP</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default Orders