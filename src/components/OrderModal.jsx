import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, ImagePlus, Palette, Type, AlertCircle, Tag, ShoppingCart, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
// 👇 استيراد الـ Hook بتاع السلة
import { useCart } from '../context/CartContext'

// 🎨 قائمة الألوان
const COMMON_COLORS = [
  { hex: "#000000", name: "Black" }, { hex: "#FFFFFF", name: "White" }, { hex: "#808080", name: "Gray" },
  { hex: "#C0C0C0", name: "Silver" }, { hex: "#FF0000", name: "Red" }, { hex: "#800000", name: "Maroon" },
  { hex: "#FFFF00", name: "Yellow" }, { hex: "#808000", name: "Olive" }, { hex: "#00FF00", name: "Lime" },
  { hex: "#008000", name: "Green" }, { hex: "#00FFFF", name: "Aqua" }, { hex: "#008080", name: "Teal" },
  { hex: "#0000FF", name: "Blue" }, { hex: "#000080", name: "Navy Blue" }, { hex: "#FF00FF", name: "Fuchsia" },
  { hex: "#800080", name: "Purple" }, { hex: "#FFA500", name: "Orange" }, { hex: "#FFC0CB", name: "Pink" },
  { hex: "#FFD700", name: "Gold" }, { hex: "#F5F5DC", name: "Beige" }, { hex: "#A52A2A", name: "Brown" },
  { hex: "#40E0D0", name: "Turquoise" }, { hex: "#ADD8E6", name: "Light Blue" }, { hex: "#F0E68C", name: "Khaki" },
  { hex: "#E6E6FA", name: "Lavender" }
];

const getColorNameFromHex = (hex) => {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  let closestColor = "Custom Color";
  let minDistance = Infinity;
  COMMON_COLORS.forEach(color => {
    const targetR = parseInt(color.hex.substr(1, 2), 16);
    const targetG = parseInt(color.hex.substr(3, 2), 16);
    const targetB = parseInt(color.hex.substr(5, 2), 16);
    const distance = Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2));
    if (distance < minDistance) { minDistance = distance; closestColor = color.name; }
  });
  return closestColor;
};

