const pool = require("../config/db");

async function getAuditLogs(req, res) {
    try {
        let {
            page = 1,
            limit = 20,
            search = "",
            action = "",
            entity = "",
            userId = "",
            startDate = "",
            endDate = ""
        } = req.query;

        page = Math.max(parseInt(page) || 1, 1);
        limit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

        const offset = (page - 1) * limit;

        const conditions = [];
        const values = [];

        // Search
        if (search.trim()) {
            values.push(`%${search.trim()}%`);
            const param = `$${values.length}`;

            conditions.push(`
                (
                    al.action ILIKE ${param}
                    OR al.entity ILIKE ${param}
                    OR CAST(al.entity_id AS TEXT) ILIKE ${param}
                    OR u.first_name ILIKE ${param}
                    OR u.last_name ILIKE ${param}
                    OR u.email ILIKE ${param}
                )
            `);
        }

        // Action filter
        if (action.trim()) {
            values.push(action.trim());
            conditions.push(`al.action = $${values.length}`);
        }

        // Entity filter
        if (entity.trim()) {
            values.push(entity.trim());
            conditions.push(`al.entity = $${values.length}`);
        }

        // User filter
        if (userId.trim()) {
            values.push(userId.trim());
            conditions.push(`al.user_id = $${values.length}`);
        }

        // Start date
        if (startDate.trim()) {
            values.push(startDate.trim());
            conditions.push(`al.created_at >= $${values.length}::date`);
        }

        // End date
        if (endDate.trim()) {
            values.push(endDate.trim());
            conditions.push(
                `al.created_at < ($${values.length}::date + INTERVAL '1 day')`
            );
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        // Total number of logs
        const countResult = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM audit_logs al
            LEFT JOIN users u
                ON u.id = al.user_id
            ${whereClause}
            `,
            values
        );

        const total = parseInt(countResult.rows[0].total, 10);

        const totalPages = Math.ceil(total / limit);

        // Pagination parameters
        const dataValues = [...values];

        dataValues.push(limit);
        const limitParam = `$${dataValues.length}`;

        dataValues.push(offset);
        const offsetParam = `$${dataValues.length}`;

        // Logs
        const logsResult = await pool.query(
            `
            SELECT
                al.id,
                al.user_id,
                al.action,
                al.entity,
                al.entity_id,
                al.ip_address,
                al.created_at,

                u.first_name,
                u.last_name,
                u.email,
                u.role

            FROM audit_logs al

            LEFT JOIN users u
                ON u.id = al.user_id

            ${whereClause}

            ORDER BY al.created_at DESC, al.id DESC

            LIMIT ${limitParam}
            OFFSET ${offsetParam}
            `,
            dataValues
        );

        res.json({
            logs: logsResult.rows,

            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error("GET AUDIT LOGS ERROR:", error);

        res.status(500).json({
            message: "Failed to retrieve audit logs."
        });
    }
}

module.exports = {
    getAuditLogs
};