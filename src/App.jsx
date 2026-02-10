import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

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
import Products from './dashboard/Products' // 👈 1. ضفنا دي (مهم جداً)
import Settings from './dashboard/Settings' // 👈 2. وضفنا دي كمان

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

            {/* صفحة المنتجات (شيلنا الكومنت وضفناها) ✅ */}
            <Route path="products" element={<Products />} />

            {/* صفحة المستخدمين (للمدير فقط) */}
            <Route path="users" element={
              <RequireAuth allowedRoles={['admin']}>
                <Users />
              </RequireAuth>
            } />

            {/* صفحة الإعدادات (للمدير فقط) - ضفناها جديد ✅ */}
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