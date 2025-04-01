interface WhatsAppMessage {
  phone: string;
  message: string;
  imageUrl?: string;
}

export const sendWhatsAppMessage = async ({ phone, message, imageUrl }: WhatsAppMessage) => {
  try {
    // Format phone number (remove spaces, dashes, etc.)
    const formattedPhone = phone.replace(/[^\d]/g, '');
    
    // Create WhatsApp message with image if provided
    let whatsappText = encodeURIComponent(message);
    if (imageUrl) {
      whatsappText += `\n\nImage: ${encodeURIComponent(imageUrl)}`;
    }
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${whatsappText}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};
