import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Search, Shield, ShieldAlert, User,
    CheckCircle, XCircle, Loader2, Ban, Trash2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null) // 👈 عشان نعرف مين اللي فاتح

    useEffect(() => {
        fetchCurrentUser()
        fetchUsers()
    }, [])

    // 1. نعرف مين اللي فاتح عشان نمنعه يحذف نفسه
    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)
    }

    // 2. نجيب قائمة المستخدمين
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load users. Check permissions!")
        } finally {
            setLoading(false)
        }
    }

    // تغيير الصلاحية
    const toggleRole = async (id, currentRole) => {
        if (id === currentUserId) return toast.error("You cannot change your own role!") // 🛡️ حماية

        const newRole = currentRole === 'admin' ? 'employee' : 'admin'
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id)

            if (error) throw error

            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
            toast.success(`User role updated to ${newRole}`)
        } catch (error) {
            toast.error("Error updating role")
        }
    }

    // حظر المستخدم
    const toggleBlock = async (id, currentStatus) => {
        if (id === currentUserId) return toast.error("You cannot block yourself!") // 🛡️ حماية

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: !currentStatus })
                .eq('id', id)

            if (error) throw error

            setUsers(users.map(u => u.id === id ? { ...u, is_blocked: !currentStatus } : u))
            toast.success(currentStatus ? "User Unblocked" : "User Blocked")
        } catch (error) {
            toast.error("Error updating status")
        }
    }

    // حذف المستخدم
    const handleDeleteUser = async (id) => {
        if (id === currentUserId) return toast.error("You cannot delete your own profile!") // 🛡️ حماية
        if (!window.confirm("Warning: This removes the profile data only. Are you sure?")) return

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id)
            if (error) throw error

            setUsers(users.filter(u => u.id !== id))
            toast.success("Profile deleted")
        } catch (error) {
            toast.error("Error deleting profile")
        }
    }

    const filteredUsers = users.filter(u =>
        (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
                    <p className="text-gray-500 text-sm">Control access and roles.</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <tr>
                                    <th className="p-4">User Info</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => {
                                    const isMe = user.id === currentUserId // هل ده أنا؟
                                    return (
                                        <tr key={user.id} className={`transition-colors ${isMe ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg overflow-hidden border border-gray-200">
                                                        {/* 👇 التعديل هنا: لو فيه صورة اعرضها، لو مفيش اعرض الحرف */}
                                                        {user.avatar_url ? (
                                                            <img
                                                                src={user.avatar_url}
                                                                alt={user.full_name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.style.display = 'none' }} // لو الرابط بايظ اخفيه واعرض الحرف
                                                            />
                                                        ) : (
                                                            user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 flex items-center gap-2">
                                                            {user.full_name || 'Unknown Name'}
                                                            {isMe && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">YOU</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{user.email || 'No Email'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleRole(user.id, user.role)}
                                                    disabled={isMe} // ممنوع تغير رتبة نفسك
                                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${user.role === 'admin'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        } ${!isMe && 'hover:shadow-sm cursor-pointer'} ${isMe && 'opacity-70 cursor-not-allowed'}`}
                                                >
                                                    {user.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                                    {user.role === 'admin' ? 'Administrator' : 'Employee'}
                                                </button>
                                            </td>

                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                                                    disabled={isMe} // ممنوع تحظر نفسك
                                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all ${user.is_blocked
                                                            ? 'bg-red-50 text-red-600 border-red-200'
                                                            : 'bg-green-50 text-green-600 border-green-200'
                                                        } ${!isMe && 'hover:shadow-sm cursor-pointer'} ${isMe && 'opacity-70 cursor-not-allowed'}`}
                                                >
                                                    {user.is_blocked ? <Ban size={12} /> : <CheckCircle size={12} />}
                                                    {user.is_blocked ? 'Blocked' : 'Active'}
                                                </button>
                                            </td>

                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={isMe} // ممنوع تمسح نفسك
                                                    className={`p-2 transition-colors rounded-lg ${isMe ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center text-gray-400">No users found.</div>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
}

export default Users