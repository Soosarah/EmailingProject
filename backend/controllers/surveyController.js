const pool = require("../config/db");


// =====================================================
// GET ALL SURVEYS
// =====================================================

async function getSurveys(req, res) {

    try {

        const user = req.user;

        let result;


        // ADMIN voit tout
        if (user.role === "ADMIN") {

            result = await pool.query(`

                SELECT
                    s.id,
                    s.campaign_id,
                    s.title,
                    s.survey_json,
                    s.created_at,
                    s.updated_at

                FROM surveys s

                ORDER BY s.created_at DESC

            `);

        }

        else {

            // MARKETING voit uniquement
            // les questionnaires de ses campagnes

            result = await pool.query(`

                SELECT
                    s.id,
                    s.campaign_id,
                    s.title,
                    s.survey_json,
                    s.created_at,
                    s.updated_at

                FROM surveys s

                INNER JOIN campaigns c
                    ON c.id = s.campaign_id

                WHERE c.created_by = $1

                ORDER BY s.created_at DESC

            `, [
                user.id
            ]);

        }


        res.json(result.rows);

    }

    catch (error) {

        console.error(
            "GET SURVEYS ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Erreur lors du chargement des questionnaires."

        });

    }

}


// =====================================================
// GET ONE SURVEY
// =====================================================

async function getSurvey(req, res) {

    try {

        const user = req.user;

        const surveyId =
            Number(req.params.id);


        let result;


        if (user.role === "ADMIN") {

            result = await pool.query(`

                SELECT
                    s.*

                FROM surveys s

                WHERE s.id = $1

            `, [
                surveyId
            ]);

        }

        else {

            result = await pool.query(`

                SELECT
                    s.*

                FROM surveys s

                INNER JOIN campaigns c
                    ON c.id = s.campaign_id

                WHERE
                    s.id = $1
                    AND c.created_by = $2

            `, [
                surveyId,
                user.id
            ]);

        }


        if (!result.rows.length) {

            return res.status(404).json({

                message:
                    "Questionnaire introuvable."

            });

        }


        res.json(
            result.rows[0]
        );

    }

    catch (error) {

        console.error(
            "GET SURVEY ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Erreur serveur."

        });

    }

}


// =====================================================
// CREATE SURVEY
// =====================================================

async function createSurvey(req, res) {

    try {

        const user = req.user;

        const {
            campaign_id,
            title,
            survey_json
        } = req.body;


        if (!campaign_id) {

            return res.status(400).json({

                message:
                    "La campagne est obligatoire."

            });

        }


        if (!title || !title.trim()) {

            return res.status(400).json({

                message:
                    "Le titre est obligatoire."

            });

        }


        if (!survey_json) {

            return res.status(400).json({

                message:
                    "La structure du questionnaire est obligatoire."

            });

        }


        // Vérifier que la campagne
        // appartient au marketing connecté

        let campaign;


        if (user.role === "ADMIN") {

            campaign =
                await pool.query(`

                    SELECT id

                    FROM campaigns

                    WHERE id = $1

                `, [
                    campaign_id
                ]);

        }

        else {

            campaign =
                await pool.query(`

                    SELECT id

                    FROM campaigns

                    WHERE
                        id = $1
                        AND created_by = $2

                `, [
                    campaign_id,
                    user.id
                ]);

        }


        if (!campaign.rows.length) {

            return res.status(403).json({

                message:
                    "Vous ne pouvez pas utiliser cette campagne."

            });

        }


        const result =
            await pool.query(`

                INSERT INTO surveys
                (
                    campaign_id,
                    title,
                    survey_json
                )

                VALUES
                (
                    $1,
                    $2,
                    $3
                )

                RETURNING *

            `, [
                campaign_id,
                title.trim(),
                survey_json
            ]);


        res.status(201).json(
            result.rows[0]
        );

    }

    catch (error) {

        console.error(
            "CREATE SURVEY ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Erreur lors de la création du questionnaire."

        });

    }

}


// =====================================================
// UPDATE SURVEY
// =====================================================

async function updateSurvey(req, res) {

    try {

        const user = req.user;

        const surveyId =
            Number(req.params.id);

        const {
            title,
            survey_json
        } = req.body;


        let result;


        if (user.role === "ADMIN") {

            result =
                await pool.query(`

                    UPDATE surveys

                    SET
                        title = $1,
                        survey_json = $2,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $3

                    RETURNING *

                `, [
                    title,
                    survey_json,
                    surveyId
                ]);

        }

        else {

            result =
                await pool.query(`

                    UPDATE surveys s

                    SET
                        title = $1,
                        survey_json = $2,
                        updated_at = CURRENT_TIMESTAMP

                    FROM campaigns c

                    WHERE
                        s.id = $3
                        AND s.campaign_id = c.id
                        AND c.created_by = $4

                    RETURNING s.*

                `, [
                    title,
                    survey_json,
                    surveyId,
                    user.id
                ]);

        }


        if (!result.rows.length) {

            return res.status(404).json({

                message:
                    "Questionnaire introuvable ou accès refusé."

            });

        }


        res.json(
            result.rows[0]
        );

    }

    catch (error) {

        console.error(
            "UPDATE SURVEY ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Erreur lors de la modification."

        });

    }

}


// =====================================================
// DELETE SURVEY
// =====================================================

async function deleteSurvey(req, res) {

    try {

        const user = req.user;

        const surveyId =
            Number(req.params.id);


        let result;


        if (user.role === "ADMIN") {

            result =
                await pool.query(`

                    DELETE FROM surveys

                    WHERE id = $1

                    RETURNING id

                `, [
                    surveyId
                ]);

        }

        else {

            result =
                await pool.query(`

                    DELETE FROM surveys s

                    USING campaigns c

                    WHERE
                        s.id = $1
                        AND s.campaign_id = c.id
                        AND c.created_by = $2

                    RETURNING s.id

                `, [
                    surveyId,
                    user.id
                ]);

        }


        if (!result.rows.length) {

            return res.status(404).json({

                message:
                    "Questionnaire introuvable ou accès refusé."

            });

        }


        res.json({

            message:
                "Questionnaire supprimé."

        });

    }

    catch (error) {

        console.error(
            "DELETE SURVEY ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Erreur lors de la suppression."

        });

    }

}


module.exports = {

    getSurveys,

    getSurvey,

    createSurvey,

    updateSurvey,

    deleteSurvey

};