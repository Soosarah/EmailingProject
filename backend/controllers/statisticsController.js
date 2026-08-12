
const pool = require("../config/db");

const getStatistics = async (req, res) => {

    try {

        const campaignsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (
                    WHERE status = 'sent'
                )::int AS launched,
                COUNT(*) FILTER (
                    WHERE status = 'draft'
                )::int AS drafts,
                COUNT(*) FILTER (
                    WHERE status = 'scheduled'
                )::int AS scheduled
            FROM campaigns
        `);

        const recipientsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_recipients
            FROM recipients
            WHERE email IS NOT NULL
            AND email <> ''
        `);

        const deliveryResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total_campaign_recipients,
                COUNT(*) FILTER (
                    WHERE email_sent = true
                )::int AS emails_sent,
                COUNT(*) FILTER (
                    WHERE email_opened = true
                )::int AS emails_opened,
                COUNT(*) FILTER (
                    WHERE email_sent = true
                    AND email_opened = false
                )::int AS emails_ignored,
                COUNT(*) FILTER (
                    WHERE survey_completed = true
                )::int AS surveys_completed
            FROM campaign_recipients
        `);

        const performanceResult = await pool.query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE email_sent = true
                )::int AS sent,
                COUNT(*) FILTER (
                    WHERE email_sent = true
                    AND email_opened = true
                )::int AS opened,
                COUNT(*) FILTER (
                    WHERE survey_completed = true
                )::int AS completed
            FROM campaign_recipients
        `);

        const performance =
            performanceResult.rows[0];

        const sent =
            Number(performance.sent);

        const opened =
            Number(performance.opened);

        const completed =
            Number(performance.completed);

        const openRate =
            sent > 0
                ? Number(((opened / sent) * 100).toFixed(2))
                : 0;

        const responseRate =
            sent > 0
                ? Number(((completed / sent) * 100).toFixed(2))
                : 0;

        const campaignPerformanceResult =
            await pool.query(`
                SELECT
                    c.id,
                    c.title,
                    c.status,
                    COUNT(cr.id)::int AS recipients,
                    COUNT(cr.id) FILTER (
                        WHERE cr.email_sent = true
                    )::int AS sent,
                    COUNT(cr.id) FILTER (
                        WHERE cr.email_opened = true
                    )::int AS opened,
                    COUNT(cr.id) FILTER (
                        WHERE cr.survey_completed = true
                    )::int AS responses
                FROM campaigns c
                LEFT JOIN campaign_recipients cr
                    ON cr.campaign_id = c.id
                GROUP BY
                    c.id,
                    c.title,
                    c.status
                ORDER BY c.created_at DESC
            `);

        const campaigns =
            campaignPerformanceResult.rows.map(
                campaign => {

                    const campaignSent =
                        Number(campaign.sent);

                    const campaignOpened =
                        Number(campaign.opened);

                    const campaignResponses =
                        Number(campaign.responses);

                    return {
                        ...campaign,

                        open_rate:
                            campaignSent > 0
                                ? Number(
                                    (
                                        campaignOpened /
                                        campaignSent *
                                        100
                                    ).toFixed(2)
                                )
                                : 0,

                        response_rate:
                            campaignSent > 0
                                ? Number(
                                    (
                                        campaignResponses /
                                        campaignSent *
                                        100
                                    ).toFixed(2)
                                )
                                : 0
                    };
                }
            );

        res.json({

            campaigns: campaignsResult.rows[0],

            recipients:
                recipientsResult.rows[0],

            delivery:
                deliveryResult.rows[0],

            performance: {
                sent,
                opened,
                completed,
                open_rate: openRate,
                response_rate: responseRate
            },

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
                "Unable to load statistics."
        });

    }

};

module.exports = {
    getStatistics
};

