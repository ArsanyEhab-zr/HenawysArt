import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Truck, Tag, Save, Plus, Trash2, Calendar,
    Percent, DollarSign, CheckCircle, XCircle, Loader2, AlertCircle, Users, Layers, UserCheck, ShoppingBag // ضفنا ShoppingBag
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ShippingRateItem = ({ rate, handleUpdateShipping }) => {
    const [localFee, setLocalFee] = useState(rate.fee)
    const [localDays, setLocalDays] = useState(rate.estimated_days || '10-14 days')

    return (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="font-bold text-gray-800">{rate.governorate}</span>
            <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">Fee (EGP):</span>
                    <input
                        type="number"
                        value={localFee}
                        onChange={e => setLocalFee(e.target.value)}
                        onBlur={(e) => {
                            if (Number(e.target.value) !== rate.fee || localDays !== rate.estimated_days) {
                                handleUpdateShipping(rate.id, e.target.value, localDays)
                            }
                        }}
                        className="w-20 px-2 py-1 border rounded text-center font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">Days:</span>
                    <input
                        type="text"
                        value={localDays}
                        onChange={e => setLocalDays(e.target.value)}
                        onBlur={(e) => {
                            if (Number(localFee) !== rate.fee || e.target.value !== rate.estimated_days) {
                                handleUpdateShipping(rate.id, localFee, e.target.value)
                            }
                        }}
                        placeholder="e.g. 3-5 days"
                        className="w-24 px-2 py-1 border rounded text-center text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
            </div>
        </div>
    )
}

