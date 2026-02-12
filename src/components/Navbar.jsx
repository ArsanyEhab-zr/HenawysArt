import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LanguageToggle from './LanguageToggle'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      // 👇👇 التعديل الهام هنا: استخدام ألوان صريحة للدارك مود (Slate-800) 👇👇
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isOpen
        ? 'bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-lg shadow-lg border-b border-white/20 dark:border-[#334155]'
        : 'bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md shadow-sm dark:border-b dark:border-[#334155]/50'
        }`}
    >
      <div className="w-full px-6 md:px-12">
        <div className="flex items-center justify-between h-20">

          {/* Logo Section */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 flex-shrink-0"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm bg-gray-50 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Henawy's Art Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="text-2xl md:text-3xl font-script text-primary font-bold">
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
                  // 👇👇 تعديل ألوان الروابط في الدارك مود 👇👇
                  className={`relative px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-700 dark:text-[#e2e8f0] hover:text-primary hover:bg-primary/5 dark:hover:bg-[#0f172a]'
                    }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}

            <div className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-200 dark:border-gray-700">
              <LanguageToggle />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0f172a] transition-colors text-gray-600 dark:text-[#e2e8f0]"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-[#e2e8f0]">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-[#e2e8f0] hover:text-primary transition-colors focus:outline-none p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
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
            // 👇👇 القائمة المنسدلة للموبايل بقت غامقة صريح 👇👇
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
              <div className="pt-4 flex justify-center">
                <LanguageToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar