import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Plus, Search, Edit, Trash2, X,
    Image as ImageIcon, Loader2, Save, Tag, DollarSign, Box, AlertCircle, Sparkles, Eye, Upload
} from 'lucide-react'
import { toast } from 'react-hot-toast'
// 👇 استيراد مكتبة الضغط
import imageCompression from 'browser-image-compression'

const Products = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        stock: 0,
        category: '',
        description: '',
        images: [],
        is_starting_price: false,
        price_note: '', // 👈 ضيف دي هنا
        is_new_arrival: false
    })

    // Uploading States
    const [uploadingImages, setUploadingImages] = useState(false)

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('realtime-products-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
                } else if (payload.eventType === 'INSERT') {
                    setProducts(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: pData, error: pError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (pError) throw pError
            setProducts(pData || [])

            const { data: cData } = await supabase.from('categories').select('*')
            setCategories(cData || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (product = null) => {
        const defaultCategory = categories.length > 0 ? categories[0].slug : ''
        if (product) {
            setEditingProduct(product)
            let currentImages = [];
            if (Array.isArray(product.images) && product.images.length > 0) {
                currentImages = product.images;
            } else if (product.image_url) {
                currentImages = [product.image_url];
            }

            setFormData({
                title: product.title || '',
                price: product.price || '',
                stock: product.stock || 0,
                category: product.category || defaultCategory,
                description: product.description || '',
                images: currentImages,
                is_starting_price: product.is_starting_price || false,
                price_note: product.price_note || '', // 👈 تحميل القيمة القديمة
                is_new_arrival: product.is_new_arrival || false
            })
        } else {
            setEditingProduct(null)
            setFormData({
                title: '',
                price: '',
                stock: 0,
                category: defaultCategory,
                description: '',
                images: [],
                is_starting_price: false,
                price_note: '',
                is_new_arrival: false
            })
        }
        setIsModalOpen(true)
    }

    // 👇👇 دالة الرفع الاحترافية (ضغط + تحويل WebP) 👇👇
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploadingImages(true)
        const newImageUrls = []

        // إعدادات الضغط
        const options = {
            maxSizeMB: 0.8,          // أقصى حجم للصورة (أقل من 1 ميجا)
            maxWidthOrHeight: 1920,  // أقصى أبعاد (FHD)
            useWebWorker: true,      // سرعة في الأداء
            fileType: 'image/webp'   // التحويل لـ WebP إجباري
        }

        try {
            for (const file of files) {
                // 1. ضغط الصورة وتحويلها
                const compressedFile = await imageCompression(file, options);

                // 2. تجهيز الاسم الجديد (WebP)
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

                // 3. الرفع لـ Supabase
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, compressedFile)

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName)

                newImageUrls.push(data.publicUrl)
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImageUrls]
            }))
            toast.success(`${newImageUrls.length} images compressed & uploaded!`)

        } catch (err) {
            console.error("Upload Error:", err)
            toast.error("Failed to upload. Check console.")
        } finally {
            setUploadingImages(false)
        }
    }

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }))
    }

    const setMainImage = (indexToMain) => {
        const images = [...formData.images]
        const mainImage = images.splice(indexToMain, 1)[0]
        images.unshift(mainImage)
        setFormData({ ...formData, images })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.price) return toast.error("Title and Price are required")

        setIsSubmitting(true)
        try {
            const productData = {
                title: formData.title,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category: formData.category,
                description: formData.description,
                images: formData.images,
                image_url: formData.images.length > 0 ? formData.images[0] : null,
                is_starting_price: formData.is_starting_price,
                price_note: formData.price_note, // 👈 حفظ القيمة في الداتا بيز
                is_new_arrival: formData.is_new_arrival
            }

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id)
                if (error) throw error
                toast.success('Product updated successfully')
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData])
                if (error) throw error
                toast.success('Product created successfully')
            }
            setIsModalOpen(false)
        } catch (error) {
            console.error(error)
            toast.error('Error saving product')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            toast.success('Product deleted')
        } catch (error) {
            toast.error('Error deleting product')
        }
    }

    const filteredProducts = products.filter(p =>
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    )

    if (error) return (
        <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="bg-red-50 p-4 rounded-full text-red-500"><X size={32} /></div>
            <h3 className="text-lg font-bold text-gray-800">Connection Error</h3>
            <p className="text-gray-500">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">Reload Page</button>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage your store items (Realtime)</p>
                </div>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                        const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image_url;

                        return (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                                <div className="relative aspect-square bg-gray-50">
                                    <img
                                        src={displayImage || 'https://via.placeholder.com/300?text=No+Image'}
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error' }}
                                    />

                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {product.is_new_arrival && (
                                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                <Sparkles size={10} /> New
                                            </span>
                                        )}
                                        {product.is_starting_price && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                Starts From
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => openModal(product)} className="bg-white p-2 rounded-full text-gray-800 hover:text-blue-600 hover:scale-110 transition-all"><Edit size={20} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="bg-white p-2 rounded-full text-gray-800 hover:text-red-600 hover:scale-110 transition-all"><Trash2 size={20} /></button>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-800 line-clamp-1" title={product.title}>{product.title}</h3>
                                        <span className="font-bold text-primary">{product.price} EGP</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-bold mt-auto pt-2">
                                        <Eye size={14} className="text-blue-500" /> <span>{product.views || 0} Views</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 uppercase">{product.category}</span>
                                        <span className={`text-xs font-bold flex items-center gap-1 ${product.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                                            <Box size={12} /> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Product Images</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    <div className="relative group cursor-pointer aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all">
                                        {uploadingImages ? <Loader2 className="animate-spin text-primary" /> : <Plus className="text-gray-400" size={32} />}
                                        <span className="text-xs text-gray-500 mt-1">Add Images</span>
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImages} />
                                    </div>

                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                            <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12} />
                                            </button>
                                            {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[10px] text-center py-0.5 font-bold">Main</span>}
                                            {idx !== 0 && (
                                                <button type="button" onClick={() => setMainImage(idx)} className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-[10px] py-1 rounded opacity-0 group-hover:opacity-100 hover:bg-primary transition-all">
                                                    Make Main
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">First image is the main cover. Click 'Make Main' to reorder.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <div className="relative">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" min="0" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 resize-none h-24" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer" onClick={() => setFormData({ ...formData, is_starting_price: !formData.is_starting_price })}>
                                    <input type="checkbox" checked={formData.is_starting_price} readOnly className="w-5 h-5 text-primary rounded" />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">Is "Starting Price"?</span>
                                        {/* خانة الكتابة ظهرت هنا */}
                                        {formData.is_starting_price && (
                                            <input
                                                type="text"
                                                value={formData.price_note}
                                                onChange={(e) => setFormData({ ...formData, price_note: e.target.value })}
                                                onClick={(e) => e.stopPropagation()} // عشان ميقفلش الشيك بوكس لما تكتب
                                                className="w-full mt-2 px-3 py-1.5 border rounded focus:ring-2 focus:ring-primary/20 text-sm"
                                                placeholder="Depends on... (e.g. Size)"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer" onClick={() => setFormData({ ...formData, is_new_arrival: !formData.is_new_arrival })}>
                                    <input type="checkbox" checked={formData.is_new_arrival} readOnly className="w-5 h-5 text-purple-600 rounded" />
                                    <span className="text-sm font-bold text-purple-800 flex items-center gap-2"><Sparkles size={16} /> New Arrival</span>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 sticky bottom-0">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Product</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Products