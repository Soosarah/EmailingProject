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
            DATE(completed_at) AS day,
            COUNT(*) AS total
        FROM responses
        WHERE completed_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(completed_at)
        ORDER BY day;
    `;

    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    getDashboardStats,
    getActiveCampaigns,
    getRecentActivity,
    getResponsesLast7Days
};