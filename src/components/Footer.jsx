import { Facebook, Instagram, Music, MapPin, Phone, Mail, Heart, Lock } from 'lucide-react' // ضفت ايقونة Lock
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
              <SocialLink href="https://www.facebook.com/profile.php?id=61553205643136" icon={<Facebook size={20} />} />
              <SocialLink href="https://www.instagram.com/henawy_art?igsh=ZzNsbjVhNmJtOWht" icon={<Instagram size={20} />} />
              <SocialLink href="https://www.tiktok.com/@henawy.art?_r=1&_t=ZS-93dOz9WbrcL" icon={<Music size={20} />} />
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

            {/* 👇👇👇 رابط الدخول للموظفين هنا 👇👇👇 */}
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

// Helper Component for Social Icons
const SocialLink = ({ href, icon }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3 }}
      className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all duration-300"
    >
      {icon}
    </motion.a>
  )
}

export default Footer