const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Order confirmation email
const sendOrderConfirmation = async (user, order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: '"Rype Juices" <noreply@rype.com>',
      to: user.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4a90e2, #5fa8ff); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Rype</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fresh Juices Delivered</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Order Confirmed! 🎉</h2>
            <p style="color: #5d6d7e; line-height: 1.6;">
              Hi ${user.name}, thank you for your order! We're preparing your fresh juices and will deliver them soon.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #4a90e2; margin-bottom: 15px;">Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderId}</p>
              <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
              <p><strong>Estimated Delivery:</strong> 25-35 minutes</p>
              <p><strong>Delivery Address:</strong> ${order.address}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px;">
              <h3 style="color: #4a90e2; margin-bottom: 15px;">Items Ordered</h3>
              ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e1e8ed;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track" 
                 style="background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; opacity: 0.8;">&copy; 2024 Rype Juices. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
  }
};

// Order status update email
const sendOrderStatusUpdate = async (user, order, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      'preparing': 'Your juices are being prepared with fresh ingredients!',
      'out-for-delivery': 'Your order is out for delivery!',
      'delivered': 'Your order has been delivered. Enjoy your fresh juices!'
    };

    const mailOptions = {
      from: '"Rype Juices" <noreply@rype.com>',
      to: user.email,
      subject: `Order Update - ${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4a90e2, #5fa8ff); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Rype</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Status Updated</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Order Update 📦</h2>
            <p style="color: #5d6d7e; line-height: 1.6;">
              Hi ${user.name}, your order status has been updated:
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="color: #4a90e2; margin: 0 0 10px 0;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h3>
              <p style="color: #5d6d7e; margin: 0;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track" 
                 style="background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status update email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate
};