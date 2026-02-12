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
    UserCircle,
    Layers, // أيقونة الـ Addons
    Camera, // أيقونة تغيير الصورة
    Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [userName, setUserName] = useState('')
    const [userAvatar, setUserAvatar] = useState(null)
    const [userId, setUserId] = useState(null) // 👈 حفظنا الـ ID عشان التحديث
    const [loading, setLoading] = useState(true)

    // States for Profile Modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
    const [newAvatarFile, setNewAvatarFile] = useState(null)
    const [newAvatarPreview, setNewAvatarPreview] = useState(null)
    const [newFullName, setNewFullName] = useState('')
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

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

                setUserId(user.id)

                const { data, error } = await supabase
                    .from('profiles')
                    .select('role, full_name, avatar_url')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                setUserRole(data?.role)
                setUserName(data?.full_name || 'Admin')
                setUserAvatar(data?.avatar_url)

                // Set initial values for modal
                setNewFullName(data?.full_name || '')
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
        navigate('/')
    }

    // 👇👇 دالة تحديث البروفايل 👇👇
    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setIsUpdatingProfile(true)

        try {
            let avatarUrl = userAvatar

            // 1. لو فيه صورة جديدة، ارفعها
            if (newAvatarFile) {
                const fileExt = newAvatarFile.name.split('.').pop()
                const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('product-images') // ممكن تعمل bucket مخصص للـ avatars لو حابب
                    .upload(fileName, newAvatarFile)

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName)

                avatarUrl = data.publicUrl
            }

            // 2. تحديث جدول profiles
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: newFullName,
                    avatar_url: avatarUrl,
                    updated_at: new Date()
                })
                .eq('id', userId)

            if (updateError) throw updateError

            // 3. تحديث الواجهة
            setUserName(newFullName)
            setUserAvatar(avatarUrl)
            toast.success('Profile updated successfully!')
            setIsProfileModalOpen(false)

        } catch (error) {
            console.error(error)
            toast.error('Failed to update profile')
        } finally {
            setIsUpdatingProfile(false)
        }
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
        // 👇👇 العنصر الجديد: Add-ons 👇👇
        {
            path: '/dashboard/addons',
            icon: Layers,
            label: 'Add-ons',
            roles: ['admin'] // الأدمن بس اللي يعدل الإضافات
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

                    {/* User Info Snippet (Clickable to Edit) */}
                    <div
                        className="p-4 border-b border-gray-50 bg-gray-50/50 cursor-pointer hover:bg-indigo-50/50 transition-colors group relative"
                        onClick={() => setIsProfileModalOpen(true)}
                        title="Click to edit profile"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0 border border-indigo-200 relative">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <UserCircle size={24} className="text-indigo-600" />
                                )}
                                {/* Edit Overlay Icon */}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Settings size={14} className="text-white" />
                                </div>
                            </div>

                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
                                    {userName}
                                </p>
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

            {/* 👇👇👇 Profile Edit Modal 👇👇👇 */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Edit Profile</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">

                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative group cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-indigo-500 overflow-hidden">
                                    {(newAvatarPreview || userAvatar) ? (
                                        <img
                                            src={newAvatarPreview || userAvatar}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-400">
                                            <UserCircle size={40} />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" />
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (file) {
                                                setNewAvatarFile(file)
                                                setNewAvatarPreview(URL.createObjectURL(file))
                                            }
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500">Tap to change photo</span>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isUpdatingProfile ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardLayout