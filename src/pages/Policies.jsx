import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const Policies = () => {
    const { hash } = useLocation()

    // كود عشان لما يدوس على اللينك ينزل للقسم بتاعه
    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''))
            if (element) element.scrollIntoView({ behavior: 'smooth' })
        } else {
            window.scrollTo(0, 0)
        }
    }, [hash])

    return (
        <div className="pt-24 pb-12 min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-8 space-y-12"
                >
                    {/* 🚚 Shipping Policy */}
                    <section id="shipping" className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-script font-bold text-primary mb-4">Shipping Policy</h2>
                        <div className="space-y-3 text-gray-600">
                            <p>Because each piece is hand-painted with care specially for you:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Processing Time:</strong> Please allow <strong>10 to 14 days</strong> for your order to be painted and prepared.</li>
                                <li><strong>Delivery:</strong> Once shipped, delivery takes 2-4 business days depending on your governorate.</li>
                                <li><strong>Fees:</strong> Shipping fees are calculated at checkout based on location.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 🔄 Returns & Refunds */}
                    <section id="returns" className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-script font-bold text-primary mb-4">Returns & Refunds</h2>
                        <div className="space-y-3 text-gray-600">
                            <p><strong>Custom Orders:</strong> Since these items are personalized with your specific dates, names, or designs, <span className="text-red-500 font-bold">we cannot accept returns or exchanges</span> unless the item arrives damaged.</p>
                            <p><strong>Damaged Items:</strong> If your order arrives damaged, please contact us within 24 hours of delivery with photos, and we will make it right.</p>
                        </div>
                    </section>

                    {/* 🛡️ Privacy Policy */}
                    <section id="privacy" className="border-b border-gray-100 pb-8">
                        <h2 className="text-2xl font-script font-bold text-primary mb-4">Privacy Policy</h2>
                        <div className="space-y-3 text-gray-600">
                            <p>We respect your privacy. Any personal photos sent for reference are used solely for creating your artwork and are never shared or posted on social media without your explicit permission.</p>
                            <p>Your phone number and address are used only for shipping purposes.</p>
                        </div>
                    </section>

                    {/* 📞 Customer Service */}
                    <section id="contact">
                        <h2 className="text-2xl font-script font-bold text-primary mb-4">Need Help?</h2>
                        <p className="text-gray-600">
                            If you have any questions, please contact us via WhatsApp or visit our <a href="/contact" className="text-accent font-bold hover:underline">Contact Page</a>.
                        </p>
                    </section>

                </motion.div>
            </div>
        </div>
    )
}

export default Policies