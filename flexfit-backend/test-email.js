require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

(async () => {
    console.log('Testing email configuration...');
    
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.error('❌ Please make sure you have added SMTP_EMAIL, SMTP_PASSWORD, and SMTP_HOST to your .env file and saved it!');
        return;
    }

    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL, // sending to yourself for testing
            subject: 'Test Email from Flexfit Backend',
            message: 'Hello! If you are seeing this, your SMTP configuration is working perfectly.',
        });
        console.log('✅ Test finished. Please check your inbox (and spam folder) for the test email.');
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
})();
