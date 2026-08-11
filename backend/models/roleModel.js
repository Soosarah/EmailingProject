const pool = require("../config/db");

async function getRoles() {

    const result = await pool.query(
        "SELECT * FROM roles ORDER BY id"
    );

    return result.rows;
}

async function getPermissions() {

    const result = await pool.query(
        "SELECT * FROM permissions ORDER BY id"
    );

    return result.rows;
}

async function getRolePermissions(roleId) {

    const result = await pool.query(

        `SELECT permission_id
         FROM role_permissions
         WHERE role_id=$1`,

        [roleId]

    );

    return result.rows;
}

async function updateRolePermissions(roleId, permissions) {

    await pool.query(

        "DELETE FROM role_permissions WHERE role_id=$1",

        [roleId]

    );

    for(const permissionId of permissions){

        await pool.query(

            `INSERT INTO role_permissions
            (role_id,permission_id)
            VALUES($1,$2)`,

            [roleId,permissionId]

        );

    }

}

module.exports = {

    getRoles,
    getPermissions,
    getRolePermissions,
    updateRolePermissions

};