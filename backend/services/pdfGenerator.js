const PDFDocument = require('pdfkit');

// Sanitize text input to prevent XSS in PDF generation
function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[<>]/g, '').substring(0, 100); // Limit length and remove HTML tags
}

exports.generateReceipt = (bookingData, res) => {
  try {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: 'Hotel Receipt',
        Author: 'Smart AI Hotel Management',
        Subject: 'Booking Receipt'
      }
    });

    // Security headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${bookingData._id.toString().substring(0, 8)}.pdf`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache');

    doc.pipe(res);

    // Header with security - prevent injection
    doc.fontSize(20).text('Smart AI Hotel Management', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Receipt / Invoice', { align: 'center' });
    doc.moveDown();

    // Sanitize all user data before adding to PDF
    const bookingId = bookingData._id.toString().substring(0, 24);
    const guestName = sanitizeText(bookingData.user?.name || 'N/A');
    const roomType = sanitizeText(bookingData.room?.type || 'N/A');
    const roomNumber = sanitizeText(bookingData.room?.roomNumber || 'N/A');
    const paymentStatus = ['Paid', 'Pending', 'Refunded'].includes(bookingData.paymentStatus) ?
                         bookingData.paymentStatus : 'Unknown';
    const totalAmount = typeof bookingData.totalAmount === 'number' && bookingData.totalAmount >= 0 ?
                       bookingData.totalAmount : 0;

    // Booking Info
    doc.fontSize(12)
       .text(`Booking ID: ${bookingId}`)
       .text(`Guest Name: ${guestName}`)
       .text(`Room: ${roomType} - ${roomNumber}`)
       .text(`Check In: ${new Date(bookingData.checkInDate).toLocaleDateString()}`)
       .text(`Check Out: ${new Date(bookingData.checkOutDate).toLocaleDateString()}`);
    doc.moveDown();

    // Payment
    doc.text(`Payment Status: ${paymentStatus}`)
       .text(`Total Amount: GHS ${totalAmount.toFixed(2)}`);

    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for choosing us!', { align: 'center', italic: true });
    doc.fontSize(8).text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

    doc.end();

    // Handle PDF generation errors
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ msg: 'Error generating receipt' });
      }
    });

  } catch (error) {
    console.error('Receipt generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ msg: 'Server error generating receipt' });
    }
  }
};
