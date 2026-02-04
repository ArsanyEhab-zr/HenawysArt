import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About'
import Developer from './pages/Developer' // 👈 1. ضيف الاستيراد ده

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        
        <Navbar /> 

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            <Route path="/about" element={<About />} />
            
            {/* 👇 2. ضيف السطر ده عشان صفحة المطور تفتح */}
            <Route path="/developer" element={<Developer />} />
            
          </Routes>
        </div>

        <Footer /> 

      </div>
    </Router>
  )
}

export default App