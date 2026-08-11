const pool = require("../config/db");

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

        console.error(err);

        res.status(500).json({
            message: "Server error"
        });

    }
};

module.exports = {
    getNotifications
};