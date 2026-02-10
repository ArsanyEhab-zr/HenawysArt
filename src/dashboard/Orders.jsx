import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Search, Filter, Eye, ChevronDown, Loader2, XCircle, CheckCircle, Truck, PackageCheck, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)

    // تعريف الحالات وألوانها
    const STATUS_OPTIONS = [
        { value: 'pending', label: 'Pending (قيد الانتظار)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { value: 'confirmed', label: 'Confirmed (مؤكد)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'shipped', label: 'Shipped (خرج للشحن)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        { value: 'delivered', label: 'Delivered (تم التوصيل)', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'cancelled', label: 'Cancelled (ملغي)', color: 'bg-red-100 text-red-800 border-red-200' },
    ]

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            toast.error("Error fetching orders")
        } finally {
            setLoading(false)
        }
    }

    // دالة تغيير الحالة (هي دي اللي بتنفذ طلبك)
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            // تحديث الواجهة فوراً
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            if (newStatus === 'confirmed') toast.success('Order Confirmed! (Added to Revenue)')
            else if (newStatus === 'delivered') toast.success('Order Delivered! (Completed)')
            else if (newStatus === 'cancelled') toast.error('Order Cancelled')
            else toast.success('Status Updated')

        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const filteredOrders = orders.filter(o =>
        (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.id.toString()).includes(search)
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? <div className="p-8 text-center"><Loader2 className="animate-spin inline" /></div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status (Click to Change)</th>
                                    <th className="p-4 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map(order => {
                                    const statusObj = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-500">#{order.id}</td>
                                            <td className="p-4 font-bold">{order.customer_name}</td>
                                            <td className="p-4 text-gray-500">{order.governorate}</td>
                                            <td className="p-4 font-bold text-primary">{order.total_price} EGP</td>

                                            {/* 👇 القائمة المنسدلة لتغيير الحالة */}
                                            <td className="p-4">
                                                <div className="relative inline-block group">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none ${statusObj.color}`}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </td>

                                            <td className="p-4 text-right">
                                                <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><Eye size={18} /></button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* تفاصيل الطلب (Modal) */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-bold">Order Details #{selectedOrder.id}</h3>
                            <button onClick={() => setSelectedOrder(null)}><XCircle className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p><strong>📞 Phone/Name:</strong> {selectedOrder.customer_name}</p>
                            <p><strong>📍 Address:</strong> {selectedOrder.address}</p>
                            <p><strong>📝 Notes:</strong> {selectedOrder.notes || 'None'}</p>
                            <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                <p className="font-bold text-primary">{selectedOrder.items?.productName}</p>
                                {selectedOrder.items?.customText && <p className="text-sm">Text: {selectedOrder.items.customText}</p>}
                                {selectedOrder.items?.refImage && <img src={selectedOrder.items.refImage} className="w-20 h-20 object-cover mt-2 rounded border" />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders