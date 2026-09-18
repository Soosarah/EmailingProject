const nodemailer = require("nodemailer");


// ============================================================
// CHECK ENVIRONMENT VARIABLES
// ============================================================

if (!process.env.EMAIL_USER) {
    console.error(
        "EMAIL CONFIG ERROR: EMAIL_USER is not defined."
    );
}

if (!process.env.EMAIL_APP_PASSWORD) {
    console.error(
        "EMAIL CONFIG ERROR: EMAIL_APP_PASSWORD is not defined."
    );
}


// ============================================================
// CREATE EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },

    logger: true,
    debug: true
});


// ============================================================
// VERIFY EMAIL CONNECTION
// ============================================================

async function verifyEmailConnection() {

    console.log(
        "=============================================="
    );

    console.log(
        "CHECKING EMAIL CONFIGURATION..."
    );

    console.log(
        "EMAIL USER:",
        process.env.EMAIL_USER || "NOT DEFINED"
    );

    console.log(
        "APP PASSWORD:",
        process.env.EMAIL_APP_PASSWORD
            ? "DEFINED"
            : "NOT DEFINED"
    );

    try {

        await transporter.verify();

        console.log(
            "EMAIL SERVER IS READY."
        );

        console.log(
            "Gmail SMTP authentication successful."
        );

    } catch (error) {

        console.error(
            "=============================================="
        );

        console.error(
            "EMAIL CONNECTION ERROR"
        );

        console.error(
            "=============================================="
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Command:",
            error.command
        );

        console.error(
            "Response:",
            error.response
        );

        console.error(
            "Response Code:",
            error.responseCode
        );

        console.error(
            "=============================================="
        );
    }
}


// ============================================================
// SEND CAMPAIGN EMAIL
// ============================================================

async function sendCampaignEmail(
    to,
    subject,
    html,
    uniqueToken = null
) {

    console.log(
        "----------------------------------------------"
    );

    console.log(
        "PREPARING EMAIL"
    );

    console.log(
        "To:",
        to
    );

    console.log(
        "Subject:",
        subject
    );

    try {

        if (!process.env.EMAIL_USER) {

            throw new Error(
                "EMAIL_USER is missing from environment variables."
            );
        }

        if (!process.env.EMAIL_APP_PASSWORD) {

            throw new Error(
                "EMAIL_APP_PASSWORD is missing from environment variables."
            );
        }


        // ====================================================
        // ADD OPEN TRACKING PIXEL
        // ====================================================

        let emailHtml = html || "";

        if (uniqueToken) {

            const baseUrl =
                process.env.PUBLIC_BASE_URL ||
                "http://localhost:5000";

            const trackingPixel = `
                <img
                    src="${baseUrl}/api/public/email-open/${uniqueToken}"
                    width="1"
                    height="1"
                    style="display:block;border:0;width:1px;height:1px;"
                    alt=""
                />
            `;

            emailHtml += trackingPixel;

            console.log(
                "OPEN TRACKING ENABLED"
            );

            console.log(
                "Tracking token:",
                uniqueToken
            );

        } else {

            console.log(
                "OPEN TRACKING DISABLED - NO TOKEN"
            );
        }


        // ====================================================
        // EMAIL OPTIONS
        // ====================================================

        const mailOptions = {

            from:
                `"Djezzy" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html: emailHtml
        };


        console.log(
            "Sending email through Gmail SMTP..."
        );


        const info =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            "EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            "Recipient:",
            to
        );

        console.log(
            "Message ID:",
            info.messageId
        );

        console.log(
            "Accepted:",
            info.accepted
        );

        console.log(
            "Rejected:",
            info.rejected
        );

        console.log(
            "Response:",
            info.response
        );

        console.log(
            "----------------------------------------------"
        );


        return info;

    } catch (error) {

        console.error(
            "EMAIL SEND FAILED"
        );

        console.error(
            "Recipient:",
            to
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Command:",
            error.command
        );

        console.error(
            "Response:",
            error.response
        );

        console.error(
            "Response Code:",
            error.responseCode
        );

        console.error(
            "Full error:",
            error
        );

        console.error(
            "----------------------------------------------"
        );

        throw error;
    }
}


// ============================================================
// VERIFY ON SERVER START
// ============================================================

verifyEmailConnection();


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    sendCampaignEmail,
    verifyEmailConnection
};