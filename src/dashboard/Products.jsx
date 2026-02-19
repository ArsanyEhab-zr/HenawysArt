import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
    Plus, Search, Edit, Trash2, X,
    Image as ImageIcon, Loader2, Save, Tag, DollarSign, Box, AlertCircle, Sparkles, Eye, Upload,
    Layers, LayoutGrid, ArrowUpDown, CheckSquare, MousePointer2, Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

const Products = () => {
    const [activeTab, setActiveTab] = useState('products')

    // Data States
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [addons, setAddons] = useState([])

    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)

    // ==================== Product Modal States ====================
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState(false)

    // Product Form Data
    const [productFormData, setProductFormData] = useState({
        title: '', price: '', stock: 0, category: '', description: '', images: [],
        is_starting_price: false, price_note: '', is_new_arrival: false
    })

    // ==================== Category Modal States ====================
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [catFormData, setCatFormData] = useState({
        name: '', slug: '', description: '', sort_order: 0, image_url: ''
    })
    const [uploadingCatImage, setUploadingCatImage] = useState(false)

    // ==================== Addon Modal States ====================
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false)
    const [editingAddon, setEditingAddon] = useState(null)
    const [addonFormData, setAddonFormData] = useState({
        title: '', value: '', category_target: 'all', ui_type: 'checkbox', operation_type: 'fixed', image_url: ''
    })
    const [uploadingAddonImage, setUploadingAddonImage] = useState(false)


    // 1. Fetch Data
    useEffect(() => {
        fetchData()

        const prodChannel = supabase.channel('realtime-products-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                if (payload.eventType === 'INSERT') setProducts(prev => [payload.new, ...prev])
                else if (payload.eventType === 'UPDATE') setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
                else if (payload.eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== payload.old.id))
            }).subscribe()

        const catChannel = supabase.channel('realtime-categories-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
                fetchCategories()
            }).subscribe()

        const addonsChannel = supabase.channel('realtime-addons-admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'product_addons' }, (payload) => {
                if (payload.eventType === 'INSERT') setAddons(prev => [payload.new, ...prev])
                else if (payload.eventType === 'UPDATE') setAddons(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))
                else if (payload.eventType === 'DELETE') setAddons(prev => prev.filter(item => item.id !== payload.old.id))
            }).subscribe()

        return () => {
            supabase.removeChannel(prodChannel)
            supabase.removeChannel(catChannel)
            supabase.removeChannel(addonsChannel)
        }
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            await Promise.all([fetchProducts(), fetchCategories(), fetchAddons()])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
        setProducts(data || [])
    }

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })
        setCategories(data || [])
    }

    const fetchAddons = async () => {
        const { data } = await supabase.from('product_addons').select('*').order('id', { ascending: true })
        setAddons(data || [])
    }


    // 👇👇 دالة الرفع الموحدة لكلاوديناري (Cloudinary) 👇👇
    const uploadToCloudinary = async (file) => {
        const CLOUD_NAME = 'ddnktpjsl';
        const UPLOAD_PRESET = 'henawy_uploads';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('cloud_name', CLOUD_NAME);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
            // إضافة أكواد سحرية لتقليل الحجم أوتوماتيكياً (Quality Auto & Format Auto)
            return data.secure_url.replace('/upload/', '/upload/q_auto,f_auto/');
        } else {
            throw new Error('Cloudinary upload failed');
        }
    }


    // ==================== Product Functions ====================

    const openProductModal = (product = null) => {
        const defaultCategory = categories.length > 0 ? categories[0].slug : ''
        if (product) {
            setEditingProduct(product)
            let currentImages = [];
            if (Array.isArray(product.images) && product.images.length > 0) currentImages = product.images;
            else if (product.image_url) currentImages = [product.image_url];

            setProductFormData({
                title: product.title || '', price: product.price || '', stock: product.stock || 0,
                category: product.category || defaultCategory, description: product.description || '',
                images: currentImages, is_starting_price: product.is_starting_price || false,
                price_note: product.price_note || '', is_new_arrival: product.is_new_arrival || false
            })
        } else {
            setEditingProduct(null)
            setProductFormData({
                title: '', price: '', stock: 0, category: defaultCategory, description: '',
                images: [], is_starting_price: false, price_note: '', is_new_arrival: false
            })
        }
        setIsProductModalOpen(true)
    }

    const handleProductImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return
        setUploadingImages(true)
        const newImageUrls = []

        // احتفظنا بضغط الصور على المتصفح عشان الرفع يكون أسرع لك كأدمن
        const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' }

        try {
            for (const file of files) {
                const compressedFile = await imageCompression(file, options)
                const cloudUrl = await uploadToCloudinary(compressedFile)
                newImageUrls.push(cloudUrl)
            }
            setProductFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }))
            toast.success(`${newImageUrls.length} images uploaded to Cloudinary!`)
        } catch (err) {
            toast.error("Upload failed")
            console.error(err)
        }
        finally { setUploadingImages(false) }
    }

    const removeProductImage = (indexToRemove) => {
        setProductFormData(prev => ({ ...prev, images: prev.images.filter((_, index) => index !== indexToRemove) }))
    }

    const setMainProductImage = (indexToMain) => {
        const images = [...productFormData.images]
        const main = images.splice(indexToMain, 1)[0]
        images.unshift(main)
        setProductFormData({ ...productFormData, images })
    }

    const handleProductSubmit = async (e) => {
        e.preventDefault()
        if (!productFormData.title || !productFormData.price) return toast.error("Title and Price required")
        setIsSubmitting(true)
        try {
            const payload = {
                title: productFormData.title,
                price: Number(productFormData.price),
                stock: Number(productFormData.stock),
                category: productFormData.category,
                description: productFormData.description,
                images: productFormData.images,
                image_url: productFormData.images[0] || null,
                is_starting_price: productFormData.is_starting_price,
                price_note: productFormData.price_note,
                is_new_arrival: productFormData.is_new_arrival
            }

            if (editingProduct) {
                await supabase.from('products').update(payload).eq('id', editingProduct.id)
                toast.success('Product updated')
            } else {
                await supabase.from('products').insert([payload])
                toast.success('Product created')
            }
            setIsProductModalOpen(false)
        } catch (error) { toast.error('Error saving') }
        finally { setIsSubmitting(false) }
    }

    const handleProductDelete = async (id) => {
        if (!window.confirm("Delete product?")) return
        try {
            await supabase.from('products').delete().eq('id', id)
            toast.success('Product deleted')
        } catch (error) { toast.error('Delete failed') }
    }

    // ==================== Category Functions ====================

    const openCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat)
            setCatFormData({
                name: cat.name, slug: cat.slug, description: cat.description || '',
                sort_order: cat.sort_order || 0, image_url: cat.image_url || ''
            })
        } else {
            setEditingCategory(null)
            setCatFormData({
                name: '', slug: '', description: '', sort_order: categories.length + 1, image_url: ''
            })
        }
        setIsCategoryModalOpen(true)
    }

    const handleCatImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingCatImage(true)
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true, fileType: 'image/webp' })
            const cloudUrl = await uploadToCloudinary(compressed)
            setCatFormData(prev => ({ ...prev, image_url: cloudUrl }))
            toast.success('Category Image uploaded')
        } catch (err) {
            toast.error('Upload failed')
            console.error(err)
        }
        finally { setUploadingCatImage(false) }
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                ...catFormData,
                slug: catFormData.slug || catFormData.name.toLowerCase().replace(/ /g, '-')
            }
            if (editingCategory) {
                await supabase.from('categories').update(payload).eq('id', editingCategory.id)
                toast.success('Category updated')
            } else {
                await supabase.from('categories').insert([payload])
                toast.success('Category created')
            }
            setIsCategoryModalOpen(false)
        } catch (err) { toast.error('Error saving category') }
        finally { setIsSubmitting(false) }
    }

    const handleCategoryDelete = async (id) => {
        if (!window.confirm("Delete category? Products inside might be affected!")) return
        await supabase.from('categories').delete().eq('id', id)
        toast.success('Category deleted')
    }

    // ==================== Addon Functions ====================

    const openAddonModal = (addon = null) => {
        if (addon) {
            setEditingAddon(addon)
            setAddonFormData({
                title: addon.title, value: addon.value, category_target: addon.category_target,
                ui_type: addon.ui_type, operation_type: addon.operation_type, image_url: addon.image_url
            })
        } else {
            setEditingAddon(null)
            setAddonFormData({
                title: '', value: '', category_target: 'all', ui_type: 'checkbox', operation_type: 'fixed', image_url: ''
            })
        }
        setIsAddonModalOpen(true)
    }

    const handleAddonImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingAddonImage(true)
        try {
            const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true, fileType: 'image/webp' })
            const cloudUrl = await uploadToCloudinary(compressed)
            setAddonFormData(prev => ({ ...prev, image_url: cloudUrl }))
            toast.success('Addon Image uploaded')
        } catch (err) {
            toast.error('Upload failed')
            console.error(err)
        }
        finally { setUploadingAddonImage(false) }
    }

    const handleAddonSubmit = async (e) => {
        e.preventDefault()
        if (!addonFormData.title || !addonFormData.value) return toast.error("Title and Value required")
        setIsSubmitting(true)
        try {
            const payload = { ...addonFormData, value: Number(addonFormData.value) }
            if (editingAddon) {
                await supabase.from('product_addons').update(payload).eq('id', editingAddon.id)
                toast.success('Addon updated')
            } else {
                await supabase.from('product_addons').insert([payload])
                toast.success('Addon created')
            }
            setIsAddonModalOpen(false)
        } catch (err) { toast.error('Error saving addon') }
        finally { setIsSubmitting(false) }
    }

    const handleAddonDelete = async (id) => {
        if (!window.confirm("Delete addon?")) return
        await supabase.from('product_addons').delete().eq('id', id)
        toast.success('Addon deleted')
    }


    // ==================== Render ====================

    const handleAddClick = () => {
        if (activeTab === 'products') openProductModal()
        else if (activeTab === 'categories') openCategoryModal()
        else openAddonModal()
    }

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
                    <h1 className="text-2xl font-bold text-gray-800">Store Management</h1>
                    <p className="text-gray-500 text-sm">Manage products, categories & add-ons</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                    {['products', 'categories', 'addons'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab === 'addons' ? 'Add-ons' : tab}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleAddClick}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    {activeTab === 'products' ? 'Add Product' : activeTab === 'categories' ? 'Add Category' : 'Add Add-on'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
                <>
                    {/* ================= Products View ================= */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase())).map(product => {
                                    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : product.image_url;
                                    return (
                                        <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group relative">
                                            <div className="aspect-square relative">
                                                <img src={displayImage || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Error'} />
                                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                    {product.is_new_arrival && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><Sparkles size={10} /> New</span>}
                                                    {product.is_starting_price && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Starts From</span>}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => openProductModal(product)} className="bg-white p-2 rounded-full text-blue-600"><Edit size={20} /></button>
                                                    <button onClick={() => handleProductDelete(product.id)} className="bg-white p-2 rounded-full text-red-600"><Trash2 size={20} /></button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-gray-800 truncate" title={product.title}>{product.title}</h3>
                                                    <span className="font-bold text-primary">{product.price} EGP</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500 text-xs font-bold mt-2">
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
                        </div>
                    )}

                    {/* ================= Categories View ================= */}
                    {activeTab === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 group hover:shadow-md transition-all">
                                    <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-200">
                                        <img src={cat.image_url || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Image'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate">{cat.name}</h3>
                                        <p className="text-xs text-gray-400 truncate mb-1">/{cat.slug}</p>
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                            <ArrowUpDown size={10} /> Order: {cat.sort_order}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openCategoryModal(cat)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={18} /></button>
                                        <button onClick={() => handleCategoryDelete(cat.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ================= Addons View ================= */}
                    {activeTab === 'addons' && (
                        <div className="space-y-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="text" placeholder="Search addons..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {addons.filter(a => (a.title || '').toLowerCase().includes(search.toLowerCase())).map(addon => (
                                    <div key={addon.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group relative">
                                        <div className="h-40 bg-gray-50 relative">
                                            <img src={addon.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'} />
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm uppercase">
                                                {addon.category_target === 'all' ? 'All' : addon.category_target}
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => openAddonModal(addon)} className="bg-white p-2 rounded-full text-blue-600 hover:scale-110 transition-all"><Edit size={18} /></button>
                                                <button onClick={() => handleAddonDelete(addon.id)} className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ================= Product Modal ================= */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Images</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    <div className="relative group cursor-pointer aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all">
                                        {uploadingImages ? <Loader2 className="animate-spin text-primary" /> : <Plus className="text-gray-400" size={32} />}
                                        <span className="text-xs text-gray-500 mt-1">Add</span>
                                        <input type="file" multiple accept="image/*" onChange={handleProductImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImages} />
                                    </div>
                                    {productFormData.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={12} /></button>
                                            {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[10px] text-center py-0.5 font-bold">Main</span>}
                                            {idx !== 0 && <button type="button" onClick={() => setMainProductImage(idx)} className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-[10px] py-1 rounded opacity-0 group-hover:opacity-100 hover:bg-primary">Make Main</button>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium">Title</label><input className="w-full border rounded p-2" value={productFormData.title} onChange={e => setProductFormData({ ...productFormData, title: e.target.value })} required /></div>
                                <div><label className="text-sm font-medium">Price</label><input type="number" className="w-full border rounded p-2" value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select className="w-full border rounded p-2 bg-white" value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })}>
                                        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-sm font-medium">Stock</label><input type="number" className="w-full border rounded p-2" value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} /></div>
                            </div>
                            <div><label className="text-sm font-medium">Description</label><textarea className="w-full border rounded p-2 h-20 resize-none" value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} /></div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded border cursor-pointer" onClick={() => setProductFormData({ ...productFormData, is_starting_price: !productFormData.is_starting_price })}>
                                    <div className="flex items-center gap-2"><input type="checkbox" checked={productFormData.is_starting_price} readOnly /><span className="text-sm">Is "Starting Price"?</span></div>
                                    {productFormData.is_starting_price && <input className="w-full mt-2 border rounded p-1 text-sm" placeholder="Depends on..." value={productFormData.price_note} onChange={e => setProductFormData({ ...productFormData, price_note: e.target.value })} onClick={e => e.stopPropagation()} />}
                                </div>
                                <div className="p-3 bg-purple-50 rounded border border-purple-100 flex items-center gap-2 cursor-pointer" onClick={() => setProductFormData({ ...productFormData, is_new_arrival: !productFormData.is_new_arrival })}>
                                    <input type="checkbox" checked={productFormData.is_new_arrival} readOnly className="accent-purple-600" />
                                    <span className="text-sm font-bold text-purple-800">New Arrival</span>
                                </div>
                            </div>

                            <button disabled={isSubmitting} className="w-full bg-primary text-white py-3 rounded font-bold">{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Save Product'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= Category Modal ================= */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 relative overflow-hidden group hover:border-primary cursor-pointer">
                                    {catFormData.image_url ? <img src={catFormData.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full text-gray-400"><ImageIcon /></div>}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploadingCatImage ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCatImageUpload} />
                                </div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">NAME</label><input className="w-full border rounded p-2 mt-1" value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value })} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">SLUG</label><input className="w-full border rounded p-2 mt-1" value={catFormData.slug} onChange={e => setCatFormData({ ...catFormData, slug: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-500">ORDER</label><input type="number" className="w-full border rounded p-2 mt-1" value={catFormData.sort_order} onChange={e => setCatFormData({ ...catFormData, sort_order: e.target.value })} /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">DESC</label><textarea className="w-full border rounded p-2 mt-1 h-20 resize-none" value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} /></div>
                            <button className="w-full bg-primary text-white py-3 rounded font-bold" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Save Category'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= Addon Modal ================= */}
            {isAddonModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl">{editingAddon ? 'Edit Add-on' : 'New Add-on'}</h2>
                            <button onClick={() => setIsAddonModalOpen(false)}><X className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddonSubmit} className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 relative overflow-hidden group hover:border-primary cursor-pointer">
                                    {addonFormData.image_url ? <img src={addonFormData.image_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center w-full h-full text-gray-400"><ImageIcon /></div>}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploadingAddonImage ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-white" />}
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAddonImageUpload} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">TITLE</label>
                                    <input className="w-full border rounded p-2 mt-1" value={addonFormData.title} onChange={e => setAddonFormData({ ...addonFormData, title: e.target.value })} required placeholder="e.g. Gift Box" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">VALUE</label>
                                    <input type="number" className="w-full border rounded p-2 mt-1" value={addonFormData.value} onChange={e => setAddonFormData({ ...addonFormData, value: e.target.value })} required placeholder="e.g. 50" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500">TARGET CATEGORY</label>
                                <select className="w-full border rounded p-2 mt-1 bg-white" value={addonFormData.category_target} onChange={e => setAddonFormData({ ...addonFormData, category_target: e.target.value })}>
                                    <option value="all">All Products</option>
                                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">UI TYPE</label>
                                    <select className="w-full border rounded p-2 mt-1 bg-white" value={addonFormData.ui_type} onChange={e => setAddonFormData({ ...addonFormData, ui_type: e.target.value })}>
                                        <option value="checkbox">Checkbox (Multi)</option>
                                        <option value="radio">Radio (Single)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">OPERATION</label>
                                    <select className="w-full border rounded p-2 mt-1 bg-white" value={addonFormData.operation_type} onChange={e => setAddonFormData({ ...addonFormData, operation_type: e.target.value })}>
                                        <option value="fixed">Fixed Price (+EGP)</option>
                                        <option value="percent_add">Percent Add (+%)</option>
                                        <option value="percent_double_discount">Percent Discount (-%)</option>
                                    </select>
                                </div>
                            </div>

                            <button className="w-full bg-primary text-white py-3 rounded font-bold" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Save Add-on'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Products