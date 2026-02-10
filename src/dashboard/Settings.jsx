import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Truck, Tag, Save, Plus, Trash2, Calendar,
    Percent, DollarSign, CheckCircle, XCircle, Loader2, AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Settings = () => {
    const [activeTab, setActiveTab] = useState('shipping') // shipping | coupons
    const [loading, setLoading] = useState(true)

    // Data States
    const [shippingRates, setShippingRates] = useState([])
    const [coupons, setCoupons] = useState([])

    // Modal States (For Coupons)
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
    const [couponForm, setCouponForm] = useState({
        code: '',
        discount_value: '',
        discount_type: 'percent', // or 'fixed'
        start_date: '',
        end_date: '',
        is_active: true
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // 1. Get Shipping Rates
            const { data: rates, error: ratesError } = await supabase
                .from('shipping_rates')
                .select('*')
                .order('governorate', { ascending: true })

            if (ratesError) throw ratesError
            setShippingRates(rates)

            // 2. Get Coupons
            const { data: couponsData, error: couponsError } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false })

            if (couponsError) throw couponsError
            setCoupons(couponsData)

        } catch (error) {
            toast.error("Failed to load settings")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // ==================== SHIPPING LOGIC ====================
    const handleUpdateShipping = async (id, newFee) => {
        try {
            const { error } = await supabase
                .from('shipping_rates')
                .update({ fee: newFee })
                .eq('id', id)

            if (error) throw error
            toast.success("Shipping rate updated")

            // Update local state
            setShippingRates(prev => prev.map(item =>
                item.id === id ? { ...item, fee: newFee } : item
            ))
        } catch (error) {
            toast.error("Error updating rate")
        }
    }

    // ==================== COUPON LOGIC ====================
    const handleSaveCoupon = async (e) => {
        e.preventDefault()
        if (!couponForm.code || !couponForm.discount_value) return toast.error("Please fill required fields")

        try {
            const newCoupon = {
                code: couponForm.code.toUpperCase(),
                discount_value: Number(couponForm.discount_value),
                discount_type: couponForm.discount_type,
                start_date: couponForm.start_date || new Date().toISOString(),
                end_date: couponForm.end_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
                is_active: couponForm.is_active
            }

            const { data, error } = await supabase
                .from('coupons')
                .insert([newCoupon])
                .select()

            if (error) throw error

            setCoupons([data[0], ...coupons])
            toast.success("Coupon created successfully")
            setIsCouponModalOpen(false)
            // Reset Form
            setCouponForm({
                code: '',
                discount_value: '',
                discount_type: 'percent',
                start_date: '',
                end_date: '',
                is_active: true
            })
        } catch (error) {
            console.error(error)
            toast.error("Error creating coupon")
        }
    }

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
            toast.success(`Coupon ${!currentStatus ? 'Activated' : 'Deactivated'}`)
        } catch (error) {
            toast.error("Error updating status")
        }
    }

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id)
            if (error) throw error
            setCoupons(prev => prev.filter(c => c.id !== id))
            toast.success("Coupon deleted")
        } catch (error) {
            toast.error("Error deleting coupon")
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={40} /></div>

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>

                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                    <button
                        onClick={() => setActiveTab('shipping')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'shipping' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Truck size={16} /> Shipping Rates
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'coupons' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Tag size={16} /> Promo Codes
                    </button>
                </div>
            </div>

            {/* ================= CONTENT: SHIPPING ================= */}
            {activeTab === 'shipping' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Manage Shipping Fees</h2>
                        <p className="text-sm text-gray-500">Set delivery cost for each governorate.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {shippingRates.map((rate) => (
                            <div key={rate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-medium text-gray-700">{rate.governorate}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        defaultValue={rate.fee}
                                        onBlur={(e) => {
                                            if (Number(e.target.value) !== rate.fee) {
                                                handleUpdateShipping(rate.id, e.target.value)
                                            }
                                        }}
                                        className="w-20 px-2 py-1 border rounded text-center font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                    <span className="text-xs text-gray-400">EGP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {shippingRates.length === 0 && <div className="p-6 text-center text-gray-500">No rates found. Please run SQL setup.</div>}
                </div>
            )}

            {/* ================= CONTENT: COUPONS ================= */}
            {activeTab === 'coupons' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsCouponModalOpen(true)}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
                        >
                            <Plus size={18} /> Create Coupon
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4">Code</th>
                                        <th className="p-4">Discount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Usage</th>
                                        <th className="p-4">Expires</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold text-gray-800">{coupon.code}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.discount_type === 'percent' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                    {coupon.discount_value} {coupon.discount_type === 'percent' ? '%' : 'EGP'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${coupon.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                                >
                                                    {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">{coupon.usage_count || 0} times</td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(coupon.end_date).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {coupons.length === 0 && <div className="p-8 text-center flex flex-col items-center text-gray-400">
                                <Tag size={40} className="mb-2 opacity-20" />
                                <p>No coupons yet.</p>
                            </div>}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: ADD COUPON ================= */}
            {isCouponModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Create New Coupon</h3>
                            <button onClick={() => setIsCouponModalOpen(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    value={couponForm.code}
                                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded-lg uppercase font-bold tracking-wider"
                                    placeholder="SUMMER2025"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input
                                        type="number"
                                        value={couponForm.discount_value}
                                        onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="10"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={couponForm.discount_type}
                                        onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg bg-white"
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (EGP)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={couponForm.start_date}
                                        onChange={e => setCouponForm({ ...couponForm, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={couponForm.end_date}
                                        onChange={e => setCouponForm({ ...couponForm, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-all mt-4"
                            >
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Settings