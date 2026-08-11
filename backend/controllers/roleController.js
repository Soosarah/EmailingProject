const roleModel = require("../models/roleModel");

// ===============================
// GET /api/roles
// ===============================

async function getRoles(req, res) {

    try {

        const roles = await roleModel.getRoles();

        res.json(roles);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

// ===============================
// GET /api/permissions
// ===============================

async function getPermissions(req, res) {

    try {

        const permissions = await roleModel.getPermissions();

        res.json(permissions);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

// ===============================
// GET /api/roles/:id/permissions
// ===============================

async function getRolePermissions(req, res) {

    try {

        const permissions = await roleModel.getRolePermissions(req.params.id);

        res.json(permissions);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}

// ===============================
// PUT /api/roles/:id/permissions
// ===============================

async function updateRolePermissions(req, res) {

    try {

        await roleModel.updateRolePermissions(

            req.params.id,

            req.body.permissions

        );

        res.json({
            message: "Permissions mises à jour."
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur."
        });

    }

}
const updatePermissions = async (req, res) => {

    const roleId = req.params.id;
    const permissions = req.body.permissions;

    try {

        await pool.query(
            "DELETE FROM role_permissions WHERE role_id=$1",
            [roleId]
        );

        for(const permissionId of permissions){

            await pool.query(
                `INSERT INTO role_permissions(role_id,permission_id)
                 VALUES($1,$2)`,
                [roleId, permissionId]
            );

        }

        res.json({
            message:"Permissions mises à jour."
        });

    }

    catch(err){

        console.error(err);

        res.status(500).json({
            message:"Erreur serveur"
        });

    }

};
module.exports = {

    getRoles,
    getPermissions,
    getRolePermissions,
    updateRolePermissions,
    updatePermissions

};