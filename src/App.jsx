import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About'
import Contact from './pages/Contact' // 👈 1. لازم تضيف السطر ده!
import Developer from './pages/Developer'

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
            
            {/* دلوقتي ده هيشتغل صح لأننا عملنا import فوق */}
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/developer" element={<Developer />} />
          </Routes>
        </div>

        <Footer /> 

      </div>
    </Router>
  )
}

export default App