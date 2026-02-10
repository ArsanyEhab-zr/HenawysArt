import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    Package, Clock, CheckCircle, XCircle
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { format, subDays } from 'date-fns'

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalProducts: 0
    })
    const [salesData, setSalesData] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // 1. جلب كل الطلبات
            const { data: allOrders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError

            // 2. جلب أعلى المنتجات مبيعاً
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('sold_count', { ascending: false })
                .limit(5)

            if (productsError) throw productsError

            // --- 🧠 المنطق الذكي للحسابات ---

            let revenue = 0
            let active = 0
            let completed = 0

            allOrders.forEach(order => {
                const status = order.status; // pending, confirmed, shipped, delivered, cancelled
                const amount = Number(order.total_price || 0);

                // 1. حساب الريفنيو (الأرباح)
                // بنحسب الفلوس لو الحالة: مؤكد، أو مشحون، أو تم التوصيل
                // (Pending مش بنحسبه لسه، و Cancelled مش بنحسبه خالص)
                if (['confirmed', 'shipped', 'delivered'].includes(status)) {
                    revenue += amount;
                }

                // 2. حساب الطلبات النشطة (Active)
                // أي طلب لسه شغال (انتظار، مؤكد، أو خرج للشحن)
                if (['pending', 'confirmed', 'shipped'].includes(status)) {
                    active++;
                }

                // 3. حساب الطلبات المكتملة (Completed)
                // اللي وصل للعميل فقط
                if (status === 'delivered') {
                    completed++;
                }
            });

            setStats({
                totalRevenue: revenue,
                activeOrders: active,
                completedOrders: completed,
                totalProducts: products.length
            })

            // --- تجهيز الرسم البياني (Sales Chart) ---
            // هنا بنعرض المبيعات "المؤكدة" بس في الرسم البياني
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(new Date(), i)
                return format(d, 'MMM dd')
            }).reverse()

            const chartData = last7Days.map(dateStr => {
                const daySales = allOrders
                    .filter(o =>
                        format(new Date(o.created_at), 'MMM dd') === dateStr &&
                        ['confirmed', 'shipped', 'delivered'].includes(o.status) // شرط الفلوس المؤكدة
                    )
                    .reduce((sum, o) => sum + Number(o.total_price || 0), 0)

                return { name: dateStr, sales: daySales }
            })
            setSalesData(chartData)

            setTopProducts(products)
            setRecentOrders(allOrders.slice(0, 5))

        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
    }

    return (
        <div className="space-y-6">

            {/* 1. Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's your business performance.</p>
            </div>

            {/* 2. Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`${stats.totalRevenue.toLocaleString()} EGP`}
                    subValue="Confirmed & Delivered"
                    icon={DollarSign}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Active Orders"
                    value={stats.activeOrders}
                    subValue="Pending & In-Progress"
                    icon={Clock}
                    color="bg-orange-100 text-orange-600"
                />
                <StatCard
                    title="Completed Orders"
                    value={stats.completedOrders}
                    subValue="Successfully Delivered"
                    icon={CheckCircle}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Top Products"
                    value={stats.totalProducts}
                    subValue="Best sellers count"
                    icon={Package}
                    color="bg-purple-100 text-purple-600"
                />
            </div>

            {/* 3. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Analytics (Confirmed Orders)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${value} EGP`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Best Sellers</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="title"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="sold_count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#94a3b8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{order.customer_name}</td>
                                    <td className="p-4">
                                        {/* Status Badge Logic */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700' // Pending
                                            }`}>
                                            {order.status ? order.status.toUpperCase() : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{order.total_price} EGP</td>
                                    <td className="p-4 text-gray-500 text-sm">{order.governorate}</td>
                                    <td className="p-4 text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentOrders.length === 0 && <div className="p-8 text-center text-gray-500">No orders yet.</div>}
                </div>
            </div>

        </div>
    )
}

// Card Component
const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={24} />
        </div>
    </div>
)

export default DashboardHome