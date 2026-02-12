import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Plus, Search, Edit, Trash2, X,
    Image as ImageIcon, Loader2, Save, Tag, DollarSign, Layers, Settings, CheckSquare, MousePointer2, Upload
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

const Addons = () => {
    const [addons, setAddons] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAddon, setEditingAddon] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        category_target: 'all',
        ui_type: 'checkbox',
        operation_type: 'fixed',
        image_url: ''
    })

    useEffect(() => {
        fetchData()

        // Realtime Subscription
        const channel = supabase
            .channel('realtime-addons')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_addons' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setAddons(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))
                } else if (payload.eventType === 'INSERT') {
                    setAddons(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setAddons(prev => prev.filter(item => item.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Fetch Addons
            const { data: addonsData, error: addonsError } = await supabase
                .from('product_addons')
                .select('*')
                .order('id', { ascending: true })

            if (addonsError) throw addonsError
            setAddons(addonsData || [])

            // Fetch Categories (for target selection)
            const { data: catData } = await supabase.from('categories').select('*')
            setCategories(catData || [])

        } catch (error) {
            toast.error('Error fetching data')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploadingImage(true)
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true, fileType: 'image/webp' }

        try {
            const compressedFile = await imageCompression(file, options)
            const fileName = `addons/${Date.now()}.webp` // 👈 بنحطها في فولدر addons

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, compressedFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            setFormData({ ...formData, image_url: data.publicUrl })
            toast.success('Image uploaded!')
        } catch (error) {
            console.error(error)
            toast.error('Upload failed')
        } finally {
            setUploadingImage(false)
        }
    }

    const openModal = (addon = null) => {
        if (addon) {
            setEditingAddon(addon)
            setFormData({
                title: addon.title,
                value: addon.value,
                category_target: addon.category_target,
                ui_type: addon.ui_type,
                operation_type: addon.operation_type,
                image_url: addon.image_url
            })
        } else {
            setEditingAddon(null)
            setFormData({
                title: '',
                value: '',
                category_target: 'all',
                ui_type: 'checkbox',
                operation_type: 'fixed',
                image_url: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.value) return toast.error("Title and Value are required")

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                value: Number(formData.value)
            }

            if (editingAddon) {
                const { error } = await supabase.from('product_addons').update(payload).eq('id', editingAddon.id)
                if (error) throw error
                toast.success('Addon updated')
            } else {
                const { error } = await supabase.from('product_addons').insert([payload])
                if (error) throw error
                toast.success('Addon created')
            }
            setIsModalOpen(false)
        } catch (error) {
            toast.error('Error saving addon')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this addon?")) return
        try {
            const { error } = await supabase.from('product_addons').delete().eq('id', id)
            if (error) throw error
            toast.success('Addon deleted')
        } catch (error) {
            toast.error('Error deleting')
        }
    }

    const filteredAddons = addons.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category_target.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add-ons Manager</h1>
                    <p className="text-gray-500 text-sm">Control extra items (Box, Medals, Wrapping)</p>
                </div>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={20} /> New Addon
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search addons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAddons.map(addon => (
                        <div key={addon.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group relative">
                            {/* Image */}
                            <div className="h-40 bg-gray-50 relative">
                                <img
                                    src={addon.image_url || 'https://via.placeholder.com/150'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm uppercase">
                                    {addon.category_target === 'all' ? 'All Products' : addon.category_target}
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => openModal(addon)} className="bg-white p-2 rounded-full text-blue-600 hover:scale-110 transition-all"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(addon.id)} className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800">{addon.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {addon.ui_type === 'checkbox' ? <CheckSquare size={14} /> : <MousePointer2 size={14} />}
                                        <span className="capitalize">{addon.ui_type}</span>
                                    </div>
                                    <span className="font-bold text-primary">
                                        {addon.operation_type.includes('percent') ? `${addon.value}%` : `${addon.value} EGP`}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 truncate">Type: {addon.operation_type.replace('_', ' ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingAddon ? 'Edit Addon' : 'New Addon'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div className="flex justify-center mb-4">
                                <div className="relative group cursor-pointer w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        uploadingImage ? <Loader2 className="animate-spin text-primary" /> : <ImageIcon className="text-gray-400" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                    <div className="relative">
                                        <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm" placeholder="e.g. Gift Box" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Value (Price/%)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm" placeholder="e.g. 50" required />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Target Category</label>
                                <div className="relative">
                                    <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <select value={formData.category_target} onChange={e => setFormData({ ...formData, category_target: e.target.value })} className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-white">
                                        <option value="all">All Products</option>
                                        {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">UI Type (Shape)</label>
                                    <select value={formData.ui_type} onChange={e => setFormData({ ...formData, ui_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                        <option value="checkbox">Checkbox (Multi)</option>
                                        <option value="radio">Radio (Single)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Operation (Math)</label>
                                    <select value={formData.operation_type} onChange={e => setFormData({ ...formData, operation_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                        <option value="fixed">Fixed Price (+EGP)</option>
                                        <option value="percent_add">Percent Add (+%)</option>
                                        <option value="percent_double_discount">Percent Discount (-%)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg shadow mt-2">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Save Addon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Addons