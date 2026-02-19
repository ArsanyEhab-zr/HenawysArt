import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { supabase } from './supabaseClient'

// استيراد الـ CartProvider
import { CartProvider } from './context/CartContext'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Developer from './pages/Developer'
import Policies from './pages/Policies'
import Login from './pages/Login'
import RequireAuth from './components/RequireAuth'

// Dashboard
import DashboardLayout from './dashboard/DashboardLayout'
import DashboardHome from './dashboard/DashboardHome'
import Orders from './dashboard/Orders'
import Users from './dashboard/Users'
import Products from './dashboard/Products'
import Settings from './dashboard/Settings'
import VisitorLogs from './dashboard/VisitorLogs'



const Layout = ({ children }) => {
  const location = useLocation()
  const hideHeaderFooter = location.pathname.startsWith('/dashboard') || location.pathname === '/login'

  useEffect(() => {
    const fixGoogleTranslateBar = () => {
      const bodyTop = document.body.style.top;
      const nav = document.getElementById('main-navbar');

      if (nav) {
        if (bodyTop && bodyTop !== '0px') {
          nav.style.top = bodyTop;
        } else {
          nav.style.top = '0px';
        }
      }
    };

    const observer = new MutationObserver(fixGoogleTranslateBar);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden relative">

     

      {!hideHeaderFooter && <Navbar />}

      <div className="flex-grow w-full">
        {children}
      </div>

      {!hideHeaderFooter && <Footer />}
    </div>
  )
}

function App() {

  useEffect(() => {
    const recordVisit = async () => {
      const hasVisited = sessionStorage.getItem('visited_session')
      if (hasVisited) return

      const userAgent = navigator.userAgent.toLowerCase()
      const isBot = userAgent.includes('bot') || navigator.webdriver
      if (isBot) return

      let locationData = {}
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (res.ok) locationData = await res.json()
      } catch (err) { }

      const org = (locationData.org || '').toLowerCase()
      if (org.includes('amazon') || org.includes('google cloud') || org.includes('microsoft')) return

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      let referrer = document.referrer || "Direct / Typed URL";
      if (referrer.includes("facebook")) referrer = "Facebook";
      else if (referrer.includes("google")) referrer = "Google";
      else if (referrer.includes("instagram")) referrer = "Instagram";

      const screenRes = `${window.screen.width}x${window.screen.height}`;

      const { data, error } = await supabase.from('site_visits').insert([{
        country: locationData.country_name || 'Unknown',
        city: locationData.city || 'Unknown',
        device_type: isMobile ? 'Mobile' : 'Desktop',
        user_agent: navigator.userAgent,
        isp: locationData.org || 'Unknown',
        referrer: referrer,
        screen_res: screenRes,
        browser_lang: navigator.language
      }]).select().single()

      if (!error && data) {
        sessionStorage.setItem('current_visit_id', data.id)
        sessionStorage.setItem('visited_session', 'true')
      }
    }

    recordVisit()
  }, [])

  return (
    <CartProvider>
      <Router>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/developer" element={<Developer />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<DashboardHome />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="visitors" element={<RequireAuth allowedRoles={['admin']}><VisitorLogs /></RequireAuth>} />
              <Route path="users" element={<RequireAuth allowedRoles={['admin']}><Users /></RequireAuth>} />
              <Route path="settings" element={<RequireAuth allowedRoles={['admin']}><Settings /></RequireAuth>} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  )
}

export default App