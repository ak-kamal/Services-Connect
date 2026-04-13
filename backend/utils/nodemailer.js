import nodemailer from 'nodemailer';
import dotenv from 'dotenv';  // Import dotenv

// Load environment variables
dotenv.config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Get email from the environment variable
    pass: process.env.GMAIL_PASS   // Get password from the environment variable
  }
});

// Email sending function
const sendWorkDoneEmail = async (provider, customer, offer) => {
  const message = {
    from: process.env.GMAIL_USER,  // Use environment variable for the sender email
    to: [provider.email, customer.email],
    subject: 'Confirmation of Completed Work - Services Connect',
    text: `
      Dear ${provider.name} and ${customer.name},

      We are pleased to inform you that the work for the time slot ${offer.timeSlot} on ${offer.date} has been successfully completed. 

      We truly appreciate your trust in our service and are committed to delivering high-quality service on every occasion. 

      If you have any questions or require further assistance, please do not hesitate to reach out.

      Thank you for choosing Services Connect.

      Best regards,
      The Services Connect Team
      [www.servicesconnect.com]
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendWorkDoneEmail;