import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import About from './pages/About'
import Footer from './components/Footer'

// ... الاستيرادات بتاعتك

function App() {
  return (
    <div className="min-h-screen flex flex-col"> {/* 👈 ضيفنا flex عشان الفوتر ينزل تحت خالص لو الصفحة فاضية */}
      
      {/* 1. الناف بار ثابت فوق */}
      <Navbar /> 

      {/* 2. المحتوى المتغير (الصفحات) */}
      <div className="flex-grow"> {/* 👈 الكلاس ده مهم عشان يزق الفوتر لتحت */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<CategoryPage />} />
          {/* ... باقي المسارات ... */}
        </Routes>
      </div>

      {/* 3. الفوتر ثابت تحت في كل الصفحات */}
      <Footer /> 

    </div>
  )
}
export default App
