import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
// 👇 السطر ده هو اللي كان ناقصه Clock
import {
    Search, Filter, Eye, ChevronDown, Loader2, XCircle, Trash2, Phone, MapPin, DollarSign, Calendar, PackageCheck, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categories, setCategories] = useState(['All'])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedOrder, setSelectedOrder] = useState(null)

    const STATUS_OPTIONS = [
        { value: 'pending', label: 'Pending (قيد الانتظار)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { value: 'confirmed', label: 'Confirmed (مؤكد)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'shipped', label: 'Shipped (خرج للشحن)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        { value: 'delivered', label: 'Delivered (تم التوصيل)', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'cancelled', label: 'Cancelled (ملغي)', color: 'bg-red-100 text-red-800 border-red-200' },
    ]

    useEffect(() => {
        const initData = async () => {
            setLoading(true)
            await Promise.all([fetchOrders(), fetchCategories()])
            setLoading(false)
        }
        initData()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase.from('products').select('category')
            if (error) throw error
            const uniqueCategories = ['All', ...new Set(data.map(item => item.category).filter(Boolean))]
            setCategories(uniqueCategories)
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            toast.error("Error fetching orders")
        }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
            if (error) throw error
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            if (newStatus === 'confirmed') toast.success('Order Confirmed!')
            else if (newStatus === 'cancelled') toast.error('Order Cancelled')
            else toast.success('Status Updated')
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order permanently?")) return;
        try {
            const { error } = await supabase.from('orders').delete().eq('id', orderId)
            if (error) throw error
            setOrders(prev => prev.filter(o => o.id !== orderId))
            toast.success("Order deleted successfully")
            setSelectedOrder(null)
        } catch (error) {
            toast.error("Failed to delete order")
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })
        } catch (e) {
            return 'Invalid Date';
        }
    }

    const getStatusInfo = (status) => {
        return STATUS_OPTIONS.find(s => s.value === status) || {
            value: status,
            label: status || 'Unknown',
            color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.phone || '').includes(search) ||
            (o.id.toString()).includes(search);

        let matchesCategory = true;
        if (selectedCategory !== 'All') {
            const orderCategory = (o.items?.category || '').toLowerCase().trim();
            const filterCategory = selectedCategory.toLowerCase().trim();
            matchesCategory = orderCategory.includes(filterCategory);
        }
        return matchesSearch && matchesCategory;
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PackageCheck className="text-primary" /> Orders Management
                    </h1>
                    <p className="text-gray-500 text-xs mt-1">
                        Showing {filteredOrders.length} orders
                        {selectedCategory !== 'All' && <span className="font-bold text-primary ml-1">({selectedCategory})</span>}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" size={16} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg appearance-none bg-gray-50 hover:bg-white hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer w-full sm:w-48 text-sm font-medium transition-all"
                        >
                            {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-gray-400 text-sm">Loading orders...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-100 tracking-wider">
                                <tr>
                                    <th className="p-4 w-16 text-center">#</th>
                                    <th className="p-4">Customer Details</th>
                                    <th className="p-4">Product Info</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order, index) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    const items = order.items || {};

                                    return (
                                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-4 text-center">
                                                <span className="bg-gray-100 text-gray-500 font-mono text-[10px] px-2 py-1 rounded-md">
                                                    {filteredOrders.length - index}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 text-base">{order.customer_name}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                    <div className="bg-blue-50 text-blue-600 p-1 rounded-full"><Phone size={10} /></div>
                                                    {order.phone || 'No Phone'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                                                    <Calendar size={10} /> {formatDate(order.created_at)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {items.refImage ? (
                                                        <img src={items.refImage} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" alt="prod" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><PackageCheck size={16} /></div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-800 line-clamp-1">{items.productName || 'Unknown Item'}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                                                {items.category || 'N/A'}
                                                            </span>
                                                            <span className="text-xs font-bold text-primary flex items-center">
                                                                <DollarSign size={10} /> {order.total_price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-start gap-2 max-w-[150px]">
                                                    <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-xs text-gray-700">{order.governorate}</p>
                                                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{order.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer focus:outline-none transition-all hover:shadow-sm ${statusInfo.color}`}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setSelectedOrder(order)} className="p-2 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 rounded-lg transition-all shadow-sm">
                                                        <Eye size={16} />
                                                    </button>
                                                    {order.status === 'cancelled' && (
                                                        <button onClick={() => handleDeleteOrder(order.id)} className="p-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-lg transition-all shadow-sm">
                                                            <Trash2 size={16} />
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
                            <div className="p-16 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="text-gray-300" size={24} /></div>
                                <h3 className="text-gray-800 font-bold mb-1">No orders found</h3>
                                <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                                <button onClick={() => { setSearch(''); setSelectedCategory('All') }} className="mt-4 text-primary text-sm font-bold hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg border shadow-sm"><PackageCheck className="text-primary" size={20} /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Order #{selectedOrder.id}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {formatDate(selectedOrder.created_at)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-200 rounded-full"><XCircle size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold uppercase text-blue-800 mb-3 flex items-center gap-2"><Phone size={12} /> Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500 mb-1">Full Name</p><p className="font-bold text-gray-800">{selectedOrder.customer_name}</p></div>
                                    <div><p className="text-xs text-gray-500 mb-1">Phone Number</p><p className="font-bold text-gray-800 font-mono">{selectedOrder.phone || 'N/A'}</p></div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                            <p className="text-sm text-gray-700 font-medium">{selectedOrder.address}, {selectedOrder.governorate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(() => {
                                const items = selectedOrder.items || {};
                                return (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Product Details</h4>
                                        <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                            {items.refImage ? (
                                                <img src={items.refImage} className="w-24 h-24 rounded-lg object-cover border bg-white" alt="product" />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><PackageCheck size={30} /></div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-lg">{items.productName || 'Unknown Item'}</p>
                                                        <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500 mt-1 inline-block">{items.category || 'N/A'}</span>
                                                    </div>
                                                    <p className="font-bold text-primary text-lg">{selectedOrder.total_price} EGP</p>
                                                </div>
                                                {items.customText && (
                                                    <div className="mt-3 bg-white p-2 rounded border border-dashed border-gray-300">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Custom Text:</p>
                                                        <p className="text-sm font-medium text-gray-800">"{items.customText}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <h4 className="text-xs font-bold uppercase text-yellow-800 mb-2">Additional Notes</h4>
                                    <p className="text-sm text-yellow-900 leading-relaxed">{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusInfo(selectedOrder.status).color}`}>
                                Status: {getStatusInfo(selectedOrder.status).label}
                            </span>
                            <div className="flex gap-3">
                                {selectedOrder.status === 'cancelled' && (
                                    <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                )}
                                <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-bold shadow-lg shadow-gray-200">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders