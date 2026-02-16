import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Send, Loader2, MapPin, Phone, User, Store, Truck, Navigation, Check, AlertCircle, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cartItems, removeFromCart, clearCart, userInfo, updateUserInfo } = useCart();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingRatesList, setShippingRatesList] = useState([]);
    const [shippingLoading, setShippingLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [gpsError, setGpsError] = useState('');

    const cartSubtotal = cartItems.reduce((acc, item) => acc + item.pricing.finalPrice, 0);

    useEffect(() => {
        if (isOpen) {
            fetchShippingRates();
        }
    }, [isOpen]);

    const fetchShippingRates = async () => {
        try {
            setShippingLoading(true);
            const { data, error } = await supabase.from('shipping_rates').select('*').order('governorate', { ascending: true });
            if (error) throw error;
            setShippingRatesList(data || []);
        } catch (error) {
            console.error("Error fetching rates:", error);
        } finally {
            setShippingLoading(false);
        }
    };

    const selectedShippingData = shippingRatesList.find(r => r.governorate === userInfo.governorate);
    const baseShippingFee = selectedShippingData?.fee || 0;
    const estimatedDays = selectedShippingData?.estimated_days || '';
    const finalShippingFee = userInfo.deliveryMethod === 'pickup' ? 0 : baseShippingFee;

    const grandTotal = cartSubtotal + finalShippingFee;

    const autoSelectGovernorate = (addressData) => {
        if (!addressData || shippingRatesList.length === 0) return;

        const fullText = (addressData.display_name || '').toLowerCase();
        let detectedGov = '';

        if (fullText.includes('alexandria') || fullText.includes('الإسكندرية')) {
            if (fullText.includes('agami') || fullText.includes('العجمي') || fullText.includes('hannoville')) {
                const match = shippingRatesList.find(r => r.governorate.toLowerCase().includes('agami'));
                if (match) detectedGov = match.governorate;
            }
            else if (fullText.includes('borg') || fullText.includes('burj') || fullText.includes('برج العرب')) {
                const match = shippingRatesList.find(r => r.governorate.toLowerCase().includes('borg'));
                if (match) detectedGov = match.governorate;
            }

            if (!detectedGov) {
                const centerMatch = shippingRatesList.find(r => r.governorate.toLowerCase().includes('center') && r.governorate.toLowerCase().includes('alexandria'));
                if (centerMatch) {
                    detectedGov = centerMatch.governorate;
                } else {
                    const fallbackMatch = shippingRatesList.find(r => r.governorate.toLowerCase().includes('alexandria'));
                    if (fallbackMatch) detectedGov = fallbackMatch.governorate;
                }
            }
        }
        else {
            const foundRate = shippingRatesList.find(rate => {
                const cleanName = rate.governorate.toLowerCase().replace('governorate', '').trim();
                return fullText.includes(cleanName);
            });
            if (foundRate) detectedGov = foundRate.governorate;
        }

        if (detectedGov) {
            updateUserInfo({ governorate: detectedGov });
            setGpsError('');
        } else {
            setGpsError('Detected address, but could not match city automatically.');
        }
    }

    const handleGetLocation = () => {
        setIsLocating(true);
        setGpsError('');
        if (!navigator.geolocation) { alert("Geolocation is not supported"); setIsLocating(false); return; }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                updateUserInfo({ locationLink: `https://maps.google.com/?q=${lat},${lng}` });

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        updateUserInfo({ address: data.display_name });
                        autoSelectGovernorate(data);
                    }
                } catch (error) { console.error(error); }
                setIsLocating(false);
            },
            (error) => {
                alert("Could not get location.");
                setIsLocating(false);
            }
        );
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!userInfo.customerName.trim() || !userInfo.phone.trim()) {
            alert('Please enter Name and Phone'); return;
        }

        if (userInfo.deliveryMethod === 'shipping' && (!userInfo.governorate || !userInfo.address.trim())) {
            alert('Please complete shipping details'); return;
        }

        setIsSubmitting(true);

        const finalGovernorate = userInfo.deliveryMethod === 'pickup' ? "Alexandria (Pickup)" : userInfo.governorate;
        const finalAddress = userInfo.deliveryMethod === 'pickup' ? "Henawy's Art HQ (Pickup)" : userInfo.address;

        try {
            const { error: orderError } = await supabase.from('orders').insert([{
                customer_name: userInfo.customerName,
                phone: userInfo.phone,
                governorate: finalGovernorate,
                address: finalAddress,
                total_price: grandTotal,
                shipping_fee: finalShippingFee,
                status: 'pending',
                items: cartItems
            }]);

            if (orderError) throw orderError;

            for (const item of cartItems) {
                await supabase.rpc('increment_sold_count', { product_id: item.product.id });
                if (item.appliedCoupon) {
                    await supabase.rpc('increment_coupon_usage', { coupon_code: item.appliedCoupon.code });
                }
            }

            let message = `*NEW BATCH ORDER* 🛒🛒\n`;
            message += `Date: ${new Date().toLocaleDateString('en-GB')}\n`;
            message += `--------------------------------\n`;
            message += `*CUSTOMER DETAILS*\n`;
            message += `> Name: ${userInfo.customerName}\n`;
            message += `> Phone: ${userInfo.phone}\n`;

            if (userInfo.deliveryMethod === 'pickup') {
                message += `> Type: *PICKUP @ HENAWY'S ART* 🏠\n`;
            } else {
                message += `> Type: Home Delivery 🚚\n`;
                message += `> City: ${userInfo.governorate}\n`;
                message += `> Address: ${userInfo.address}\n`;
                message += `> Delivery Time: ${estimatedDays}\n`;
                if (userInfo.locationLink) message += `> GPS: ${userInfo.locationLink}\n`;
            }
            message += `\n========================\n`;
            message += `*ITEMS ORDERED (${cartItems.length}):*\n`;
            message += `========================\n\n`;

            cartItems.forEach((item, index) => {
                message += `*${index + 1}. ${item.product.title}*\n`;
                if (item.customText) message += `   • Text: "${item.customText}"\n`;
                if (item.bgColor) message += `   • Color: ${item.bgColor}\n`;
                if (item.notes) message += `   • Notes: ${item.notes}\n`;

                // 👇👇👇 الصليحة هنا: لو في صورة هتتبعت كلينك صريح للواتساب 👇👇👇
                if (item.refImage) message += `   • Ref Image: ${item.refImage}\n`;

                const addOns = Object.values(item.selections);
                if (addOns.length > 0) {
                    message += `   • Add-ons: ${addOns.map(a => a.title).join(', ')}\n`;
                }
                message += `   • Item Total: ${item.pricing.finalPrice} EGP\n\n`;
            });

            message += `--------------------------------\n`;
            message += `*PAYMENT BREAKDOWN*\n`;
            message += `Subtotal: ${cartSubtotal} EGP\n`;

            if (userInfo.deliveryMethod === 'pickup') {
                message += `Shipping: 0 EGP (Pickup)\n`;
            } else {
                message += `Shipping Fee: ${finalShippingFee} EGP ${estimatedDays ? `(${estimatedDays})` : ''}\n`;
            }

            message += `========================\n`;
            message += `*GRAND TOTAL: ${grandTotal} EGP*\n`;
            message += `========================\n\n`;

            message += `*IMPORTANT NOTES*\n`;
            message += `1. Processing Time: 10-14 Working Days.\n`;
            message += `2. Payment: 50% Deposit required via Wallet.\n`;

            const encodedMessage = encodeURIComponent(message);
            window.open(`https://api.whatsapp.com/send?phone=201280140268&text=${encodedMessage}`, '_blank');

            clearCart();
            onClose();

        } catch (error) {
            console.error(error);
            alert("Error placing order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-end"
                >
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        onClick={e => e.stopPropagation()}
                        className="w-full max-w-md bg-white dark:bg-[#0f172a] h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1e293b]">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                                <ShoppingBag className="text-primary" /> Your Cart
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                                <ShoppingBag size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">Your cart is empty</p>
                                <button onClick={onClose} className="mt-6 text-primary font-bold hover:underline">Continue Shopping</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-[#0f172a]">
                                    {cartItems.map((item) => (
                                        <div key={item.cartItemId} className="flex gap-4 p-3 bg-gray-50 dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-xl relative group">
                                            <img src={item.refImage || item.product.images[0] || '/placeholder.png'} className="w-20 h-20 object-cover rounded-lg" alt="" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 dark:text-white text-sm pr-6 line-clamp-2">{item.product.title}</h4>
                                                {item.customText && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">📝 "{item.customText}"</p>}
                                                <div className="mt-2 font-bold text-primary">{item.pricing.finalPrice} EGP</div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleCheckout} className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-4 bg-gray-50 dark:bg-[#1e293b]">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="Full Name" required value={userInfo.customerName} onChange={e => updateUserInfo({ customerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-[#0f172a] dark:text-white dark:border-gray-700 focus:border-primary outline-none" />
                                        <input type="tel" placeholder="Phone Number" required value={userInfo.phone} onChange={e => updateUserInfo({ phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-[#0f172a] dark:text-white dark:border-gray-700 focus:border-primary outline-none" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div onClick={() => updateUserInfo({ deliveryMethod: 'shipping' })} className={`cursor-pointer text-xs p-2 rounded-lg border flex items-center justify-center gap-1 transition-all ${userInfo.deliveryMethod === 'shipping' ? 'border-primary bg-primary/10 text-primary-dark font-bold' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                            <Truck size={14} /> Delivery
                                        </div>
                                        <div onClick={() => updateUserInfo({ deliveryMethod: 'pickup' })} className={`cursor-pointer text-xs p-2 rounded-lg border flex items-center justify-center gap-1 transition-all ${userInfo.deliveryMethod === 'pickup' ? 'border-primary bg-primary/10 text-primary-dark font-bold' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                            <Store size={14} /> Pickup
                                        </div>
                                    </div>

                                    {userInfo.deliveryMethod === 'shipping' && (
                                        <div className="space-y-3">
                                            <div>
                                                <div className="relative">
                                                    <select required value={userInfo.governorate} onChange={e => updateUserInfo({ governorate: e.target.value })} className={`w-full px-3 py-2 border rounded-lg text-sm appearance-none dark:bg-[#0f172a] dark:text-white dark:border-gray-700 outline-none ${gpsError ? 'border-yellow-400' : ''}`}>
                                                        <option value="">{shippingLoading ? "Loading rates..." : "Select Governorate"}</option>
                                                        {shippingRatesList.map(r => <option key={r.id} value={r.governorate}>{r.governorate} (+{r.fee})</option>)}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                                                </div>
                                                {gpsError && <p className="text-[10px] text-yellow-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {gpsError}</p>}
                                            </div>

                                            <div className="relative">
                                                <textarea required rows={2} placeholder="Full Address (Street, Bldg, Floor)..." value={userInfo.address} onChange={e => updateUserInfo({ address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm resize-none dark:bg-[#0f172a] dark:text-white dark:border-gray-700 outline-none pr-10" />
                                                <button type="button" onClick={handleGetLocation} disabled={isLocating} className="absolute right-2 top-2 p-1.5 text-white bg-primary hover:bg-primary-dark rounded-md transition-all">
                                                    {isLocating ? <Loader2 size={14} className="animate-spin" /> : userInfo.locationLink ? <Check size={14} /> : <Navigation size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <div className="bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 rounded-lg p-2 flex flex-col justify-center">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <AlertCircle size={14} className="text-blue-600 dark:text-blue-400" />
                                                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">Order Timeline</span>
                                            </div>
                                            <p className="text-[10px] text-blue-700 dark:text-blue-200">
                                                • Preparation: <span className="font-bold">10 to 14 days</span>
                                            </p>
                                            {userInfo.deliveryMethod === 'shipping' && userInfo.governorate && (
                                                <p className="text-[10px] text-blue-700 dark:text-blue-200 mt-0.5">
                                                    • Shipping: <span className="font-bold">{estimatedDays}</span>
                                                </p>
                                            )}
                                            {userInfo.deliveryMethod === 'pickup' && (
                                                <p className="text-[10px] text-blue-700 dark:text-blue-200 mt-0.5">
                                                    • Shipping: <span className="font-bold">Pickup from Store</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-purple-50 border border-purple-100 dark:bg-purple-900/10 dark:border-purple-800 rounded-lg p-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Wallet size={14} className="text-purple-600 dark:text-purple-400" />
                                                <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase">Payment Policy</span>
                                            </div>
                                            <p className="text-[10px] text-purple-700 dark:text-purple-200 font-medium">50% Deposit via Wallet.</p>
                                            <p className="text-[9px] text-red-500 font-bold mt-0.5 uppercase flex items-center gap-1">🚫 No Instapay</p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Subtotal ({cartItems.length} items)</span>
                                            <span>{cartSubtotal} EGP</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            <span>Shipping</span>
                                            <span>{finalShippingFee === 0 ? 'Free' : `+${finalShippingFee} EGP`}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white mb-4">
                                            <span>Total</span>
                                            <span className="text-accent">{grandTotal} EGP</span>
                                        </div>

                                        <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-yellow-400 text-gray-900 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98]">
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Confirm Order</>}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;