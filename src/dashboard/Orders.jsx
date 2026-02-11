import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Search, Filter, Eye, ChevronDown, Loader2, XCircle, Trash2, Phone, MapPin, DollarSign, Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All') // 👈 حالة الفلتر الجديد
    const [selectedOrder, setSelectedOrder] = useState(null)

    // تصنيفات المنتجات (للفلتر)
    const CATEGORIES = ['All', 'Wood Slices', 'Frames', 'Wall Art', 'Custom']

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
                // 👇 الترتيب: false يعني الأحدث (آخر واحد طلب) يظهر أول واحد فوق
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            toast.error("Error fetching orders")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            if (newStatus === 'confirmed') toast.success('Order Confirmed!')
            else if (newStatus === 'delivered') toast.success('Order Delivered!')
            else if (newStatus === 'cancelled') toast.error('Order Cancelled')
            else toast.success('Status Updated')

        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    // 👇 دالة حذف الطلب (للطلبات الملغية فقط)
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order permanently?")) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId)

            if (error) throw error

            // حذف الطلب من الشاشة وتحديث الترتيب تلقائياً
            setOrders(prev => prev.filter(o => o.id !== orderId))
            toast.success("Order deleted successfully")
            setSelectedOrder(null) // لو المودال مفتوح اقفله
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete order")
        }
    }

    // 👇 منطق الفلتر المتطور (بحث + تصنيف)
    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.phone || '').includes(search) || // البحث برقم التليفون كمان
            (o.id.toString()).includes(search);

        const matchesCategory = selectedCategory === 'All' ||
            (o.items?.category || o.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
            (o.items?.productName || '').toLowerCase().includes(selectedCategory.toLowerCase());

        return matchesSearch && matchesCategory;
    })

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                    <p className="text-gray-500 text-sm">{filteredOrders.length} orders found</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* 👇 فلتر التصنيفات الجديد */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-40"
                        >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>

                    {/* بحث */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, phone, ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin text-primary" size={30} /></div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium border-b">
                                <tr>
                                    <th className="p-4 w-16">#</th> {/* التسلسل البصري */}
                                    <th className="p-4">Customer info</th> {/* الاسم والتليفون */}
                                    <th className="p-4">Items & Price</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order, index) => {
                                    const statusObj = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            {/* التسلسل البصري (1, 2, 3) */}
                                            <td className="p-4 text-gray-400 font-mono text-xs">
                                                {index + 1} <br />
                                                <span className="text-[10px] opacity-50">ID:{order.id}</span>
                                            </td>

                                            {/* بيانات العميل والتليفون */}
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{order.customer_name}</div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Phone size={12} /> {order.phone || 'No Phone'}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                                                    <Calendar size={10} /> {formatDate(order.created_at)}
                                                </div>
                                            </td>

                                            {/* تفاصيل المنتج والسعر */}
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{order.items?.productName || 'Unknown Item'}</div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-primary mt-1 bg-primary/5 w-fit px-2 py-0.5 rounded">
                                                    <DollarSign size={12} /> {order.total_price} EGP
                                                </div>
                                            </td>

                                            <td className="p-4 text-gray-500 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} /> {order.governorate}
                                                </div>
                                                <div className="pl-4 text-[10px] truncate max-w-[100px]">{order.address}</div>
                                            </td>

                                            {/* تغيير الحالة */}
                                            <td className="p-4">
                                                <div className="relative inline-block group">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all hover:shadow-sm ${statusObj.color}`}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </td>

                                            {/* الأزرار (عرض وحذف) */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    {/* 👇 زر الحذف يظهر فقط لو الحالة Cancelled */}
                                                    {order.status === 'cancelled' && (
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                                            title="Delete Order Permanently"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                No orders found matching your filters.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* تفاصيل الطلب (Modal) */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Order #{selectedOrder.id}</h3>
                                <p className="text-xs text-gray-500">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle size={24} /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* بيانات العميل */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer Details</h4>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600"><Phone size={18} /></div>
                                    <div>
                                        <p className="font-bold text-gray-800">{selectedOrder.customer_name}</p>
                                        <p className="text-sm text-gray-600">{selectedOrder.phone || 'No phone number'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 mt-2">
                                    <div className="bg-gray-50 p-2 rounded-full text-gray-600"><MapPin size={18} /></div>
                                    <p className="text-sm text-gray-600 leading-snug">{selectedOrder.address}, {selectedOrder.governorate}</p>
                                </div>
                            </div>

                            <hr className="border-dashed" />

                            {/* تفاصيل المنتج */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Order Items</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{selectedOrder.items?.productName}</p>
                                            <p className="text-xs text-gray-500">{selectedOrder.items?.category || 'Category: N/A'}</p>
                                            {selectedOrder.items?.customText && (
                                                <p className="text-sm mt-1 bg-white px-2 py-1 rounded border inline-block text-gray-600">
                                                    "{selectedOrder.items.customText}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">{selectedOrder.total_price} EGP</p>
                                            {/* تفاصيل السعر الافتراضية */}
                                            <p className="text-[10px] text-gray-400">Total w/ Shipping</p>
                                        </div>
                                    </div>
                                    {selectedOrder.items?.refImage && (
                                        <div className="mt-3">
                                            <p className="text-[10px] text-gray-400 mb-1">Reference Image:</p>
                                            <img src={selectedOrder.items.refImage} className="w-full h-32 object-cover rounded-lg border" alt="ref" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ملاحظات */}
                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                    <strong>📝 Notes:</strong> {selectedOrder.notes}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer (Actions) */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            {selectedOrder.status === 'cancelled' && (
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                                >
                                    <Trash2 size={16} /> Delete Permanently
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders