import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Send, Loader2, ImagePlus, MapPin, Palette, Type, AlertCircle, Wallet, Home, Navigation, Check, Truck, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { openWhatsAppChat } from '../utils/whatsapp'
import { supabase } from '../supabaseClient'

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
  // State Variables
  const [customerName, setCustomerName] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [shippingRatesList, setShippingRatesList] = useState([])
  const [shippingLoading, setShippingLoading] = useState(true)

  const [address, setAddress] = useState('')
  const [customText, setCustomText] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [pickerHex, setPickerHex] = useState('#ffffff')
  const [notes, setNotes] = useState('')

  // Location States
  const [locationLink, setLocationLink] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [gpsError, setGpsError] = useState('')

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

  // حساب مصاريف الشحن
  const shippingFee = shippingRatesList.find(r => r.governorate === governorate)?.fee || 0

  useEffect(() => {
    if (isOpen) {
      fetchShippingRates()
      if (product) fetchAddons()
    }

    if (isOpen && product) {
      setSelections({})
      setSelectedFile(null)
      setCustomText('')
      setBgColor('')
      setPickerHex('#ffffff')
      setGovernorate('')
      setAddress('')
      setNotes('')
      setLocationLink('')
      setIsLocating(false)
      setGpsError('')
      setCouponCode('')
      setAppliedCoupon(null)
      setCouponMsg({ type: '', text: '' })
    }
  }, [product, isOpen])

  const fetchShippingRates = async () => {
    try {
      setShippingLoading(true)
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('governorate', { ascending: true })

      if (error) throw error
      setShippingRatesList(data || [])
    } catch (error) {
      console.error("Error fetching rates:", error)
    } finally {
      setShippingLoading(false)
    }
  }

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

  // Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true)
    setCouponMsg({ type: '', text: '' })
    setAppliedCoupon(null)

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .single()

      if (error || !data) throw new Error("Invalid coupon code")
      if (!data.is_active) throw new Error("This coupon is no longer active")

      const now = new Date()
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      if (now < start) throw new Error("Coupon hasn't started yet")
      if (now > end) throw new Error("Coupon has expired")

      setAppliedCoupon(data)
      setCouponMsg({ type: 'success', text: `Coupon applied! (${data.discount_type === 'percent' ? data.discount_value + '%' : data.discount_value + ' EGP'} OFF)` })
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.message || "Invalid Code" })
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  // 🔥 1. تصليح منطق الـ Radio Buttons
  const handleToggleAddon = (addon) => {
    setSelections(prev => {
      const newSelections = { ...prev }

      if (addon.ui_type === 'checkbox') {
        // لو checkbox: يضيف أو يحذف عادي
        if (newSelections[addon.id]) delete newSelections[addon.id]
        else newSelections[addon.id] = addon

      } else if (addon.ui_type === 'radio') {
        // لو radio: 
        if (newSelections[addon.id]) {
          // لو هو مختار أصلاً وداس عليه تاني -> الغيه (Toggle off)
          delete newSelections[addon.id]
        } else {
          // لو مش مختار -> الغي أي راديو تاني واختاره هو
          // (بيمسح أي حاجة تانية نوعها راديو عشان يضمن اختيار واحد بس)
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

  // 🔥 2. تصليح منطق التحديد التلقائي للمحافظة
  const autoSelectGovernorate = (addressObj) => {
    // لو مفيش بيانات أو القائمة لسه محملتش، ارجع
    if (!addressObj || shippingRatesList.length === 0) return;

    // توحيد النصوص للمقارنة (كله حروف صغيرة)
    const state = (addressObj.state || '').toLowerCase(); // المحافظة من جوجل
    const city = (addressObj.city || addressObj.town || '').toLowerCase(); // المدينة
    const suburb = (addressObj.suburb || addressObj.neighbourhood || '').toLowerCase(); // الحي

    // منطق خاص للإسكندرية عشان تقسيماتها
    if (state.includes('alexandria') || city.includes('alexandria')) {
      // 1. ندور على العجمي
      if (suburb.includes('agami') || city.includes('agami')) {
        const agamiRate = shippingRatesList.find(r => r.governorate.includes('Agami'));
        if (agamiRate) { setGovernorate(agamiRate.governorate); setGpsError(''); return; }
      }
      // 2. ندور على برج العرب
      if (suburb.includes('borg') || city.includes('borg')) {
        const borgRate = shippingRatesList.find(r => r.governorate.includes('Borg'));
        if (borgRate) { setGovernorate(borgRate.governorate); setGpsError(''); return; }
      }
      // 3. الباقي يبقي Center
      const centerRate = shippingRatesList.find(r => r.governorate.includes('Center') && r.governorate.includes('Alexandria'));
      if (centerRate) { setGovernorate(centerRate.governorate); setGpsError(''); return; }
    }

    // منطق لباقي المحافظات (القاهرة، الجيزة، إلخ)
    // بندور على محافظة في القائمة بتاعتنا يكون اسمها موجود جوه العنوان اللي رجع من جوجل
    const foundRate = shippingRatesList.find(rate => {
      const govName = rate.governorate.toLowerCase().replace('governorate', '').trim(); // نشيل كلمة governorate من المقارنة
      return state.includes(govName) || city.includes(govName);
    });

    if (foundRate) {
      setGovernorate(foundRate.governorate);
      setGpsError('');
    } else {
      setGpsError('Could not auto-match city to our list. Please select manually.');
    }
  }

  const handleGetLocation = () => {
    setIsLocating(true)
    setGpsError('')
    if (!navigator.geolocation) { alert("Geolocation is not supported"); setIsLocating(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const mapsUrl = `http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`
        setLocationLink(mapsUrl)

        try {
          // بنجيب تفاصيل العنوان من الإحداثيات
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
          const data = await response.json()

          if (data && data.display_name) {
            setAddress(data.display_name)
            // 👇 هنا بنشغل دالة التحديد التلقائي
            if (data.address) autoSelectGovernorate(data.address);
          }
        } catch (error) {
          console.error("Could not fetch address text", error)
        }
        setIsLocating(false)
      },
      (error) => {
        console.error("Error:", error);
        alert("Could not get location. Check browser permissions.");
        setIsLocating(false);
      }
    )
  }

  // Price Calculation Logic
  const calculateTotals = () => {
    if (!product) return { productTotalBeforeDiscount: 0, discountAmount: 0, finalProductPrice: 0, grandTotal: 0 }

    let productTotal = Number(product.price)

    // 1. Addons
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

    // 2. Coupons
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
    const grandTotal = finalProductPrice + shippingFee

    return {
      productTotalBeforeDiscount: Math.ceil(productTotal),
      discountAmount: Math.ceil(discountAmount),
      finalProductPrice,
      grandTotal
    }
  }

  const { productTotalBeforeDiscount, discountAmount, finalProductPrice, grandTotal } = calculateTotals()

  // Image Upload
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

  // Submit & Dashboard Save
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) { alert('Please enter name'); return }
    if (!governorate) { alert('Please select your governorate'); return }
    if (!address.trim()) { alert('Please enter detailed address'); return }

    if (selectedFile) setIsUploading(true)

    // 1. Upload Image
    let uploadedImageUrl = ''
    if (selectedFile) {
      uploadedImageUrl = await uploadImage(selectedFile)
      if (!uploadedImageUrl) { setIsUploading(false); return }
    }

    // 2. Insert into Supabase Orders
    try {
      const { error: orderError } = await supabase.from('orders').insert([{
        customer_name: customerName,
        governorate: governorate,
        address: address,
        total_price: grandTotal,
        shipping_fee: shippingFee,
        status: 'pending',
        items: {
          productId: product.id,
          productName: product.title,
          addons: selections,
          customText: customText,
          bgColor: bgColor,
          coupon: appliedCoupon ? appliedCoupon.code : null,
          refImage: uploadedImageUrl
        },
        notes: notes
      }])

      if (orderError) console.error("Dashboard insert failed", orderError)

      // Increment stats
      await supabase.rpc('increment_sold_count', { product_id: product.id })
      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_code: appliedCoupon.code })
      }
    } catch (err) {
      console.error(err)
    }

    // 3. Prepare WhatsApp Message
    let detailsString = `\n--- 📋 Order Details ---\n`
    detailsString += `📍 Location: ${governorate}\n`
    detailsString += `🏠 Address: ${address}\n`
    if (locationLink) detailsString += `🌍 GPS Link: ${locationLink}\n`

    if (customText) detailsString += `✍️ Text/Date: "${customText}"\n`
    if (bgColor) detailsString += `🎨 Bg Color: ${bgColor}\n`

    const selectedList = Object.values(selections)
    if (selectedList.length > 0) {
      selectedList.forEach(addon => { detailsString += `• ${addon.title}\n` })
    }

    if (uploadedImageUrl) detailsString += `\n🖼️ Ref Image: ${uploadedImageUrl}\n`

    if (product.is_starting_price) {
      detailsString += `\n💵 Price: Starts from ${product.price} EGP (TBD)`;
    } else {
      detailsString += `\n💵 Item Price: ${productTotalBeforeDiscount} EGP`;
      if (appliedCoupon) {
        detailsString += `\n🎟️ Coupon (${appliedCoupon.code}): -${discountAmount} EGP`;
        detailsString += `\n📉 Price after discount: ${finalProductPrice} EGP`;
      }
    }

    detailsString += `\n🚚 Shipping: ${shippingFee} EGP`;
    if (!product.is_starting_price) {
      detailsString += `\n💰 Total Required: ${grandTotal} EGP`;
    }

    detailsString += `\n⚠️ Client aware of: 10-14 days delivery & 50% Wallet Deposit.`

    openWhatsAppChat(product, customerName, notes + detailsString)
    setIsUploading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white relative">
              <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
              <h2 className="text-2xl font-script font-bold">Customize Order</h2>
              <div className="flex flex-col mt-3">
                {product.is_starting_price ? (
                  <span className="text-xl font-bold text-accent">Agreement via WhatsApp</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-accent">{grandTotal} <span className="text-lg">EGP</span></span>
                    {appliedCoupon && <span className="text-sm text-white/70 line-through">{grandTotal + discountAmount} EGP</span>}
                  </div>
                )}
                {!product.is_starting_price && (
                  <div className="text-xs text-white/80 flex flex-wrap items-center gap-1 mt-1">
                    <span>Item: {finalProductPrice}</span>
                    <span>+</span>
                    <span className="flex items-center bg-white/20 px-1 rounded"><Truck size={10} className="mr-1" /> Ship: {shippingFee}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Addons */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {loadingAddons ? <Loader2 className="animate-spin mx-auto" /> : availableAddons.map(addon => {
                  const isSelected = !!selections[addon.id]
                  let priceTag = ''
                  if (addon.operation_type === 'fixed') priceTag = `+${addon.value} EGP`
                  if (addon.operation_type === 'percent_add') priceTag = `+${addon.value}%`
                  if (addon.operation_type === 'percent_double_discount') priceTag = `${addon.value}% OFF`
                  return (
                    <label key={addon.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-primary bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <input type={addon.ui_type} checked={isSelected} onChange={() => handleToggleAddon(addon)} className="text-primary focus:ring-primary w-5 h-5" />
                        <div><p className="font-medium text-gray-800">{addon.title}</p><p className="text-xs text-primary font-bold">{priceTag}</p></div>
                      </div>
                      {addon.image_url && <img src={addon.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                    </label>
                  )
                })}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Ref Image (Optional)</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-300'}`}>
                  <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {selectedFile ? <><ImagePlus className="text-primary" /> <span className="text-sm font-semibold">{selectedFile.name}</span></> : <><Upload className="text-gray-400" /> <span className="text-sm">Click to upload</span></>}
                  </label>
                </div>
              </div>

              {/* Custom Fields (Quote & Color) */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <Type size={16} /> Quote / Date on Item
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="E.g., 12/5/2025 or 'Happy Birthday'"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <Palette size={16} /> Background Color
                  </label>
                  <div className="flex gap-2">
                    <div className="relative overflow-hidden w-14 h-[50px] rounded-lg border border-gray-200 shadow-sm shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={pickerHex}
                        onChange={e => {
                          const hex = e.target.value;
                          setPickerHex(hex);
                          setBgColor(getColorNameFromHex(hex));
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      placeholder="Pick color or type name..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Coupons Section */}
              {!product.is_starting_price && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <Tag size={16} /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter Code (e.g. SAVE10)"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg uppercase"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponMsg({ type: '', text: '' }) }}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponMsg.text && (
                    <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {couponMsg.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
                      {couponMsg.text}
                    </p>
                  )}
                </div>
              )}

              <hr className="border-gray-100" />

              {/* Location & Name */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Your Name *</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 border rounded-lg" required />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
                    <MapPin size={16} /> Governorate (Shipping Fee) *
                  </label>
                  <select
                    value={governorate}
                    onChange={e => setGovernorate(e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg bg-white transition-all ${gpsError ? 'border-yellow-400' : ''}`}
                    required
                    disabled={shippingLoading}
                  >
                    <option value="">{shippingLoading ? "Loading rates..." : "Select Governorate"}</option>
                    {shippingRatesList.map(rate => (
                      <option key={rate.id} value={rate.governorate}>
                        {rate.governorate} (+{rate.fee} EGP)
                      </option>
                    ))}
                  </select>
                  {gpsError && <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {gpsError}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-text"><Home size={16} /> Detailed Address *</label>
                    <button type="button" onClick={handleGetLocation} disabled={isLocating} className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${locationLink ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                      {isLocating ? <><Loader2 size={12} className="animate-spin" /> Auto-Detecting...</> : locationLink ? <><Check size={12} /> Detected</> : <><Navigation size={12} /> Detect My City & Address</>}
                    </button>
                  </div>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-lg resize-none ${locationLink ? 'border-green-500' : ''}`}
                    placeholder={locationLink ? "Please add: Floor, Apartment No..." : "Street Name, Building No, Floor..."}
                    required
                  />
                </div>

                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border rounded-lg resize-none" placeholder="Notes..." />
              </div>

              {/* Important Notices */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full"><AlertCircle className="text-blue-600" size={20} /></div>
                  <div><h4 className="text-sm font-bold text-blue-800">Delivery Time</h4><p className="text-xs text-blue-700 mt-1">Order takes <span className="font-bold">10 to 14 days</span>.</p></div>
                </div>
                <div className="flex items-start gap-3 border-t border-blue-200 pt-3">
                  <div className="bg-blue-100 p-2 rounded-full"><Wallet className="text-blue-600" size={20} /></div>
                  <div><h4 className="text-sm font-bold text-blue-800">Payment Policy</h4><p className="text-xs text-blue-700 mt-1"><span className="font-bold">50% Deposit</span> via Wallet.</p><p className="text-[10px] text-red-500 font-bold mt-1 uppercase">🚫 No Instapay</p></div>
                </div>
              </div>

              <button type="submit" disabled={isUploading} className={`w-full bg-accent text-text font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg ${isUploading ? 'opacity-70' : ''}`}>
                {isUploading ? <><Loader2 className="animate-spin" size={20} /> Sending...</> : <><Send size={20} /> Check out via WhatsApp</>}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
export default OrderModal