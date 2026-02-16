import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LanguageToggle from './LanguageToggle'
import { useCart } from '../context/CartContext'
import CartDrawer from './CartDrawer'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems } = useCart()

  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)

    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
      setIsDarkMode(true)
    }
  }

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      <motion.nav
        id="main-navbar" // ضفنا الـ ID ده عشان App.jsx يقدر يمسكه ويزقه لتحت مع ترجمة جوجل
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 notranslate ${isScrolled || isOpen
          ? 'bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-[#334155]'
          : 'bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md shadow-sm dark:border-b dark:border-[#334155]/50'
          }`}
      >
        <div className="w-full px-3 sm:px-6 md:px-12">
          {/* 👇 قللنا المسافات هنا عشان الموبايل */}
          <div className="flex items-center justify-between h-20 gap-1">

            {/* Logo Section */}
            <Link to="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                {/* 👇 ثبات حجم اللوجو مهما حصل */}
                <div className="w-10 h-10 min-w-[40px] md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm bg-gray-50 flex items-center justify-center">
                  <img src="/logo.png" alt="Henawy's Art Logo" className="w-full h-full object-cover" />
                </div>
                {/* 👇 رجعنا الخط الكبير واسم الصفحة الواضح */}
                <h1 className="text-2xl md:text-3xl font-script text-primary font-bold whitespace-nowrap">
                  Henawy's Art
                </h1>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`relative px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 dark:text-[#e2e8f0] hover:text-primary hover:bg-primary/5 dark:hover:bg-[#0f172a]'
                      }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary/10 rounded-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                  </motion.div>
                </Link>
              ))}

              <div className="flex items-center gap-3 ml-4 border-l pl-4 border-gray-200 dark:border-gray-700">
                <LanguageToggle />

                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0f172a] transition-colors text-gray-600 dark:text-[#e2e8f0]">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Desktop Cart */}
                <button onClick={() => setIsCartOpen(true)} className="relative flex items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-[#0f172a] hover:bg-primary/10 transition-colors text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 group">
                  <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e293b] shadow-sm animate-pulse">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu Controls */}
            {/* 👇 صغرنا الـ gap لـ 1.5 عشان الزراير كلها تظهر جنب بعض في الموبايل */}
            <div className="md:hidden flex items-center gap-1.5 sm:gap-2">

              <div className="scale-90 origin-right">
                <LanguageToggle />
              </div>

              <button onClick={toggleTheme} className="p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-[#e2e8f0] border border-gray-100 dark:border-gray-700">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* 👇👇 كبسولة السلة الإبداعية للموبايل 👇👇 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border shadow-sm ${cartItems.length > 0 ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white dark:bg-[#0f172a] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
              >
                <ShoppingCart size={16} />
                {cartItems.length > 0 && (
                  <span className="text-xs font-bold">
                    {cartItems.length}
                  </span>
                )}
                {/* دايرة حمرا صغيرة بتنور لو في منتجات */}
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>

              {/* زرار القائمة (Hamburger) */}
              <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-[#e2e8f0] border border-gray-100 dark:border-gray-700">
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-[#1e293b] border-t border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col border-b border-gray-50 dark:border-gray-700">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block w-full text-center px-4 py-3 rounded-lg text-lg font-medium transition-colors ${isActive(item.path)
                      ? 'text-primary bg-primary/10 font-bold'
                      : 'text-gray-600 dark:text-[#e2e8f0] hover:bg-gray-50 dark:hover:bg-[#0f172a]'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* استدعاء مكون السلة */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar