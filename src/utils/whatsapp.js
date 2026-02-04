// WhatsApp integration helper
const WHATSAPP_NUMBER = "201280140268"

export const createWhatsAppLink = (productDetails, customerName, notes) => {
  const message = `Hello, I want to order ${productDetails.title}... Name: ${customerName}... Notes: ${notes || "No special notes"}`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}

export const openWhatsAppChat = (productDetails, customerName, notes) => {
  const link = createWhatsAppLink(productDetails, customerName, notes)
  window.open(link, '_blank')
}