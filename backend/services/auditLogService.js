const pool = require("../config/db");

async function createAuditLog({
    userId = null,
    action,
    entity = null,
    entityId = null,
    ipAddress = null
}) {
    try {
        await pool.query(
            `
            INSERT INTO audit_logs (
                user_id,
                action,
                entity,
                entity_id,
                ip_address
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                userId,
                action,
                entity,
                entityId,
                ipAddress
            ]
        );
    } catch (error) {
        console.error("AUDIT LOG ERROR:", error.message);
    }
}

module.exports = {
    createAuditLog
};