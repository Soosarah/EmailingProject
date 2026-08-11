
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

async function verifyEmailConnection() {
    try {

        await transporter.verify();

        console.log("Email server is ready.");

    } catch (error) {

        console.error("EMAIL CONNECTION ERROR:");
        console.error(error.message);

    }
}

async function sendCampaignEmail(to, subject, html) {

    try {

        const info = await transporter.sendMail({
            from: `"Djezzy" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(
            `Email sent to ${to}: ${info.messageId}`
        );

        return info;

    } catch (error) {

        console.error(
            `EMAIL FAILED FOR ${to}:`
        );

        console.error(error.message);

        throw error;
    }
}

verifyEmailConnection();

module.exports = {
    sendCampaignEmail
};
