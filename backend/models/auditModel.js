const pool = require("../config/db");

async function addLog(userId, action, entity, entityId = null, ip = null) {

    const query = `
        INSERT INTO audit_logs
        (user_id, action, entity, entity_id, ip_address)
        VALUES ($1,$2,$3,$4,$5)
    `;

    await pool.query(query, [
        userId,
        action,
        entity,
        entityId,
        ip
    ]);
}

module.exports = {
    addLog
};