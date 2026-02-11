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

  // 👇👇👇 كود التتبع الذكي (Smart Tracker) 👇👇👇
  useEffect(() => {
    const recordVisit = async () => {
      // 1. الفلتر الأول: لو الزائر ده مسجل عندنا في نفس الجلسة، تجاهله
      const hasVisited = sessionStorage.getItem('visited_session')
      if (hasVisited) return

      // 🛑 2. الفلتر الثاني: كشف البوتات (Anti-Bot Check)
      const userAgent = navigator.userAgent.toLowerCase()
      const isBot =
        userAgent.includes('bot') ||        // جوجل وغيره
        userAgent.includes('crawler') ||    // زواحف الأرشفة
        userAgent.includes('spider') ||     // عناكب البحث
        userAgent.includes('headless') ||   // متصفحات الكود
        userAgent.includes('lighthouse') || // أداة قياس الأداء
        navigator.webdriver                 // خاصية بتبقى True لو المتصفح شغال ببرنامج تحكم آلي

      if (isBot) {
        console.log("🤖 Bot detected! Visit ignored.")
        return // ⛔ وقف هنا ومتكملش الكود
      }

      try {
        // 3. لو عدى من الفلتر، هات بياناته
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) throw new Error('Location API failed')
        const locationData = await res.json()

        // 4. فلتر إضافي: لو شركة النت هي داتا سنتر
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

        // 6. الإرسال للداتابيز وحفظ الـ ID
        // 👇 التعديل المهم هنا 👇
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
          .select() // 👈 هات البيانات اللي اتسجلت
          .single() // 👈 هات صف واحد بس

        if (error) throw error

        // ✅ حفظنا الـ ID بتاع الزيارة دي عشان نستخدمه لما يشوف منتج
        if (data) {
          sessionStorage.setItem('current_visit_id', data.id)
          sessionStorage.setItem('visited_session', 'true')
        }

      } catch (error) {
        console.error("Tracking Error (Site works fine):", error)
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
            {/* الصفحة الرئيسية (الإحصائيات) */}
            <Route index element={<DashboardHome />} />

            {/* صفحة الطلبات */}
            <Route path="orders" element={<Orders />} />

            {/* صفحة المنتجات */}
            <Route path="products" element={<Products />} />

            {/* صفحة سجل الزوار */}
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