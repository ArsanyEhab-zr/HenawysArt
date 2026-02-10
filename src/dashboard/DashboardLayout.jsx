import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    UserCircle
} from 'lucide-react'

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [userName, setUserName] = useState('')
    const [userAvatar, setUserAvatar] = useState(null) // 👈 1. ضفنا حالة للصورة
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    // 1. جلب بيانات المستخدم وصلاحيته
    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    navigate('/login')
                    return
                }

                // 👇 2. ضفنا avatar_url في الـ select
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role, full_name, avatar_url')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                setUserRole(data?.role)
                setUserName(data?.full_name || 'Admin')
                setUserAvatar(data?.avatar_url) // 👈 تخزين الصورة
            } catch (error) {
                console.error('Error fetching profile:', error)
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        getProfile()
    }, [navigate])

    // 2. قفل القائمة أوتوماتيك لما تغير الصفحة في الموبايل
    useEffect(() => {
        setSidebarOpen(false)
    }, [location])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    // 3. تعريف القائمة والصلاحيات
    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Overview',
            roles: ['admin', 'employee']
        },
        {
            path: '/dashboard/orders',
            icon: ShoppingBag,
            label: 'Orders',
            roles: ['admin', 'employee']
        },
        {
            path: '/dashboard/products',
            icon: Package,
            label: 'Products',
            roles: ['admin', 'employee']
        },
        {
            path: '/dashboard/users',
            icon: Users,
            label: 'Staff & Users',
            roles: ['admin']
        },
        {
            path: '/dashboard/settings',
            icon: Settings,
            label: 'Settings',
            roles: ['admin']
        },
    ]

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= Sidebar ================= */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0
      `}>
                <div className="h-full flex flex-col">

                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* User Info Snippet (الجزء المعدل 🌟) */}
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            {/* 👇 هنا بنعرض الصورة لو موجودة، أو الأيقونة لو مفيش */}
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0 border border-indigo-200">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'} // حماية لو الرابط بايظ
                                    />
                                ) : (
                                    <UserCircle size={24} className="text-indigo-600" />
                                )}
                            </div>

                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-800 truncate" title={userName}>{userName}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{userRole}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            (userRole && item.roles.includes(userRole)) && (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm
                    ${isActive
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <item.icon size={20} className={({ isActive }) => isActive ? 'text-indigo-600' : 'text-gray-400'} />
                                    {item.label}
                                </NavLink>
                            )
                        ))}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* ================= Main Content ================= */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">

                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden flex-shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-gray-800">Dashboard</span>
                    <div className="w-10"></div>
                </header>

                {/* Page Content Scrollable Area */}
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </div>

            </main>
        </div>
    )
}

export default DashboardLayout