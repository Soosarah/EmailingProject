const pool = require("../config/db");

exports.getAllPermissions = async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM permissions ORDER BY id"
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }

};