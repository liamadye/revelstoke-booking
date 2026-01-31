import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendBookingNotification = async (booking: {
    name: string;
    email: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}) => {
    const startDateStr = booking.startDate.toLocaleDateString();
    const endDateStr = booking.endDate.toLocaleDateString();

    const mailOptions = {
        from: `"Revelstoke Booking" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Notify owners (defaults to auth user, can be changed if needed)
        subject: `New Booking Request: ${booking.name}`,
        html: `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Dates:</strong> ${startDateStr} - ${endDateStr}</p>
      <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
      <br/>
      <p>Please check Notion to approve or deny this request.</p>
    `,
    };

    const userMailOptions = {
        from: `"Revelstoke Booking" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: 'Booking Request Received - Revelstoke',
        html: `
      <h2>Request Received</h2>
      <p>Hi ${booking.name},</p>
      <p>We received your request to stay at Revelstoke from ${startDateStr} to ${endDateStr}.</p>
      <p>We will review it and get back to you shortly.</p>
    `,
    }

    await Promise.all([
        transporter.sendMail(mailOptions),
        transporter.sendMail(userMailOptions)
    ]);
};
