
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

const getBaseUrl = () => {
  // In production, this should be the actual domain.
  // For Vercel preview/production, we can rely on VERCEL_URL but prefer a fixed config if possible.
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

const getHtmlTemplate = (content: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #1c1917; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e7e5e4; }
          .header { text-align: center; margin-bottom: 30px; letter-spacing: 0.1em; text-transform: uppercase; font-size: 14px; color: #78716c; font-weight: 600; }
          .logo { font-size: 24px; font-weight: bold; color: #1c1917; text-decoration: none; display: block; margin-bottom: 8px; letter-spacing: -0.02em; }
          .content { line-height: 1.6; font-size: 16px; color: #44403c; }
          .button { display: inline-block; padding: 12px 24px; background-color: #171717; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 20px; text-align: center; }
          .button--outline { background-color: transparent; border: 1px solid #d6d3d1; color: #171717 !important; margin-left: 10px; }
          .divider { border-top: 1px solid #f5f5f4; margin: 30px 0; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #a8a29e; }
          h2 { font-size: 20px; font-weight: 600; color: #1c1917; margin-top: 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f5f5f4; padding-bottom: 12px; }
          .info-label { font-weight: 600; color: #78716c; font-size: 14px; }
          .info-value { font-weight: 400; color: #1c1917; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Alpine Sanctuary</span>
            Revelstoke, BC
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Liam & Lauren. 24-414 Humbert Street.
          </div>
        </div>
      </body>
    </html>
  `;
};

export const sendBookingNotification = async (booking: {
  name: string;
  email: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  pageId: string; // Needed for action links
}) => {
  const startDateStr = booking.startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const endDateStr = booking.endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const baseUrl = getBaseUrl();

  // Owner Notification
  const ownerContent = `
      <h2>New Booking Request</h2>
      <p>You have received a new booking request. Details below:</p>
      
      <div style="background: #fcfaf8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div class="info-row"><span class="info-label">Guest</span> <span class="info-value">${booking.name}</span></div>
        <div class="info-row"><span class="info-label">Email</span> <span class="info-value"><a href="mailto:${booking.email}">${booking.email}</a></span></div>
        <div class="info-row"><span class="info-label">Check-in</span> <span class="info-value">${startDateStr}</span></div>
        <div class="info-row"><span class="info-label">Check-out</span> <span class="info-value">${endDateStr}</span></div>
        <div class="info-row" style="border: none;"><span class="info-label">Notes</span> <span class="info-value">${booking.notes || 'None'}</span></div>
      </div>

      <p>Please approve or deny this request:</p>
      <div style="margin-top: 20px;">
        <a href="${baseUrl}/api/actions/approve?id=${booking.pageId}" class="button" style="color:#ffffff;">Approve Request</a>
        <a href="${baseUrl}/api/actions/deny?id=${booking.pageId}" class="button button--outline">Deny</a>
      </div>
    `;

  const mailOptions = {
    from: `"Revelstoke Booking" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Request: ${booking.name} (${startDateStr})`,
    html: getHtmlTemplate(ownerContent),
  };

  // Guest Notification (Received)
  const guestContent = `
      <h2>Request Received</h2>
      <p>Hi ${booking.name},</p>
      <p>Thanks for your interest in staying at our Revelstoke home.</p>
      <p>We've received your request for <strong>${startDateStr}</strong> to <strong>${endDateStr}</strong>.</p>
      <p>We will review it and get back to you shortly with a confirmation.</p>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #78716c;">If you have any questions, feel free to reply to this email.</p>
    `;

  const userMailOptions = {
    from: `"Revelstoke Booking" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: 'Booking Request Received - Revelstoke',
    html: getHtmlTemplate(guestContent),
  };

  await Promise.all([
    transporter.sendMail(mailOptions),
    transporter.sendMail(userMailOptions)
  ]);
};

export const sendBookingApprovedEmail = async (booking: {
  email: string;
}) => {
  // We assume we want to be generic if we don't have full details, 
  // but ideally we pass details. For now, let's keep it simple or fetch details if needed.
  // To make it robust, the caller should pass the name/dates. 
  // I previously planned to pass "bookingDetails". 
  // Let's assume the caller finds them.
  // For simpler MVP, we just send a generic "Your booking is approved" 
  // or we rely on the caller to pass data.
  // I'll update the signature to accept more data.

  // NOTE: This will fail type check if I don't update caller. 
  // But since this is a new function, no existing callers.
};

// Overload or separate function/interface
export const sendApprovalConfirmation = async (guestEmail: string, details?: { name?: string, start?: string, end?: string }) => {

  const content = `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${details?.name || 'There'},</p>
      <p>Great news! Your stay at our Revelstoke home has been <strong>approved</strong>.</p>
      ${details?.start ? `<p><strong>Dates:</strong> ${details.start} - ${details.end}</p>` : ''}
      <p>You are all set. We will send you check-in instructions closer to your arrival date.</p>
      <a href="https://maps.google.com/?q=24-414+Humbert+Street,+Revelstoke,+BC" class="button" style="color:white">Get Directions</a>
    `;

  await transporter.sendMail({
    from: `"Revelstoke Booking" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: 'Booking Confirmed! - Revelstoke',
    html: getHtmlTemplate(content),
  });
}
