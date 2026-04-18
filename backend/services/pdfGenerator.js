const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateReceipt = (bookingData, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${bookingData._id}.pdf`);
  
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Smart AI Hotel Management', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Receipt / Invoice', { align: 'center' });
  doc.moveDown();

  // Booking Info
  doc.fontSize(12).text(`Booking ID: ${bookingData._id}`);
  doc.text(`Guest Name: ${bookingData.user.name}`);
  doc.text(`Room: ${bookingData.room.type} - ${bookingData.room.roomNumber}`);
  doc.text(`Check In: ${new Date(bookingData.checkInDate).toLocaleDateString()}`);
  doc.text(`Check Out: ${new Date(bookingData.checkOutDate).toLocaleDateString()}`);
  doc.moveDown();

  // Payment
  doc.text(`Payment Status: ${bookingData.paymentStatus}`);
  doc.text(`Total Amount: $${bookingData.totalAmount.toFixed(2)}`);
  
  doc.moveDown(2);
  doc.text('Thank you for choosing us!', { align: 'center', italic: true });

  doc.end();
};
