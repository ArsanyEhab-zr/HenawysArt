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
import VisitorLogs from './dashboard/VisitorLogs'

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

  // 👇👇👇 كود التتبع المعدل (Robust Tracker) 👇👇👇
  useEffect(() => {
    const recordVisit = async () => {
      console.log("🚀 Tracking started...") // تأكيد إن الكود بدأ

      // 1. الفلتر الأول: الجلسة المسجلة
      const hasVisited = sessionStorage.getItem('visited_session')
      if (hasVisited) {
        console.log("ℹ️ Session already recorded.")
        return
      }

      // 🛑 2. الفلتر الثاني: كشف البوتات
      const userAgent = navigator.userAgent.toLowerCase()
      const isBot =
        userAgent.includes('bot') ||
        userAgent.includes('crawler') ||
        userAgent.includes('spider') ||
        userAgent.includes('headless') ||
        navigator.webdriver

      if (isBot) {
        console.log("🤖 Bot detected! Visit ignored.")
        return
      }

      // 3. محاولة جلب الموقع (بطريقة آمنة مابتوقفش الكود)
      let locationData = {}
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) {
          locationData = await res.json()
        } else {
          console.warn("⚠️ Location API failed, recording as Unknown.")
        }
      } catch (err) {
        console.warn("⚠️ Network/AdBlock Error fetching location, continuing...", err)
      }

      // 4. فلتر الداتا سنتر (لو عرفنا نجيب البيانات)
      const org = (locationData.org || '').toLowerCase()
      if (org.includes('amazon') || org.includes('google cloud') || org.includes('microsoft')) {
        console.log("🏢 Data Center traffic detected! Visit ignored.")
        return
      }

      // 5. تجهيز البيانات
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      let referrer = document.referrer || "Direct / Typed URL";
      if (referrer.includes("facebook")) referrer = "Facebook";
      else if (referrer.includes("google")) referrer = "Google";
      else if (referrer.includes("instagram")) referrer = "Instagram";

      const screenRes = `${window.screen.width}x${window.screen.height}`;

      // 6. الإرسال للداتابيز
      const { data, error } = await supabase.from('site_visits').insert([{
        country: locationData.country_name || 'Unknown',
        city: locationData.city || 'Unknown',
        device_type: isMobile ? 'Mobile' : 'Desktop',
        user_agent: navigator.userAgent,
        isp: locationData.org || 'Unknown',
        referrer: referrer,
        screen_res: screenRes,
        browser_lang: navigator.language
      }])
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase Insert Error:", error.message) // لو فيه مشكلة هنا هتظهرلك في الكونسول
      } else {
        console.log("✅ Success! Visit Recorded ID:", data.id)

        // حفظنا الـ ID عشان رحلة العميل
        if (data) {
          sessionStorage.setItem('current_visit_id', data.id)
          sessionStorage.setItem('visited_session', 'true')
        }
      }
    }

    recordVisit()
  }, [])

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
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />

            {/* صفحة سجل الزوار */}
            <Route path="visitors" element={
              <RequireAuth allowedRoles={['admin']}>
                <VisitorLogs />
              </RequireAuth>
            } />

            <Route path="users" element={
              <RequireAuth allowedRoles={['admin']}>
                <Users />
              </RequireAuth>
            } />

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