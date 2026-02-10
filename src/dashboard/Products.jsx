import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
// شلت ايقونة Layers عشان لو هي السبب
import {
    Plus, Search, Edit, Trash2, X,
    Image as ImageIcon, Loader2, Save, Tag, DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
        category: '',
        description: '',
        image_url: '',
        is_starting_price: false
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. جلب المنتجات
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })

            if (productsError) throw productsError
            setProducts(productsData || [])

            // 2. جلب الأقسام
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('*')

            if (categoriesError) {
                console.error("Categories Error:", categoriesError)
            } else {
                console.log("Categories loaded:", categoriesData) // 👈 عشان نشوفهم في الكونسول
                setCategories(categoriesData || [])
            }

        } catch (error) {
            console.error("Fetch Error:", error) // 👈 ده هيطبع الخطأ الحقيقي لو حصل
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const openModal = (product = null) => {
        // نختار أول قسم افتراضي
        const defaultCategory = categories.length > 0 ? categories[0].slug : '';

        if (product) {
            setEditingProduct(product)
            setFormData({
                title: product.title || '',
                price: product.price || '',
                category: product.category || defaultCategory,
                description: product.description || '',
                image_url: product.image_url || '',
                is_starting_price: product.is_starting_price || false
            })
            setImagePreview(product.image_url || '')
        } else {
            setEditingProduct(null)
            setFormData({
                title: '',
                price: '',
                category: defaultCategory,
                description: '',
                image_url: '',
                is_starting_price: false
            })
            setImagePreview('')
        }
        setImageFile(null)
        setIsModalOpen(true)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const uploadImage = async () => {
        if (!imageFile) return formData.image_url

        try {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            return data.publicUrl
        } catch (err) {
            console.error("Image Upload Error:", err)
            toast.error("Failed to upload image")
            return null
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.price) return toast.error("Title and Price are required")

        setIsSubmitting(true)
        try {
            const imageUrl = await uploadImage()

            const productData = {
                title: formData.title,
                price: Number(formData.price),
                category: formData.category,
                description: formData.description,
                image_url: imageUrl || formData.image_url,
                is_starting_price: formData.is_starting_price
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
            fetchData()

        } catch (error) {
            console.error(error)
            toast.error('Error saving product')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)

            if (error) throw error

            setProducts(products.filter(p => p.id !== id))
            toast.success('Product deleted')
        } catch (error) {
            toast.error('Error deleting product')
        }
    }

    // 🛡️ الفلترة الآمنة
    const filteredProducts = products.filter(p =>
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    )

    // عرض رسالة الخطأ لو حصلت مشكلة في الاتصال
    if (error) return (
        <div className="p-12 text-center flex flex-col items-center gap-4">
            <div className="bg-red-50 p-4 rounded-full text-red-500"><X size={32} /></div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">Error Loading Page</h3>
                <p className="text-gray-500 max-w-md mx-auto">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">Reload Page</button>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products Inventory</h1>
                    <p className="text-gray-500 text-sm">Manage your store items</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative aspect-square bg-gray-50">
                                <img
                                    src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error' }}
                                />
                                {product.is_starting_price && (
                                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        Starts From
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => openModal(product)} className="bg-white p-2 rounded-full text-gray-800 hover:text-blue-600 hover:scale-110 transition-all"><Edit size={20} /></button>
                                    <button onClick={() => handleDelete(product.id)} className="bg-white p-2 rounded-full text-gray-800 hover:text-red-600 hover:scale-110 transition-all"><Trash2 size={20} /></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800 line-clamp-1" title={product.title}>{product.title || 'Untitled'}</h3>
                                    <span className="font-bold text-primary">{product.price} EGP</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 uppercase">{product.category}</span>
                                    {(product.sold_count > 0) && <span className="text-xs text-green-600 font-medium">{product.sold_count} sold</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No products found matching your search.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <div className="relative group cursor-pointer w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all">
                                    {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" /> : <><ImageIcon className="text-gray-400 mb-2" size={32} /><span className="text-sm text-gray-500">Click to upload image</span></>}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            {/* Title & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="e.g. Wooden Frame" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" placeholder="0.00" required />
                                    </div>
                                </div>
                            </div>

                            {/* Category Dropdown (معدل) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="relative">
                                    {/* شلنا ايقونة Layers من هنا عشان لو هي السبب */}
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 bg-white"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            /* ⚠️ استخدام slug كمفتاح بدل id تحسباً لو id مش موجود */
                                            <option key={cat.slug || Math.random()} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 resize-none h-20" placeholder="Details about the product..." />
                            </div>

                            {/* Starting Price Checkbox */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="isStarting"
                                    checked={formData.is_starting_price}
                                    onChange={(e) => setFormData({ ...formData, is_starting_price: e.target.checked })}
                                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="isStarting" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                    Is this a "Starting Price"? (Price varies)
                                </label>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
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