const OrderModal = ({ isOpen, onClose, product }) => {
  // 👇 استخدام السلة
  const { addToCart } = useCart()

  // State Variables (الخاصة بالمنتج فقط)
  const [customText, setCustomText] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [pickerHex, setPickerHex] = useState('#ffffff')
  const [notes, setNotes] = useState('')

  // Addons States
  const [availableAddons, setAvailableAddons] = useState([])
  const [loadingAddons, setLoadingAddons] = useState(false)
  const [selections, setSelections] = useState({})

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' })

  // Upload States
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isOpen && product) {
      fetchAddons()
      setSelections({})
      setSelectedFile(null)
      setCustomText('')
      setBgColor('')
      setPickerHex('#ffffff')
      setNotes('')
      setCouponCode('')
      setAppliedCoupon(null)
      setCouponMsg({ type: '', text: '' })
    }
  }, [product, isOpen])

  const fetchAddons = async () => {
    setLoadingAddons(true)
    try {
      const { data, error } = await supabase
        .from('product_addons')
        .select('*')
        .or(`category_target.eq.${product.category},category_target.eq.all`)
      if (error) throw error
      setAvailableAddons(data || [])
    } catch (error) { console.error('Error fetching addons:', error) }
    finally { setLoadingAddons(false) }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true)
    setCouponMsg({ type: '', text: '' })
    setAppliedCoupon(null)

    try {
      const { data: couponData, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .single()

      if (error || !couponData) throw new Error("Invalid coupon code")
      if (!couponData.is_active) throw new Error("This coupon is inactive")

      const now = new Date()
      if (now < new Date(couponData.start_date)) throw new Error("Coupon hasn't started yet")
      if (now > new Date(couponData.end_date)) throw new Error("Coupon has expired")
      if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
        throw new Error("This coupon has reached its usage limit.")
      }

      // ⚠️ ملحوظة: شلنا التحقق من استخدام العميل للكوبون قبل كده برقم التليفون من هنا، 
      // وهننقل التحقق ده لخطوة الدفع النهائية عشان رقم التليفون مبقاش موجود في المودال ده.

      setAppliedCoupon(couponData)
      setCouponMsg({ type: 'success', text: `Coupon applied! (${couponData.discount_type === 'percent' ? couponData.discount_value + '%' : couponData.discount_value + ' EGP'} OFF)` })
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.message || "Invalid Code" })
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleToggleAddon = (addon) => {
    setSelections(prev => {
      const newSelections = { ...prev }
      if (addon.ui_type === 'checkbox') {
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon
      } else if (addon.ui_type === 'radio') {
        if (newSelections[addon.id]) {
          delete newSelections[addon.id]
        } else {
          Object.values(newSelections).forEach(selected => {
            if (selected.ui_type === 'radio') {
              delete newSelections[selected.id]
            }
          })
          newSelections[addon.id] = addon
        }
      }
      return newSelections
    })
  }

  const calculateTotals = () => {
    if (!product) return { productTotalBeforeDiscount: 0, discountAmount: 0, finalProductPrice: 0 }

    let productTotal = Number(product.price)

    const coupleAddon = Object.values(selections).find(a => a.operation_type === 'percent_double_discount')
    if (coupleAddon) {
      const doublePrice = productTotal * 2
      const discountVal = doublePrice * (Number(coupleAddon.value) / 100)
      productTotal = doublePrice - discountVal
    }
    Object.values(selections).forEach(addon => {
      if (addon.operation_type === 'percent_double_discount') return
      if (addon.operation_type === 'fixed') productTotal += Number(addon.value)
      else if (addon.operation_type === 'percent_add') {
        productTotal += Number(product.price) * (Number(addon.value) / 100)
      }
    })

    let discountAmount = 0
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'fixed') {
        discountAmount = Number(appliedCoupon.discount_value)
      } else if (appliedCoupon.discount_type === 'percent') {
        discountAmount = productTotal * (Number(appliedCoupon.discount_value) / 100)
      }
    }
    if (discountAmount > productTotal) discountAmount = productTotal

    const finalProductPrice = Math.ceil(productTotal - discountAmount)

    return {
      productTotalBeforeDiscount: Math.ceil(productTotal),
      discountAmount: Math.ceil(discountAmount),
      finalProductPrice
    }
  }

  const { productTotalBeforeDiscount, discountAmount, finalProductPrice } = calculateTotals()

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`
      const { error: uploadError } = await supabase.storage.from('client-uploads').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('client-uploads').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) { return null }
  }

  // 👇 دالة الإضافة للسلة بدل الـ Checkout المباشر
  const handleAddToCart = async (e, closeAfterAdd = true) => {
    e.preventDefault()

    if (selectedFile) setIsUploading(true)

    let uploadedImageUrl = ''
    if (selectedFile) {
      uploadedImageUrl = await uploadImage(selectedFile)
      if (!uploadedImageUrl) {
        setIsUploading(false);
        alert('Failed to upload image, please try again.');
        return;
      }
    }

    // تجهيز عنصر السلة
    const cartItem = {
      product: product,
      selections: selections,
      customText: customText,
      bgColor: bgColor,
      notes: notes,
      refImage: uploadedImageUrl,
      appliedCoupon: appliedCoupon,
      pricing: {
        basePrice: productTotalBeforeDiscount,
        discount: discountAmount,
        finalPrice: finalProductPrice
      }
    }

    // إضافة للسلة باستخدام הـ Context
    addToCart(cartItem)

    setIsUploading(false)
    if (closeAfterAdd) {
      onClose()
      // ممكن هنا تظهر Toaster صغير يقوله "Added to Cart"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >

            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-primary to-primary-dark p-6 text-white shadow-lg backdrop-blur-md">
              <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 p-1 rounded-full hover:bg-white/40 transition-all"><X size={20} /></button>
              <h2 className="text-xl md:text-2xl font-script font-bold">Customize Item</h2>

              <div className="flex flex-col mt-2">
                {product.is_starting_price ? (
                  <span className="text-lg font-bold text-accent">Price varies (Base: {product.price} EGP)</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {/* 👇 الإجمالي هنا للمنتج ده بس (بدون شحن) لأن الشحن هيتحسب في السلة ككل */}
                    <span className="text-3xl font-bold text-accent drop-shadow-sm">{finalProductPrice} <span className="text-lg">EGP</span></span>
                    {appliedCoupon && <span className="text-sm text-white/70 line-through">{productTotalBeforeDiscount} EGP</span>}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={(e) => handleAddToCart(e, true)} className="p-6 space-y-6">

              {/* Addons Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={16} className="text-primary" /> Customizations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {loadingAddons ? <div className="col-span-full py-4 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div> : availableAddons.map(addon => {
                    const isSelected = !!selections[addon.id]
                    let priceTag = ''
                    if (addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                    if (addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                    if (addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`

                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon)}
                        className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group
                                ${isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-gray-100 hover:border-primary/50 hover:shadow-md bg-white'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300 group-hover:border-primary/50'}`}>
                          {isSelected && <Check size={12} strokeWidth={4} />}
                        </div>

                        <div className="flex-1">
                          <p className={`font-bold text-sm ${isSelected ? 'text-primary-dark' : 'text-gray-700'}`}>{addon.title}</p>
                          <p className="text-xs text-primary font-bold mt-0.5">{priceTag}</p>
                        </div>
                        {addon.image_url && <img src={addon.image_url} alt="" className="w-10 h-10 rounded-md object-cover border border-gray-100" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reference Image (Optional)</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-gray-50 
                    ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/40'}`}>
                  <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    {selectedFile ? (
                      <>
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><ImagePlus size={24} /></div>
                        <span className="text-sm font-semibold text-primary">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400">Click to change</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 p-3 rounded-full text-gray-500"><Upload size={24} /></div>
                        <span className="text-sm font-medium text-gray-600">Click to upload your photo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Text & Color */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Type size={16} className="text-primary" /> Text on Item</label>
                  <input type="text" value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Name, Date, or Quote..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Palette size={16} className="text-primary" /> Background Color</label>
                  <div className="flex gap-2">
                    <div className="relative overflow-hidden w-14 h-[50px] rounded-xl border border-gray-200 shadow-sm shrink-0 cursor-pointer hover:shadow-md transition-shadow">
                      <input type="color" value={pickerHex} onChange={e => { const hex = e.target.value; setPickerHex(hex); setBgColor(getColorNameFromHex(hex)); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer" />
                    </div>
                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} placeholder="Pick or type color..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Coupon Section للمنتج ده */}
              {!product.is_starting_price && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Tag size={16} className="text-primary" /> Coupon Code (For this item)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl uppercase font-medium bg-white outline-none focus:border-primary"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ?
                      <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponMsg({ type: '', text: '' }) }} className="w-full sm:w-auto bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm">Remove</button> :
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} className="w-full sm:w-auto bg-gray-800 text-white px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors">
                        {couponLoading ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                      </button>
                    }
                  </div>
                  {couponMsg.text && <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMsg.text}</p>}
                </div>
              )}

              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Any special notes for this item..." />

              {/* 👇 زراير الإضافة للسلة 👇 */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full bg-accent hover:bg-yellow-400 text-gray-900 font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98] ${isUploading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isUploading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <><ShoppingCart size={20} /> Add to Cart & Checkout</>}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, true)}
                  disabled={isUploading}
                  className={`w-full bg-white border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-bold py-3 rounded-xl flex justify-center items-center transition-all active:scale-[0.98] ${isUploading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  Add to Cart & Continue Shopping
                </button>
              </div>

            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal