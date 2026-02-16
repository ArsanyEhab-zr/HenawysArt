import { createContext, useState, useEffect, useContext } from 'react';

// 1. إنشاء الـ Context
export const CartContext = createContext();

// 2. Custom Hook عشان نستخدمه بسهولة في أي صفحة
export const useCart = () => useContext(CartContext);

// 3. الـ Provider اللي هيلف الموقع كله
export const CartProvider = ({ children }) => {
    // حفظ المنتجات اللي في السلة (وبنجيبها من الـ LocalStorage لو موجودة)
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('henawys_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // حفظ بيانات العميل (عشان ميكتبهاش كل شوية)
    const [userInfo, setUserInfo] = useState(() => {
        const savedInfo = localStorage.getItem('henawys_user');
        return savedInfo ? JSON.parse(savedInfo) : {
            customerName: '',
            phone: '',
            governorate: '',
            address: '',
            deliveryMethod: 'shipping'
        };
    });

    // تحديث الـ LocalStorage كل ما السلة تتغير
    useEffect(() => {
        localStorage.setItem('henawys_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // تحديث الـ LocalStorage كل ما بيانات العميل تتغير
    useEffect(() => {
        localStorage.setItem('henawys_user', JSON.stringify(userInfo));
    }, [userInfo]);

    // دوال التحكم في السلة
    const addToCart = (item) => {
        // بندي لكل منتج ID مميز عشان نقدر نحذفه لوحده حتى لو متكرر
        setCartItems(prev => [...prev, { ...item, cartItemId: Date.now().toString() }]);
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const updateUserInfo = (newData) => {
        setUserInfo(prev => ({ ...prev, ...newData }));
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            userInfo,
            updateUserInfo
        }}>
            {children}
        </CartContext.Provider>
    );
};