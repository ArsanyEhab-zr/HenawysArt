import { MapPin, Phone, Mail, Heart, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* 1. About Section */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-6 font-script">About Henawy's Art</h3>
            <p className="text-gray-600 leading-relaxed text-sm mb-6">
              Specialized in creating best memories. We transform your photos into timeless faceless art on natural wood slices, customized medals, and frames. High quality service for your home.
            </p>
            <div className="flex gap-4">
              {/* 👇 الأيقونات الرسمية بألوان البراند في الـ Hover 👇 */}
              <SocialLink
                href="https://www.facebook.com/profile.php?id=61553205643136"
                hoverClass="hover:bg-[#1877F2] hover:text-white"
                icon={<FacebookIcon />}
              />
              <SocialLink
                href="https://www.instagram.com/henawy_art?igsh=ZzNsbjVhNmJtOWht"
                hoverClass="hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent"
                icon={<InstagramIcon />}
              />
              <SocialLink
                href="https://www.tiktok.com/@henawy.art?_r=1&_t=ZS-93dOz9WbrcL"
                hoverClass="hover:bg-black hover:text-white"
                icon={<TikTokIcon />}
              />
            </div>
          </div>

          {/* 2. Help & FAQ */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Help & FAQ</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/policies#shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/policies#returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Customer Service</Link></li>
              <li><Link to="/policies#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* 3. Important Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
            </ul>
          </div>

          {/* 4. Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary" />
                <span dir="ltr">+20 1280140268</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary" />
                <span>marinahenawy38@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-1" />
                <span>Egypt, Alexandria</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Henawy's Art. All rights reserved.
            </p>

            <Link
              to="/login"
              className="text-xs text-gray-300 hover:text-primary transition-colors flex items-center gap-1"
              title="Staff Access Only"
            >
              <Lock size={12} /> Staff Login
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
            <span>Built with support from</span>
            <Link
              to="/developer"
              onClick={() => window.scrollTo(0, 0)}
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              Arsany zika <Heart size={14} className="fill-current" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ==========================================
// مكون زر السوشيال ميديا الجديد
// ==========================================
const SocialLink = ({ href, icon, hoverClass }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3 }}
      className={`w-10 h-10 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 ${hoverClass}`}
    >
      {icon}
    </motion.a>
  )
}

// ==========================================
// الأيقونات الأصلية للشركات (Vector SVGs)
// ==========================================
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.64-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-4.27.2-6.78 1.76-6.98 5.98C0 7.33 0 7.74 0 12s.01 4.67.07 5.95c.2 4.22 2.71 5.78 6.98 5.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.27-.2 6.78-1.76 6.98-5.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.22-2.71-5.78-6.98-5.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm5.23-11.59a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export default Footer