const Settings = () => {
    const [activeTab, setActiveTab] = useState('shipping')
    const [loading, setLoading] = useState(true)

    const [shippingRates, setShippingRates] = useState([])
    const [coupons, setCoupons] = useState([])
    const [availableCategories, setAvailableCategories] = useState([])

    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
    const [couponForm, setCouponForm] = useState({
        code: '',
        discount_value: '',
        discount_type: 'percent',
        start_date: '',
        end_date: '',
        is_active: true,
        usage_limit: 100,
        min_order_value: 0,
        per_user_limit: 1,
        target_categories: ['all'],
        coupon_scope: 'item' // 👇 نوع الكوبون الجديد
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: rates, error: ratesError } = await supabase.from('shipping_rates').select('*').order('governorate', { ascending: true })
            if (ratesError) throw ratesError
            setShippingRates(rates)

            const { data: couponsData, error: couponsError } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
            if (couponsError) throw couponsError
            setCoupons(couponsData)

            const { data: productsData, error: productsError } = await supabase.from('products').select('category')
            if (productsError) throw productsError
            const uniqueCats = [...new Set(productsData.map(item => item.category).filter(Boolean))]
            setAvailableCategories(uniqueCats)

        } catch (error) {
            toast.error("Failed to load settings")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateShipping = async (id, newFee, newDays) => {
        try {
            const { error } = await supabase.from('shipping_rates').update({ fee: newFee, estimated_days: newDays }).eq('id', id)
            if (error) throw error
            toast.success("Shipping rate updated")
            setShippingRates(prev => prev.map(item => item.id === id ? { ...item, fee: newFee, estimated_days: newDays } : item))
        } catch (error) {
            toast.error("Error updating rate")
        }
    }

    const handleCategoryToggle = (cat) => {
        setCouponForm(prev => {
            let newCats = [...(prev.target_categories || [])];
            if (cat === 'all') {
                newCats = ['all'];
            } else {
                newCats = newCats.filter(c => c !== 'all');
                if (newCats.includes(cat)) {
                    newCats = newCats.filter(c => c !== cat);
                } else {
                    newCats.push(cat);
                }
                if (newCats.length === 0) newCats = ['all'];
            }
            return { ...prev, target_categories: newCats };
        });
    }

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
                is_active: couponForm.is_active,
                usage_limit: Number(couponForm.usage_limit) || 100,
                used_count: 0,
                min_order_value: Number(couponForm.min_order_value) || 0,
                per_user_limit: Number(couponForm.per_user_limit) || 1,
                target_categories: couponForm.target_categories,
                coupon_scope: couponForm.coupon_scope // 👇 الحفظ
            }

            const { data, error } = await supabase.from('coupons').insert([newCoupon]).select()
            if (error) throw error

            setCoupons([data[0], ...coupons])
            toast.success("Coupon created successfully")
            setIsCouponModalOpen(false)
            setCouponForm({
                code: '', discount_value: '', discount_type: 'percent',
                start_date: '', end_date: '', is_active: true, usage_limit: 100,
                min_order_value: 0, per_user_limit: 1, target_categories: ['all'], coupon_scope: 'item'
            })
        } catch (error) {
            toast.error("Error creating coupon")
        }
    }

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id)
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                    <button onClick={() => setActiveTab('shipping')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'shipping' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Truck size={16} /> Shipping Rates
                    </button>
                    <button onClick={() => setActiveTab('coupons')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'coupons' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Tag size={16} /> Promo Codes
                    </button>
                </div>
            </div>

            {activeTab === 'shipping' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Manage Shipping Fees</h2>
                        <p className="text-sm text-gray-500">Set delivery cost and estimated days for each governorate.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {shippingRates.map((rate) => (
                            <ShippingRateItem key={rate.id} rate={rate} handleUpdateShipping={handleUpdateShipping} />
                        ))}
                    </div>
                    {shippingRates.length === 0 && <div className="p-6 text-center text-gray-500">No rates found. Please run SQL setup.</div>}
                </div>
            )}

            {activeTab === 'coupons' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setIsCouponModalOpen(true)} className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all">
                            <Plus size={18} /> Create Coupon
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm">
                                    <tr>
                                        <th className="p-4">Code</th>
                                        <th className="p-4">Rules & Scope</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Usage</th>
                                        <th className="p-4">Expires</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold text-gray-800">
                                                {coupon.code}
                                                {/* 👇 إظهار نوع الكوبون في الجدول */}
                                                <div className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded border ${coupon.coupon_scope === 'cart' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                                    {coupon.coupon_scope === 'cart' ? 'Whole Cart' : 'Single Item'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${coupon.discount_type === 'percent' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                        {coupon.discount_value} {coupon.discount_type === 'percent' ? '%' : 'EGP'}
                                                    </span>
                                                    {coupon.min_order_value > 0 && <span className="text-[10px] text-gray-500 border rounded px-1.5 bg-white">Min: {coupon.min_order_value} EGP</span>}
                                                    {coupon.target_categories && !coupon.target_categories.includes('all') && (
                                                        <span className="text-[10px] text-gray-500 border rounded px-1.5 bg-white line-clamp-1 max-w-[150px]" title={coupon.target_categories.join(', ')}>
                                                            For: {coupon.target_categories.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${coupon.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {coupon.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />} {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-bold">{coupon.used_count || 0}</span> / {coupon.usage_limit || '∞'} Total
                                                </div>
                                                <div className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                                                    Max {coupon.per_user_limit || 1}/person
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(coupon.end_date).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {coupons.length === 0 && <div className="p-8 text-center flex flex-col items-center text-gray-400"><Tag size={40} className="mb-2 opacity-20" /><p>No coupons yet.</p></div>}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: ADD COUPON ================= */}
            {isCouponModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Create Advanced Coupon</h3>
                            <button type="button" onClick={() => setIsCouponModalOpen(false)}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                                <input type="text" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg uppercase font-bold tracking-wider" placeholder="SUMMER2025" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input type="number" value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="10" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white">
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (EGP)</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                                {/* 👇 خانة تحديد نطاق الكوبون 👇 */}
                                <div>
                                    <label className="flex items-center gap-1 text-sm font-bold text-blue-900 mb-2">
                                        <ShoppingBag size={14} /> Coupon Scope
                                    </label>
                                    <div className="flex gap-2">
                                        <label className={`flex-1 cursor-pointer p-2 border rounded-lg text-center text-sm font-bold transition-all ${couponForm.coupon_scope === 'item' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 hover:border-primary/50'}`}>
                                            <input type="radio" name="scope" value="item" checked={couponForm.coupon_scope === 'item'} onChange={() => setCouponForm({ ...couponForm, coupon_scope: 'item' })} className="hidden" />
                                            Single Item
                                        </label>
                                        <label className={`flex-1 cursor-pointer p-2 border rounded-lg text-center text-sm font-bold transition-all ${couponForm.coupon_scope === 'cart' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 hover:border-orange-500/50'}`}>
                                            <input type="radio" name="scope" value="cart" checked={couponForm.coupon_scope === 'cart'} onChange={() => setCouponForm({ ...couponForm, coupon_scope: 'cart' })} className="hidden" />
                                            Whole Cart
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-blue-700 mt-1">
                                        {couponForm.coupon_scope === 'item' ? "Applied inside the product modal (before adding to cart)." : "Applied in the cart to the total subtotal."}
                                    </p>
                                </div>

                                {/* الفئات بتختفي لو الكوبون للسلة كلها لأن السلة فيها منتجات ميكس */}
                                {couponForm.coupon_scope === 'item' && (
                                    <div>
                                        <label className="flex items-center gap-1 text-sm font-bold text-blue-900 mb-2">
                                            <Layers size={14} /> Target Categories (Select Multiple)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => handleCategoryToggle('all')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${couponForm.target_categories.includes('all') ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                                                All Categories
                                            </button>
                                            {availableCategories.map(cat => (
                                                <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${couponForm.target_categories.includes(cat) && !couponForm.target_categories.includes('all') ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="flex items-center gap-1 text-sm font-bold text-blue-900 mb-1">
                                        <DollarSign size={14} /> Min. Order Value
                                    </label>
                                    <input type="number" value={couponForm.min_order_value} onChange={e => setCouponForm({ ...couponForm, min_order_value: e.target.value })} className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm" placeholder="0 for no limit" min="0" />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Users size={16} /> Total Limit</label>
                                    <input type="number" value={couponForm.usage_limit} onChange={e => setCouponForm({ ...couponForm, usage_limit: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="100" min="1" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><UserCheck size={16} /> Per User Limit</label>
                                    <input type="number" value={couponForm.per_user_limit} onChange={e => setCouponForm({ ...couponForm, per_user_limit: e.target.value })} className="w-full px-3 py-2 border border-primary/50 bg-primary/5 rounded-lg font-bold text-primary" placeholder="1" min="1" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" value={couponForm.start_date} onChange={e => setCouponForm({ ...couponForm, start_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" value={couponForm.end_date} onChange={e => setCouponForm({ ...couponForm, end_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-all mt-4">
                                Save Advanced Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings