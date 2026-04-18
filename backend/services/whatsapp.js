// Mock WhatsApp API Service
const axios = require('axios');

exports.sendWhatsAppNotification = async (phone, message) => {
  try {
    console.log(`[WhatsApp Service] Sending to ${phone}: ${message}`);
    // In production, integrate with Twilio or WhatsApp Cloud API here:
    /*
    await axios.post('https://graph.facebook.com/v16.0/.../messages', {
      messaging_product: 'whatsapp',
      to: phone,
      text: { body: message }
    }, { headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` } });
    */
    return true;
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return false;
  }
};
