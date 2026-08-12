
const pool = require("../config/db");
const crypto = require("crypto");
const { sendCampaignEmail } = require("../services/emailService");

const getCampaigns = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM campaigns
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {
        console.error("GET CAMPAIGNS ERROR:", err);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

const createCampaign = async (req, res) => {
    try {

        const {
            title,
            description,
            status,
            email_subject,
            email_template,
            start_date,
            end_date,
            recipient_criteria
        } = req.body;

        const created_by = req.user.id;

        const result = await pool.query(
            `
            INSERT INTO campaigns
            (
                title,
                description,
                status,
                email_subject,
                email_template,
                start_date,
                end_date,
                created_by,
                recipient_criteria
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
            `,
            [
                title,
                description,
                status || "draft",
                email_subject,
                email_template,
                start_date || null,
                end_date || null,
                created_by,
                recipient_criteria || "all"
            ]
        );

        await pool.query(
            `
            INSERT INTO notifications
            (title, message, type)
            VALUES ($1,$2,$3)
            `,
            [
                "Campaign Created",
                `Campaign "${title}" has been created successfully.`,
                "success"
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("CREATE CAMPAIGN ERROR:", err);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

const updateCampaign = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            title,
            description,
            status,
            email_subject,
            email_template,
            start_date,
            end_date,
            recipient_criteria
        } = req.body;

        const result = await pool.query(
            `
            UPDATE campaigns
            SET
                title = $1,
                description = $2,
                status = $3,
                email_subject = $4,
                email_template = $5,
                start_date = $6,
                end_date = $7,
                recipient_criteria = $8
            WHERE id = $9
            RETURNING *
            `,
            [
                title,
                description,
                status,
                email_subject,
                email_template,
                start_date || null,
                end_date || null,
                recipient_criteria || "all",
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        await pool.query(
            `
            INSERT INTO notifications
            (title, message, type)
            VALUES ($1,$2,$3)
            `,
            [
                "Campaign Updated",
                `Campaign "${title}" has been updated.`,
                "info"
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error("UPDATE CAMPAIGN ERROR:", err);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};

const deleteCampaign = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM campaigns
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        await pool.query(
            `
            INSERT INTO notifications
            (title, message, type)
            VALUES ($1,$2,$3)
            `,
            [
                "Campaign Deleted",
                `Campaign "${result.rows[0].title}" has been deleted.`,
                "warning"
            ]
        );

        res.json({
            message: "Campaign deleted successfully"
        });

    } catch (err) {
        console.error("DELETE CAMPAIGN ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const launchCampaign = async (req, res) => {
    try {

        const { id } = req.params;

        const campaignResult = await pool.query(
            `
            SELECT *
            FROM campaigns
            WHERE id = $1
            `,
            [id]
        );

        if (campaignResult.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        const campaign = campaignResult.rows[0];

        const criteria =
            campaign.recipient_criteria || "all";

        let recipientQuery = `
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                segment
            FROM recipients
            WHERE email IS NOT NULL
            AND email <> ''
        `;

        const recipientParams = [];

        if (criteria !== "all") {
            recipientQuery += `
                AND segment = $1
            `;

            recipientParams.push(criteria);
        }

        const recipientsResult = await pool.query(
            recipientQuery,
            recipientParams
        );

        const recipients =
            recipientsResult.rows;

        if (recipients.length === 0) {
            return res.status(400).json({
                message:
                    "No recipients match this campaign.",
                criteria
            });
        }

        if (!campaign.email_subject) {
            return res.status(400).json({
                message:
                    "Campaign email subject is missing."
            });
        }

        if (!campaign.email_template) {
            return res.status(400).json({
                message:
                    "Campaign email template is missing."
            });
        }

        let sent = 0;
        let failed = 0;

        const failedRecipients = [];

        for (const recipient of recipients) {

            const uniqueToken =
                crypto.randomBytes(32).toString("hex");

            const recipientResult =
                await pool.query(
                    `
                    INSERT INTO campaign_recipients
                    (
                        campaign_id,
                        recipient_id,
                        unique_token,
                        email_sent,
                        email_sent_at
                    )
                    VALUES
                    ($1,$2,$3,false,NULL)
                    ON CONFLICT (
                        campaign_id,
                        recipient_id
                    )
                    DO UPDATE SET
                        unique_token = EXCLUDED.unique_token,
                        email_sent = false,
                        email_sent_at = NULL,
                        email_opened = false,
                        email_opened_at = NULL,
                        survey_completed = false,
                        survey_completed_at = NULL
                    RETURNING *
                    `,
                    [
                        campaign.id,
                        recipient.id,
                        uniqueToken
                    ]
                );

            const campaignRecipient =
                recipientResult.rows[0];

            try {

                const baseUrl =
                    process.env.APP_URL ||
                    `http://localhost:${process.env.PORT}`;

                const surveyUrl =
                    `${baseUrl}/survey.html?token=${uniqueToken}`;

                const trackingUrl =
                    `${baseUrl}/api/campaigns/track/open/${uniqueToken}`;

                const emailHtml = `
                    ${campaign.email_template}

                    <div style="margin-top:30px;text-align:center;">
                        <a
                            href="${surveyUrl}"
                            style="
                                display:inline-block;
                                padding:12px 24px;
                                background:#e30613;
                                color:#ffffff;
                                text-decoration:none;
                                border-radius:6px;
                                font-family:Arial,sans-serif;
                            "
                        >
                            Complete the questionnaire
                        </a>
                    </div>

                    <img
                        src="${trackingUrl}"
                        width="1"
                        height="1"
                        style="display:none;"
                        alt=""
                    >
                `;

                await sendCampaignEmail(
                    recipient.email,
                    campaign.email_subject,
                    emailHtml
                );

                await pool.query(
                    `
                    UPDATE campaign_recipients
                    SET
                        email_sent = true,
                        email_sent_at = NOW()
                    WHERE id = $1
                    `,
                    [campaignRecipient.id]
                );

                sent++;

                console.log(
                    `Email sent to ${recipient.email}`
                );

            } catch (emailError) {

                failed++;

                failedRecipients.push({
                    email: recipient.email,
                    error: emailError.message
                });

                console.error(
                    `Failed to send to ${recipient.email}:`,
                    emailError
                );

                await pool.query(
                    `
                    UPDATE campaign_recipients
                    SET
                        email_sent = false,
                        email_sent_at = NULL
                    WHERE id = $1
                    `,
                    [campaignRecipient.id]
                );
            }
        }

        if (sent > 0) {

            await pool.query(
                `
                UPDATE campaigns
                SET status = 'sent'
                WHERE id = $1
                `,
                [id]
            );
        }

        await pool.query(
            `
            INSERT INTO notifications
            (title, message, type)
            VALUES ($1,$2,$3)
            `,
            [
                "Campaign Sent",
                `Campaign "${campaign.title}" sent to ${sent} recipient(s).`,
                sent > 0 ? "success" : "error"
            ]
        );

        res.json({
            message:
                "Campaign launch completed.",
            campaign_id:
                campaign.id,
            campaign_title:
                campaign.title,
            criteria,
            total_recipients:
                recipients.length,
            sent,
            failed,
            failed_recipients:
                failedRecipients
        });

    } catch (err) {

        console.error(
            "LAUNCH CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message:
                "Unable to launch campaign.",
            error:
                err.message
        });
    }
};

const trackEmailOpen = async (req, res) => {

    try {

        const { token } = req.params;

        await pool.query(
            `
            UPDATE campaign_recipients
            SET
                email_opened = true,
                email_opened_at =
                    COALESCE(email_opened_at, NOW())
            WHERE unique_token = $1
            `,
            [token]
        );

        const pixel = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            "base64"
        );

        res.set({
            "Content-Type": "image/png",
            "Content-Length": pixel.length,
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
        });

        res.end(pixel);

    } catch (err) {

        console.error(
            "TRACK EMAIL OPEN ERROR:",
            err
        );

        res.status(500).end();
    }
};

const getNotifications = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT *
            FROM notifications
            ORDER BY created_at DESC
            LIMIT 20
        `);

        res.json(result.rows);

    } catch (err) {

        console.error("GET NOTIFICATIONS ERROR:", err);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    trackEmailOpen,
    getNotifications
};

