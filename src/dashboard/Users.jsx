import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
    Trash2, Shield, ShieldOff, Lock, Unlock, Search,
    User, Mail, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast' // لو مش منزلها استخدم alert عادي

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)

    useEffect(() => {
        fetchUsers()
        getCurrentUser()
    }, [])

    // 1. معرفة مين اللي فاتح عشان ميحذفش نفسه
    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id)
    }

    // 2. جلب كل المستخدمين
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data)
        } catch (error) {
            toast.error("Failed to load users")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // 3. دالة الحظر / فك الحظر
    const toggleBlock = async (id, currentStatus) => {
        if (id === currentUserId) return toast.error("You cannot block yourself!")

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_blocked: !currentStatus })
                .eq('id', id)

            if (error) throw error

            // تحديث الواجهة فوراً
            setUsers(users.map(user =>
                user.id === id ? { ...user, is_blocked: !currentStatus } : user
            ))

            toast.success(currentStatus ? "User Unblocked" : "User Blocked")
        } catch (error) {
            toast.error("Error updating status")
        }
    }

    // 4. دالة تغيير الدور (ترقية/تنزيل)
    const toggleRole = async (id, currentRole) => {
        if (id === currentUserId) return toast.error("You cannot change your own role!")

        const newRole = currentRole === 'admin' ? 'employee' : 'admin'

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id)

            if (error) throw error

            setUsers(users.map(user =>
                user.id === id ? { ...user, role: newRole } : user
            ))

            toast.success(`User is now an ${newRole}`)
        } catch (error) {
            toast.error("Error updating role")
        }
    }

    // 5. دالة الحذف
    const handleDelete = async (id) => {
        if (id === currentUserId) return toast.error("You cannot delete yourself!")

        if (!window.confirm("Are you sure? This action cannot be undone.")) return

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id)

            if (error) throw error

            setUsers(users.filter(user => user.id !== id))
            toast.success("User deleted successfully")
        } catch (error) {
            toast.error("Error deleting user")
        }
    }

    // فلتر البحث
    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                    <p className="text-gray-500 text-sm">Manage staff access and roles</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                                        {/* User Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-gray-400" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{user.full_name || 'No Name'}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Mail size={10} />
                                                        {user.email || 'No Email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit
                        ${user.role === 'admin'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="p-4">
                                            {user.is_blocked ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1 w-fit">
                                                    <Lock size={12} /> BLOCKED
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 w-fit">
                                                    <CheckCircle size={12} /> ACTIVE
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions Buttons */}
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">

                                                {/* Change Role Button */}
                                                <button
                                                    onClick={() => toggleRole(user.id, user.role)}
                                                    title="Change Role"
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
                                                >
                                                    {user.role === 'admin' ? <ShieldOff size={18} /> : <Shield size={18} />}
                                                </button>

                                                {/* Block/Unblock Button */}
                                                <button
                                                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                                                    title={user.is_blocked ? "Unblock User" : "Block User"}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_blocked
                                                            ? 'text-green-500 hover:bg-green-50'
                                                            : 'text-orange-500 hover:bg-orange-50'
                                                        }`}
                                                >
                                                    {user.is_blocked ? <Unlock size={18} /> : <Lock size={18} />}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Delete User"
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && !loading && (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <AlertCircle size={40} className="mb-2 opacity-20" />
                                <p>No users found matching "{search}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Users