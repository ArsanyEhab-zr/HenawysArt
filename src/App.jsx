import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { supabase } from './supabaseClient'

// Components العامة
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages العامة (للزبون)
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Developer from './pages/Developer'
import Policies from './pages/Policies'

// Pages الخاصة (للموظفين والداش بورد)
import Login from './pages/Login'
import RequireAuth from './components/RequireAuth'

// Dashboard Pages
import DashboardLayout from './dashboard/DashboardLayout'
import DashboardHome from './dashboard/DashboardHome'
import Orders from './dashboard/Orders'
import Users from './dashboard/Users'
import Products from './dashboard/Products'
import Settings from './dashboard/Settings'
import VisitorLogs from './dashboard/VisitorLogs' // 👈 1. استيراد صفحة سجل الزوار الجديدة

// مكون مساعد عشان نخفي الـ Navbar والـ Footer في الداش بورد
const Layout = ({ children }) => {
  const location = useLocation()
  const hideHeaderFooter = location.pathname.startsWith('/dashboard') || location.pathname === '/login'

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Navbar />}
      <div className="flex-grow">{children}</div>
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}

function App() {

  // 👇👇👇 كود التتبع المطور (Enhanced Tracker) 👇👇👇
  useEffect(() => {
    const recordVisit = async () => {
      // 1. منع التكرار في نفس الجلسة
      const hasVisited = sessionStorage.getItem('visited_session')
      if (hasVisited) return

      try {
        // 2. جلب بيانات الموقع والشبكة
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) throw new Error('Location API failed')
        const locationData = await res.json()

        // 3. تحديد نوع الجهاز
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        // 4. تجميع المعلومات الإضافية (المصدر، الشاشة، اللغة)
        let referrer = document.referrer || "Direct / Typed URL";
        if (referrer.includes("facebook")) referrer = "Facebook";
        else if (referrer.includes("google")) referrer = "Google";
        else if (referrer.includes("instagram")) referrer = "Instagram";

        const screenRes = `${window.screen.width}x${window.screen.height}`;

        // 5. إرسال البيانات لسوبا بيز (شاملة الأعمدة الجديدة)
        await supabase.from('site_visits').insert([{
          country: locationData.country_name || 'Unknown',
          city: locationData.city || 'Unknown',
          device_type: isMobile ? 'Mobile' : 'Desktop',
          user_agent: navigator.userAgent,
          // 👇 البيانات الجديدة
          isp: locationData.org || 'Unknown',
          referrer: referrer,
          screen_res: screenRes,
          browser_lang: navigator.language
        }])

        // 6. علم عليه إنه اتسجل
        sessionStorage.setItem('visited_session', 'true')

      } catch (error) {
        console.error("Tracking Error (Site works fine):", error)
      }
    }

    recordVisit()
  }, [])
  // 👆👆👆 نهاية كود التتبع 👆👆👆

  return (
    <Router>
      <Toaster position="top-right" />

      <Layout>
        <Routes>
          {/* ========================================= */}
          {/* 🌍 المسارات العامة */}
          {/* ========================================= */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/policies" element={<Policies />} />

          {/* ========================================= */}
          {/* 🔐 تسجيل الدخول */}
          {/* ========================================= */}
          <Route path="/login" element={<Login />} />

          {/* ========================================= */}
          {/* ⚙️ الداش بورد */}
          {/* ========================================= */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }>
            {/* الصفحة الرئيسية (الإحصائيات) */}
            <Route index element={<DashboardHome />} />

            {/* صفحة الطلبات */}
            <Route path="orders" element={<Orders />} />

            {/* صفحة المنتجات */}
            <Route path="products" element={<Products />} />

            {/* 👇👇👇 صفحة سجل الزوار (جديدة) 👇👇👇 */}
            <Route path="visitors" element={
              <RequireAuth allowedRoles={['admin']}>
                <VisitorLogs />
              </RequireAuth>
            } />

            {/* صفحة المستخدمين (للمدير فقط) */}
            <Route path="users" element={
              <RequireAuth allowedRoles={['admin']}>
                <Users />
              </RequireAuth>
            } />

            {/* صفحة الإعدادات (للمدير فقط) */}
            <Route path="settings" element={
              <RequireAuth allowedRoles={['admin']}>
                <Settings />
              </RequireAuth>
            } />

          </Route>

        </Routes>
      </Layout>
    </Router>
  )
}

export default App