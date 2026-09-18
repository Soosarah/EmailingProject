const pool = require("../config/db");

const getStatistics = async (req, res) => {
    try {

        // ============================================================
        // CAMPAIGNS
        // ============================================================

        const campaignsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total,

                COUNT(*) FILTER (
                    WHERE status = 'sending'
                       OR status = 'sent'
                       OR status = 'completed'
                )::int AS launched,

                COUNT(*) FILTER (
                    WHERE status = 'draft'
                )::int AS drafts,

                COUNT(*) FILTER (
                    WHERE status = 'scheduled'
                )::int AS scheduled,

                COUNT(*) FILTER (
                    WHERE status = 'sending'
                )::int AS currently_sending,

                COUNT(*) FILTER (
                    WHERE status = 'completed'
                )::int AS completed

            FROM campaigns
        `);


        // ============================================================
        // TOTAL RECIPIENTS
        // ============================================================

        const recipientsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_recipients
            FROM recipients
            WHERE email IS NOT NULL
              AND TRIM(email) <> ''
        `);


        // ============================================================
        // EMAIL DELIVERY
        //
        // send_status:
        // pending = not processed yet
        // sent    = email successfully sent
        // failed  = email failed
        //
        // Email opened will be added in the next step.
        // ============================================================

        const deliveryResult = await pool.query(`
            SELECT

                COUNT(*)::int
                    AS total_campaign_recipients,

                COUNT(*) FILTER (
                    WHERE send_status = 'sent'
                )::int
                    AS emails_sent,

                COUNT(*) FILTER (
                    WHERE send_status = 'failed'
                )::int
                    AS emails_failed,

                COUNT(*) FILTER (
                    WHERE send_status = 'pending'
                )::int
                    AS emails_pending

            FROM campaign_recipients
        `);


        const delivery = deliveryResult.rows[0];

        const emailsSent =
            Number(delivery.emails_sent || 0);

        const emailsFailed =
            Number(delivery.emails_failed || 0);

        const emailsPending =
            Number(delivery.emails_pending || 0);


        // ============================================================
        // OPEN / RESPONSE STATISTICS
        //
        // These values will become real once the tracking columns
        // are added in the next step.
        //
        // For now we safely return 0 instead of querying columns
        // that do not exist.
        // ============================================================

        const performance = {
            sent: emailsSent,
            opened: 0,
            ignored: 0,
            completed: 0,
            failed: emailsFailed,
            pending: emailsPending,
            open_rate: 0,
            response_rate: 0,
            engagement_rate: 0
        };


        // ============================================================
        // CAMPAIGN PERFORMANCE
        // ============================================================

        const campaignPerformanceResult =
            await pool.query(`
                SELECT
                    c.id,
                    c.title,
                    c.status,

                    COUNT(cr.id)::int
                        AS recipients,

                    COUNT(cr.id) FILTER (
                        WHERE cr.send_status = 'sent'
                    )::int
                        AS sent,

                    COUNT(cr.id) FILTER (
                        WHERE cr.send_status = 'failed'
                    )::int
                        AS failed,

                    COUNT(cr.id) FILTER (
                        WHERE cr.send_status = 'pending'
                    )::int
                        AS pending

                FROM campaigns c

                LEFT JOIN campaign_recipients cr
                    ON cr.campaign_id = c.id

                GROUP BY
                    c.id,
                    c.title,
                    c.status,
                    c.created_at

                ORDER BY
                    c.created_at DESC
            `);


        const campaigns =
            campaignPerformanceResult.rows.map(
                campaign => {

                    const campaignRecipients =
                        Number(
                            campaign.recipients || 0
                        );

                    const campaignSent =
                        Number(
                            campaign.sent || 0
                        );

                    const campaignFailed =
                        Number(
                            campaign.failed || 0
                        );

                    const campaignPending =
                        Number(
                            campaign.pending || 0
                        );


                    return {

                        id: campaign.id,

                        title:
                            campaign.title || "Untitled campaign",

                        status:
                            campaign.status || "unknown",

                        recipients:
                            campaignRecipients,

                        sent:
                            campaignSent,

                        failed:
                            campaignFailed,

                        pending:
                            campaignPending,

                        // These will be populated once
                        // open tracking is connected.

                        opened: 0,

                        ignored: 0,

                        responses: 0,

                        open_rate: 0,

                        response_rate: 0,

                        engagement_rate: 0

                    };

                }
            );


        // ============================================================
        // RESPONSE
        // ============================================================

        res.json({

            campaigns:
                campaignsResult.rows[0],

            recipients:
                recipientsResult.rows[0],

            delivery: {

                ...delivery,

                emails_sent:
                    emailsSent,

                emails_failed:
                    emailsFailed,

                emails_pending:
                    emailsPending,

                emails_opened:
                    0,

                emails_ignored:
                    0,

                surveys_completed:
                    0

            },

            performance,

            campaign_performance:
                campaigns

        });


    } catch (error) {

        console.error(
            "STATISTICS ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load statistics.",

            error:
                error.message

        });

    }
};


module.exports = {
    getStatistics
};