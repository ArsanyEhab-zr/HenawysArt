import { motion } from 'framer-motion'
import { Code2, Database, Layout, Smartphone, Mail, Globe, Server, ArrowRight, Paintbrush } from 'lucide-react'
import { Link } from 'react-router-dom'

const Developer = () => {
  return (
    // 👇 توحيد خلفية الصفحة
    <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0f172a] pt-24 pb-12 relative overflow-hidden transition-colors duration-300">

      {/* خلفية زخرفية خفيفة */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* 1. Artistic Hero Section - كارت المطور الفني */}
      <section className="max-w-4xl mx-auto px-4 mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          // 👇 الكارت بقى شبه شفاف غامق في الدارك مود
          className="bg-white/60 dark:bg-[#1e293b]/80 backdrop-blur-md border border-stone-200 dark:border-[#334155] rounded-[3rem] p-8 md:p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {/* برواز الصورة الفني */}
          <div className="relative w-48 h-48 mx-auto mb-8 group">
            {/* الدائرة الخلفية بلون الخشب الفاتح تتحرك مع الهوفر */}
            <div className="absolute inset-0 bg-orange-100 dark:bg-primary/20 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-blob opacity-70 group-hover:scale-110 transition-transform duration-700"></div>

            {/* الصورة نفسها في شكل غير منتظم قليلاً */}
            <div className="relative w-full h-full rounded-[35%_65%_60%_40%/35%_45%_65%_55%] overflow-hidden border-4 border-white dark:border-[#0f172a] shadow-lg transform rotate-3 transition-transform duration-500 group-hover:rotate-0">
              <img
                src="/me.jpeg"
                alt="Arsany zika"
                className="w-full h-full object-cover"
              />
            </div>

            {/* أيقونة فنية صغيرة */}
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-[#1e293b] p-2 rounded-full shadow-md text-primary rotate-12">
              <Code2 size={24} />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-[#e2e8f0] mb-2 font-script">
            Arsany Zika
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-px w-8 bg-primary/30"></span>
            <p className="text-lg text-primary font-medium tracking-wide uppercase">
              Digital Craftsman & Full Stack Developer
            </p>
            <span className="h-px w-8 bg-primary/30"></span>
          </div>

          <p className="text-gray-600 dark:text-[#94a3b8] leading-relaxed max-w-2xl mx-auto text-lg font-light italic mb-8">
            "Just as an artist paints on wood, I code digital experiences. merging the precision of .NET with the beauty of React to create software that feels handmade."
          </p>

          <div className="flex justify-center gap-4">
            <a href="mailto:arsanyehab711@gmail.com" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2 group">
              <Mail size={18} className="group-hover:animate-bounce" /> Get in Touch
            </a>
            <a href="https://github.com/ArsanyEhab-zr" target="_blank" rel="noreferrer" className="bg-white dark:bg-[#0f172a] text-gray-800 dark:text-[#e2e8f0] border border-stone-200 dark:border-[#334155] px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
              <Globe size={18} /> My Portfolio
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. Tech Stack - بستايل أنيق */}
      <section className="max-w-5xl mx-auto px-4 mb-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-script text-3xl text-gray-800 dark:text-[#e2e8f0] mb-2">My Digital Tools</h2>
          <p className="text-gray-500 dark:text-[#94a3b8] text-sm">The brushes and paints I use for coding</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ArtisticTechCard icon={<Layout />} title="React.js" color="text-blue-500" delay={0.1} />
          <ArtisticTechCard icon={<Database />} title="Supabase" color="text-green-500" delay={0.2} />
          <ArtisticTechCard icon={<Paintbrush />} title="Tailwind" color="text-cyan-500" delay={0.3} />
          <ArtisticTechCard icon={<Server />} title=".NET Core" color="text-purple-600" delay={0.4} />
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-100 dark:border-[#334155] flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-script text-4xl text-gray-800 dark:text-[#e2e8f0] mb-4">Let's Create Together</h2>
            <p className="text-gray-600 dark:text-[#94a3b8] mb-6 font-light">
              Need a website that captures hearts? I build custom applications that are as unique as your fingerprint.
            </p>
          </div>

          {/* رسم بياني بسيط بشكل فني */}
          <div className="w-full md:w-1/3 space-y-3">
            <SkillBar skill="Frontend Artistry" level="95%" color="bg-primary" />
            <SkillBar skill="Backend Logic" level="90%" color="bg-accent" />
            <SkillBar skill="UI/UX Design" level="85%" color="bg-orange-300" />
          </div>
        </div>
      </section>

    </div>
  )
}

// ---- Helper Components ----

const ArtisticTechCard = ({ icon, title, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ y: -5, rotate: 2 }}
    // 👇 الكروت في الدارك مود بقت غامقة
    className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-stone-100 dark:border-[#334155] flex flex-col items-center gap-3 cursor-default"
  >
    <div className={`${color} bg-gray-50 dark:bg-[#0f172a] p-3 rounded-2xl`}>
      {icon}
    </div>
    <span className="font-bold text-gray-700 dark:text-[#e2e8f0] font-sans">{title}</span>
  </motion.div>
)

const SkillBar = ({ skill, level, color }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-500 dark:text-[#94a3b8] mb-1 font-medium ml-1">
      <span>{skill}</span>
      <span>{level}</span>
    </div>
    <div className="h-2 w-full bg-gray-100 dark:bg-[#0f172a] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: level }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
)

export default Developer