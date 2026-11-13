const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn('⚠️ SMTP credentials not configured. Email will not be sent.', options);
            return;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `${process.env.FROM_NAME || 'Flexfit Store'} <${process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✉️ Email sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
    }
};

module.exports = sendEmail;
