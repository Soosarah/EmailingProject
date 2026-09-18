const pool = require("../config/db");

async function getDashboardStats() {
    const campaigns = await pool.query("SELECT COUNT(*) FROM campaigns");
    const surveys = await pool.query("SELECT COUNT(*) FROM surveys");
    const recipients = await pool.query("SELECT COUNT(*) FROM recipients");
    const responses = await pool.query("SELECT COUNT(*) FROM responses");
    const users = await pool.query("SELECT COUNT(*) FROM users");

    return {
        campaigns: Number(campaigns.rows[0].count),
        surveys: Number(surveys.rows[0].count),
        recipients: Number(recipients.rows[0].count),
        responses: Number(responses.rows[0].count),
        users: Number(users.rows[0].count)
    };
}
async function getActiveCampaigns() {
    const result = await pool.query(`
        SELECT
            id,
            title,
            status,
            created_at
        FROM campaigns
        ORDER BY created_at DESC
        LIMIT 5
    `);

    return result.rows;
}
async function getRecentActivity() {

    const result = await pool.query(`
        SELECT
            r.first_name,
            r.last_name,
            c.title,
            cr.survey_completed,
            cr.survey_completed_at
        FROM campaign_recipients cr
        JOIN recipients r ON cr.recipient_id = r.id
        JOIN campaigns c ON cr.campaign_id = c.id
        ORDER BY cr.survey_completed_at DESC NULLS LAST
        LIMIT 5
    `);

    return result.rows;
}

async function getResponsesLast7Days() {

    const query = `
        SELECT
            d::date AS day,
            COUNT(cr.id)::integer AS total
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        ) AS d
        LEFT JOIN campaign_recipients cr
            ON cr.survey_completed_at IS NOT NULL
            AND cr.survey_completed_at::date = d::date
        GROUP BY d
        ORDER BY d;
    `;

    const result = await pool.query(query);

    return result.rows;
}

async function getTodayStats() {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*)
             FROM campaign_recipients
             WHERE DATE(email_sent_at) = CURRENT_DATE) AS emails_today,

            (SELECT COUNT(*)
             FROM campaign_recipients
             WHERE DATE(survey_completed_at) = CURRENT_DATE) AS responses_today,

            (SELECT COUNT(*)
             FROM recipients
             WHERE DATE(created_at) = CURRENT_DATE) AS recipients_today
    `);

    return result.rows[0];
}
async function getEvolutionStats() {

    const result = await pool.query(`

        SELECT

        (
            SELECT COUNT(*)
            FROM campaigns
            WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
        ) AS campaigns_week,

        (
            SELECT COUNT(*)
            FROM campaigns
            WHERE DATE(created_at)
            BETWEEN CURRENT_DATE - INTERVAL '14 days'
            AND CURRENT_DATE - INTERVAL '8 days'
        ) AS campaigns_last_week,

        (
            SELECT COUNT(*)
            FROM campaign_recipients
            WHERE DATE(email_sent_at) >= CURRENT_DATE - INTERVAL '7 days'
        ) AS emails_week,

        (
            SELECT COUNT(*)
            FROM campaign_recipients
            WHERE DATE(email_sent_at)
            BETWEEN CURRENT_DATE - INTERVAL '14 days'
            AND CURRENT_DATE - INTERVAL '8 days'
        ) AS emails_last_week,

        (
            SELECT COUNT(*)
            FROM campaign_recipients
            WHERE DATE(survey_completed_at) >= CURRENT_DATE - INTERVAL '7 days'
        ) AS responses_week,

        (
            SELECT COUNT(*)
            FROM campaign_recipients
            WHERE DATE(survey_completed_at)
            BETWEEN CURRENT_DATE - INTERVAL '14 days'
            AND CURRENT_DATE - INTERVAL '8 days'
        ) AS responses_last_week,

        (
            SELECT COUNT(*)
            FROM recipients
            WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days'
        ) AS recipients_week,

        (
            SELECT COUNT(*)
            FROM recipients
            WHERE DATE(created_at)
            BETWEEN CURRENT_DATE - INTERVAL '14 days'
            AND CURRENT_DATE - INTERVAL '8 days'
        ) AS recipients_last_week

    `);

    return result.rows[0];
}
async function searchDashboard(keyword) {

    const result = await pool.query(
        `
        SELECT
            'recipient' AS type,
            id,
            first_name || ' ' || last_name AS title,
            email AS subtitle
        FROM recipients
        WHERE
            first_name ILIKE $1
            OR last_name ILIKE $1
            OR email ILIKE $1

        UNION ALL

        SELECT
            'campaign' AS type,
            id,
            title,
            status AS subtitle
        FROM campaigns
        WHERE
            title ILIKE $1

        UNION ALL

        SELECT
            'survey' AS type,
            id,
            title,
            'Questionnaire' AS subtitle
        FROM surveys
        WHERE
            title ILIKE $1

        UNION ALL

        SELECT
            'template' AS type,
            id,
            name AS title,
            subject AS subtitle
        FROM email_templates
        WHERE
            name ILIKE $1
            OR subject ILIKE $1

        UNION ALL

        SELECT
            'user' AS type,
            id,
            first_name || ' ' || last_name AS title,
            email AS subtitle
        FROM users
        WHERE
            first_name ILIKE $1
            OR last_name ILIKE $1
            OR email ILIKE $1

        LIMIT 10
        `,
        [`%${keyword}%`]
    );

    return result.rows;
}
module.exports = {
    getDashboardStats,
    getActiveCampaigns,
    getRecentActivity,
    getResponsesLast7Days,
    getTodayStats,
    getEvolutionStats,
    searchDashboard
};
