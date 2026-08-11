const pool = require("../config/db");

// ======================================
// Tous les utilisateurs
// ======================================

async function getAllUsers() {

    const result = await pool.query(`

        SELECT

            id,
            first_name,
            last_name,
            email,
            role,
            status,
            created_at

        FROM users

        ORDER BY created_at DESC

    `);

    return result.rows;

}


// ======================================
// Statistiques
// ======================================

async function getStats() {

    const result = await pool.query(`

        SELECT

            COUNT(*)::int AS total,

            COUNT(*) FILTER (
                WHERE status='ACTIVE'
            )::int AS active,

            COUNT(*) FILTER (
                WHERE role='ADMIN'
            )::int AS admins,

            COUNT(*) FILTER (
                WHERE DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW())
            )::int AS new

        FROM users

    `);

    return result.rows[0];

}


// ======================================
// Ajouter
// ======================================

async function create(user) {

    const result = await pool.query(

        `

        INSERT INTO users(

            first_name,
            last_name,
            email,
            password_hash,
            role,
            status

        )

        VALUES($1,$2,$3,$4,$5,$6)

        RETURNING *

        `,

        [

            user.first_name,

            user.last_name,

            user.email,

            user.password_hash,

            user.role,

            user.status || "ACTIVE"

        ]

    );

    return result.rows[0];

}


// ======================================
// Modifier
// ======================================

async function update(id,user){

    const result = await pool.query(

        `

        UPDATE users

        SET

            first_name=$1,

            last_name=$2,

            email=$3,

            role=$4,

            status=$5,

            updated_at=NOW()

        WHERE id=$6

        RETURNING *

        `,

        [

            user.first_name,

            user.last_name,

            user.email,

            user.role,

            user.status,

            id

        ]

    );

    return result.rows[0];

}


// ======================================
// Supprimer
// ======================================

async function remove(id){

    await pool.query(

        `

        DELETE FROM users

        WHERE id=$1

        `,

        [id]

    );

}


module.exports={

    getAllUsers,

    getStats,

    create,

    update,

    remove

};