import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar' // 👈 متنساش تستدعي الناف بار
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About' // 👈 وتستدعي باقي الصفحات

function App() {
  return (
    // 👇 لازم الـ Router يبدأ من هنا ويحوط التطبيق كله
    <Router>
      <div className="min-h-screen flex flex-col">
        
        {/* 1. الناف بار */}
        <Navbar /> 

        {/* 2. المحتوى المتغير */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<CategoryPage />} />
            {/* ضيف مسار الـ About لو مش ضايفه */}
            <Route path="/about" element={<About />} />
          </Routes>
        </div>

        {/* 3. الفوتر */}
        <Footer /> 

      </div>
    </Router>
  )
}

export default App