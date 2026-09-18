const pool = require("../config/db");
const { sendCampaignEmail } = require("../services/emailService");

const fs = require("fs");
const csv = require("csv-parser");
const crypto = require("crypto");


// ============================================================
// HELPERS
// ============================================================

const isValidEmail = (email) => {
    if (!email || typeof email !== "string") {
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(
        email.trim().toLowerCase()
    );
};


const cleanEmail = (email) => {
    return email
        .trim()
        .toLowerCase();
};


// ============================================================
// GET CAMPAIGNS
// ============================================================

const getCampaigns = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT *
            FROM campaigns
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error(
            "GET CAMPAIGNS ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// CREATE CAMPAIGN
// ============================================================

const createCampaign = async (req, res) => {
    try {

        const {
            title,
            description,
            status,
            email_subject,
            email_template,
            start_date,
            end_date,
            recipient_criteria,
            cadence_mode,
            cadence_amount,
            cadence_unit
        } = req.body;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!title || !title.trim()) {

            return res.status(400).json({
                message: "Campaign title is required."
            });
        }


        if (!email_subject || !email_subject.trim()) {

            return res.status(400).json({
                message: "Email subject is required."
            });
        }


        if (!email_template || !email_template.trim()) {

            return res.status(400).json({
                message: "Email template is required."
            });
        }


        const created_by = req.user.id;


        const criteria =
            recipient_criteria || "all";


        // --------------------------------------------------------
        // CADENCE
        // --------------------------------------------------------
        // Default is "immediate" (same behavior as before cadence
        // existed). "controlled" requires an amount + unit, both of
        // which are validated on the frontend, but we defensively
        // fall back to null/immediate here too if they're missing.

        const resolvedCadenceMode =
            cadence_mode === "controlled" ? "controlled" : "immediate";

        const resolvedCadenceAmount =
            resolvedCadenceMode === "controlled"
                ? (Number.isFinite(Number(cadence_amount)) ? Number(cadence_amount) : null)
                : null;

        const resolvedCadenceUnit =
            resolvedCadenceMode === "controlled"
                ? (cadence_unit || null)
                : null;

        if (
            resolvedCadenceMode === "controlled" &&
            (!resolvedCadenceAmount || resolvedCadenceAmount <= 0 || !resolvedCadenceUnit)
        ) {

            return res.status(400).json({
                message: "Please provide a valid cadence amount and unit for controlled sending."
            });
        }


        // --------------------------------------------------------
        // CREATE CAMPAIGN
        // --------------------------------------------------------

        const result = await pool.query(
            `
            INSERT INTO campaigns
            (
                title,
                description,
                status,
                email_subject,
                email_template,
                start_date,
                end_date,
                created_by,
                recipient_criteria,
                cadence_mode,
                cadence_amount,
                cadence_unit
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING *
            `,
            [
                title.trim(),
                description || null,
                status || "draft",
                email_subject.trim(),
                email_template,
                start_date || null,
                end_date || null,
                created_by,
                criteria,
                resolvedCadenceMode,
                resolvedCadenceAmount,
                resolvedCadenceUnit
            ]
        );


        // --------------------------------------------------------
        // NOTIFICATION
        // --------------------------------------------------------

        try {

            await pool.query(
                `
                INSERT INTO notifications
                (title, message, type)
                VALUES ($1,$2,$3)
                `,
                [
                    "Campaign Created",
                    `Campaign "${title}" has been created successfully.`,
                    "success"
                ]
            );

        } catch (notificationError) {

            console.warn(
                "CREATE CAMPAIGN NOTIFICATION ERROR:",
                notificationError.message
            );
        }


        res.status(201).json(
            result.rows[0]
        );

    } catch (err) {

        console.error(
            "CREATE CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// UPDATE CAMPAIGN
// ============================================================

const updateCampaign = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            title,
            description,
            status,
            email_subject,
            email_template,
            start_date,
            end_date,
            recipient_criteria,
            cadence_mode,
            cadence_amount,
            cadence_unit
        } = req.body;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!title || !title.trim()) {

            return res.status(400).json({
                message: "Campaign title is required."
            });
        }


        if (!email_subject || !email_subject.trim()) {

            return res.status(400).json({
                message: "Email subject is required."
            });
        }


        if (!email_template || !email_template.trim()) {

            return res.status(400).json({
                message: "Email template is required."
            });
        }


        // --------------------------------------------------------
        // CADENCE
        // --------------------------------------------------------

        const resolvedCadenceMode =
            cadence_mode === "controlled" ? "controlled" : "immediate";

        const resolvedCadenceAmount =
            resolvedCadenceMode === "controlled"
                ? (Number.isFinite(Number(cadence_amount)) ? Number(cadence_amount) : null)
                : null;

        const resolvedCadenceUnit =
            resolvedCadenceMode === "controlled"
                ? (cadence_unit || null)
                : null;

        if (
            resolvedCadenceMode === "controlled" &&
            (!resolvedCadenceAmount || resolvedCadenceAmount <= 0 || !resolvedCadenceUnit)
        ) {

            return res.status(400).json({
                message: "Please provide a valid cadence amount and unit for controlled sending."
            });
        }


        const result = await pool.query(
            `
            UPDATE campaigns
            SET
                title = $1,
                description = $2,
                status = $3,
                email_subject = $4,
                email_template = $5,
                start_date = $6,
                end_date = $7,
                recipient_criteria = $8,
                cadence_mode = $9,
                cadence_amount = $10,
                cadence_unit = $11
            WHERE id = $12
            RETURNING *
            `,
            [
                title.trim(),
                description || null,
                status || "draft",
                email_subject.trim(),
                email_template,
                start_date || null,
                end_date || null,
                recipient_criteria || "all",
                resolvedCadenceMode,
                resolvedCadenceAmount,
                resolvedCadenceUnit,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Campaign not found."
            });
        }


        // --------------------------------------------------------
        // NOTIFICATION
        // --------------------------------------------------------

        try {

            await pool.query(
                `
                INSERT INTO notifications
                (title, message, type)
                VALUES ($1,$2,$3)
                `,
                [
                    "Campaign Updated",
                    `Campaign "${title}" has been updated.`,
                    "info"
                ]
            );

        } catch (notificationError) {

            console.warn(
                "UPDATE CAMPAIGN NOTIFICATION ERROR:",
                notificationError.message
            );
        }


        res.json(
            result.rows[0]
        );

    } catch (err) {

        console.error(
            "UPDATE CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// DELETE CAMPAIGN
// ============================================================

const deleteCampaign = async (req, res) => {
    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM campaigns
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Campaign not found."
            });
        }


        // --------------------------------------------------------
        // NOTIFICATION
        // --------------------------------------------------------

        try {

            await pool.query(
                `
                INSERT INTO notifications
                (title, message, type)
                VALUES ($1,$2,$3)
                `,
                [
                    "Campaign Deleted",
                    `Campaign "${result.rows[0].title}" has been deleted.`,
                    "warning"
                ]
            );

        } catch (notificationError) {

            console.warn(
                "DELETE CAMPAIGN NOTIFICATION ERROR:",
                notificationError.message
            );
        }


        res.json({
            message: "Campaign deleted successfully."
        });

    } catch (err) {

        console.error(
            "DELETE CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};


// ============================================================
// IMPORT RECIPIENTS FROM CSV
// ============================================================

const importRecipients = async (req, res) => {

    let temporaryFilePath = null;

    try {

        const { id } = req.params;

        temporaryFilePath =
            req.file?.path || null;


        // --------------------------------------------------------
        // CHECK FILE
        // --------------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                message: "CSV file is required."
            });
        }


        // --------------------------------------------------------
        // CHECK CAMPAIGN
        // --------------------------------------------------------

        const campaignResult = await pool.query(
            `
            SELECT
                id,
                title,
                status
            FROM campaigns
            WHERE id = $1
            `,
            [id]
        );


        if (campaignResult.rows.length === 0) {

            return res.status(404).json({
                message: "Campaign not found."
            });
        }


        const campaign =
            campaignResult.rows[0];


        // Don't allow importing into an already sent campaign
        if (campaign.status === "sent") {

            return res.status(400).json({
                message:
                    "Recipients cannot be imported into an already sent campaign."
            });
        }


        // --------------------------------------------------------
        // READ CSV
        // --------------------------------------------------------

        const recipients = [];
        const errors = [];


        await new Promise((resolve, reject) => {

            fs.createReadStream(
                req.file.path
            )

                .pipe(csv())

                .on("data", (row) => {

                    // Support:
                    // email
                    // Email
                    // EMAIL
                    // e-mail
                    // E-mail
                    // E-MAIL

                    const email =
                        row.email ||
                        row.Email ||
                        row.EMAIL ||
                        row["e-mail"] ||
                        row["E-mail"] ||
                        row["E-MAIL"];


                    if (!email) {

                        errors.push(
                            "Missing email"
                        );

                        return;
                    }


                    const normalizedEmail =
                        cleanEmail(email);


                    if (!isValidEmail(normalizedEmail)) {

                        errors.push(
                            `Invalid email: ${normalizedEmail}`
                        );

                        return;
                    }


                    recipients.push(
                        normalizedEmail
                    );
                })

                .on("end", resolve)

                .on("error", reject);
        });


        // --------------------------------------------------------
        // DELETE TEMPORARY CSV
        // --------------------------------------------------------

        if (temporaryFilePath) {

            try {

                fs.unlinkSync(
                    temporaryFilePath
                );

                temporaryFilePath = null;

            } catch (fileError) {

                console.warn(
                    "Unable to delete temporary CSV:",
                    fileError.message
                );
            }
        }


        // --------------------------------------------------------
        // REMOVE DUPLICATES
        // --------------------------------------------------------

        const uniqueEmails = [
            ...new Set(recipients)
        ];


        console.log(
            "CSV IMPORT"
        );

        console.log(
            "Campaign:",
            campaign.title
        );

        console.log(
            "Valid emails:",
            uniqueEmails.length
        );

        console.log(
            "Invalid rows:",
            errors.length
        );


        if (uniqueEmails.length === 0) {

            return res.status(400).json({

                message:
                    "No valid email addresses found.",

                errors
            });
        }


        // --------------------------------------------------------
        // IMPORT / LINK RECIPIENTS
        // --------------------------------------------------------

        let newRecipients = 0;
        let linkedRecipients = 0;
        let alreadyLinked = 0;


        for (const email of uniqueEmails) {

            // ----------------------------------------------------
            // FIND EXISTING RECIPIENT
            // ----------------------------------------------------

            const recipientResult =
                await pool.query(
                    `
                    SELECT id
                    FROM recipients
                    WHERE LOWER(email) = LOWER($1)
                    LIMIT 1
                    `,
                    [email]
                );


            let recipientId;


            // ----------------------------------------------------
            // CREATE RECIPIENT IF NECESSARY
            // ----------------------------------------------------

            if (
                recipientResult.rows.length === 0
            ) {

                const newRecipient =
                    await pool.query(
                        `
                        INSERT INTO recipients
                        (email)
                        VALUES ($1)
                        RETURNING id
                        `,
                        [email]
                    );


                recipientId =
                    newRecipient.rows[0].id;


                newRecipients++;

            } else {

                recipientId =
                    recipientResult.rows[0].id;
            }


            // ----------------------------------------------------
            // CHECK IF ALREADY LINKED
            // ----------------------------------------------------

            const existingLink =
                await pool.query(
                    `
                    SELECT campaign_id
                    FROM campaign_recipients
                    WHERE campaign_id = $1
                    AND recipient_id = $2
                    LIMIT 1
                    `,
                    [
                        id,
                        recipientId
                    ]
                );


            if (
                existingLink.rows.length > 0
            ) {

                alreadyLinked++;

                continue;
            }


            // ----------------------------------------------------
            // CREATE UNIQUE TOKEN
            // ----------------------------------------------------

            const uniqueToken =
                crypto.randomUUID();


            // ----------------------------------------------------
            // LINK RECIPIENT TO CAMPAIGN
            // ----------------------------------------------------

            await pool.query(
                `
                INSERT INTO campaign_recipients
                (
                    campaign_id,
                    recipient_id,
                    unique_token
                )
                VALUES
                ($1,$2,$3)
                `,
                [
                    id,
                    recipientId,
                    uniqueToken
                ]
            );


            linkedRecipients++;
        }


        // --------------------------------------------------------
        // MARK CAMPAIGN AS CSV CAMPAIGN
        // --------------------------------------------------------

        await pool.query(
            `
            UPDATE campaigns
            SET recipient_criteria = 'csv'
            WHERE id = $1
            `,
            [id]
        );


        // --------------------------------------------------------
        // NOTIFICATION
        // --------------------------------------------------------

        try {

            await pool.query(
                `
                INSERT INTO notifications
                (title, message, type)
                VALUES ($1,$2,$3)
                `,
                [
                    "Recipients Imported",

                    `${linkedRecipients} recipient(s) linked to campaign "${campaign.title}".`,

                    "success"
                ]
            );

        } catch (notificationError) {

            console.warn(
                "CSV NOTIFICATION ERROR:",
                notificationError.message
            );
        }


        // --------------------------------------------------------
        // RESPONSE
        // --------------------------------------------------------

        res.json({

            message:
                "CSV imported successfully.",

            campaign_id:
                id,

            total_found:
                uniqueEmails.length,

            new_recipients:
                newRecipients,

            linked:
                linkedRecipients,

            already_linked:
                alreadyLinked,

            invalid:
                errors.length,

            errors
        });


    } catch (err) {

        console.error(
            "IMPORT CSV ERROR:",
            err
        );


        // --------------------------------------------------------
        // CLEAN TEMPORARY FILE
        // --------------------------------------------------------

        if (temporaryFilePath) {

            try {

                fs.unlinkSync(
                    temporaryFilePath
                );

            } catch (fileError) {

                console.warn(
                    "CSV CLEANUP ERROR:",
                    fileError.message
                );
            }
        }


        res.status(500).json({

            message:
                "Unable to import CSV.",

            error:
                err.message
        });
    }
};


// ============================================================
// LAUNCH CAMPAIGN
// ============================================================
//
// IMPORTANT CHANGE FROM THE ORIGINAL VERSION:
// This endpoint used to send every email synchronously, inline,
// inside the HTTP request (looping over recipients and awaiting
// sendCampaignEmail() one by one). That does not scale to large
// recipient lists and cannot support a sending cadence (you cannot
// pace an HTTP request over hours).
//
// This endpoint now only QUEUES the campaign:
//   1. Validates the campaign is launchable.
//   2. Materializes campaign_recipients rows for "all"/segment
//      campaigns (CSV campaigns already have these rows from
//      importRecipients()).
//   3. Sets status = 'sending' and records total_recipients.
//   4. Returns immediately.
//
// The actual sending — including cadence, batching, and progress
// tracking — is performed by backend/services/cadenceWorker.js,
// which ticks in the background and calls the SAME
// sendCampaignEmail() from emailService.js that this file always
// used. Nothing about how an individual email is actually sent has
// changed.
//
// ============================================================

const launchCampaign = async (req, res) => {

    try {

        const { id } = req.params;


        console.log("");
        console.log(
            "=============================================="
        );
        console.log(
            "LAUNCH CAMPAIGN REQUEST"
        );
        console.log(
            "CAMPAIGN ID:",
            id
        );
        console.log(
            "=============================================="
        );


        // ========================================================
        // GET CAMPAIGN
        // ========================================================

        const campaignResult =
            await pool.query(
                `
                SELECT *
                FROM campaigns
                WHERE id = $1
                `,
                [id]
            );


        if (
            campaignResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Campaign not found."
            });
        }


        const campaign =
            campaignResult.rows[0];


        // ========================================================
        // PREVENT DUPLICATE LAUNCH
        // ========================================================
        //
        // "sent" is kept for backward compatibility with any
        // campaign that was launched under the old synchronous
        // flow before this change. "sending" and "completed" are
        // the new lifecycle states used by the cadence worker.

        if (
            ["sending", "completed", "sent"].includes(campaign.status)
        ) {

            return res.status(400).json({

                message:
                    "This campaign has already been launched.",

                campaign_id:
                    campaign.id,

                status:
                    campaign.status
            });
        }


        // ========================================================
        // RECIPIENT CRITERIA
        // ========================================================

        const criteria =
            campaign.recipient_criteria ||
            "all";


        console.log(
            "Campaign:",
            campaign.title
        );

        console.log(
            "Recipient criteria:",
            criteria
        );

        console.log(
            "Email subject:",
            campaign.email_subject
        );

        console.log(
            "Cadence mode:",
            campaign.cadence_mode
        );


        // ========================================================
        // VALIDATE EMAIL CONTENT BEFORE QUERYING RECIPIENTS
        // ========================================================

        if (
            !campaign.email_subject ||
            !campaign.email_subject.trim()
        ) {

            return res.status(400).json({
                message:
                    "Campaign email subject is missing."
            });
        }


        if (
            !campaign.email_template ||
            !campaign.email_template.trim()
        ) {

            return res.status(400).json({
                message:
                    "Campaign email template is missing."
            });
        }


        // ========================================================
        // MATERIALIZE campaign_recipients FOR "ALL" / SEGMENT
        // ========================================================
        //
        // CSV campaigns already have their campaign_recipients rows
        // created by importRecipients(). For "all" and segment
        // campaigns, we create them now so the cadence worker has a
        // single, uniform place to read pending recipients from
        // regardless of how they were selected.

        if (criteria !== "csv") {

            let selectQuery = `
                SELECT id
                FROM recipients
                WHERE email IS NOT NULL
                AND TRIM(email) <> ''
            `;

            const selectParams = [];

            if (criteria !== "all") {

                selectQuery += `
                    AND segment = $1
                `;

                selectParams.push(criteria);
            }

            const matchedRecipients =
                await pool.query(selectQuery, selectParams);

            for (const recipient of matchedRecipients.rows) {

                await pool.query(
                    `
                    INSERT INTO campaign_recipients
                    (campaign_id, recipient_id, unique_token)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (campaign_id, recipient_id) DO NOTHING
                    `,
                    [id, recipient.id, crypto.randomUUID()]
                );
            }
        }


        // ========================================================
        // COUNT PENDING RECIPIENTS
        // ========================================================

        const totalResult =
            await pool.query(
                `
                SELECT COUNT(*)::int AS total
                FROM campaign_recipients
                WHERE campaign_id = $1
                AND send_status = 'pending'
                `,
                [id]
            );

        const totalRecipients =
            totalResult.rows[0].total;

        console.log(
            `Pending recipients for campaign: ${totalRecipients}`
        );


        // ========================================================
        // NO RECIPIENTS
        // ========================================================

        if (totalRecipients === 0) {

            console.error(
                "No recipients found for this campaign."
            );

            return res.status(400).json({

                message:
                    "No recipients match this campaign.",

                criteria,

                total_recipients:
                    0
            });
        }


        // ========================================================
        // QUEUE CAMPAIGN FOR THE CADENCE WORKER
        // ========================================================

        await pool.query(
            `
            UPDATE campaigns
            SET
                status = 'sending',
                total_recipients = $2,
                sent_count = 0,
                failed_count = 0,
                started_at = NOW(),
                completed_at = NULL
            WHERE id = $1
            `,
            [id, totalRecipients]
        );


        // ========================================================
        // NOTIFICATION
        // ========================================================

        try {

            await pool.query(
                `
                INSERT INTO notifications
                (title, message, type)
                VALUES ($1,$2,$3)
                `,
                [
                    "Campaign Queued",
                    `Campaign "${campaign.title}" queued for ${totalRecipients} recipient(s).`,
                    "info"
                ]
            );

        } catch (notificationError) {

            console.warn(
                "LAUNCH NOTIFICATION ERROR:",
                notificationError.message
            );
        }


        // ========================================================
        // FINAL LOGS
        // ========================================================

        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            "CAMPAIGN QUEUED FOR SENDING"
        );

        console.log(
            "Campaign:",
            campaign.title
        );

        console.log(
            "Criteria:",
            criteria
        );

        console.log(
            "Total recipients:",
            totalRecipients
        );

        console.log(
            "Cadence mode:",
            campaign.cadence_mode
        );

        console.log(
            "=============================================="
        );

        console.log("");


        // ========================================================
        // RESPONSE
        // ========================================================

        res.json({

            message:
                "Campaign queued for sending.",

            campaign_id:
                campaign.id,

            campaign_title:
                campaign.title,

            criteria,

            total_recipients:
                totalRecipients,

            cadence_mode:
                campaign.cadence_mode,

            cadence_amount:
                campaign.cadence_amount,

            cadence_unit:
                campaign.cadence_unit
        });


    } catch (err) {

        console.error("");
        console.error(
            "=============================================="
        );

        console.error(
            "LAUNCH CAMPAIGN ERROR"
        );

        console.error(
            err
        );

        console.error(
            "=============================================="
        );


        res.status(500).json({

            message:
                "Unable to launch campaign.",

            error:
                err.message
        });
    }
};


// ============================================================
// GET CAMPAIGN PROGRESS
// ============================================================
//
// Polled by the frontend (e.g. every few seconds while a campaign's
// status is "sending") to show a live progress bar: sent, failed,
// remaining, percent complete, and estimated completion based on
// the campaign's cadence.

const getCampaignProgress = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                title,
                status,
                total_recipients,
                sent_count,
                failed_count,
                cadence_mode,
                cadence_amount,
                cadence_unit,
                started_at,
                completed_at
            FROM campaigns
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Campaign not found."
            });
        }

        const campaign = result.rows[0];

        const processed =
            campaign.sent_count + campaign.failed_count;

        const remaining =
            Math.max(campaign.total_recipients - processed, 0);

        const percent =
            campaign.total_recipients > 0
                ? Math.round((processed / campaign.total_recipients) * 100)
                : 0;

        res.json({
            ...campaign,
            remaining,
            percent
        });

    } catch (err) {

        console.error(
            "GET CAMPAIGN PROGRESS ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// PAUSE CAMPAIGN
// ============================================================
//
// The cadence worker only ever picks up campaigns with
// status = 'sending'. Flipping the status to 'paused' is enough to
// make the worker skip it on its next tick — no in-memory job to
// cancel, no extra bookkeeping required.

const pauseCampaign = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            UPDATE campaigns
            SET status = 'paused'
            WHERE id = $1
            AND status = 'sending'
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(400).json({
                message: "Campaign is not currently sending."
            });
        }

        res.json({
            message: "Campaign paused.",
            campaign: result.rows[0]
        });

    } catch (err) {

        console.error(
            "PAUSE CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// RESUME CAMPAIGN
// ============================================================

const resumeCampaign = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            UPDATE campaigns
            SET status = 'sending'
            WHERE id = $1
            AND status = 'paused'
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(400).json({
                message: "Campaign is not paused."
            });
        }

        res.json({
            message: "Campaign resumed.",
            campaign: result.rows[0]
        });

    } catch (err) {

        console.error(
            "RESUME CAMPAIGN ERROR:",
            err
        );

        res.status(500).json({
            message: "Erreur serveur",
            error: err.message
        });
    }
};


// ============================================================
// GET NOTIFICATIONS
// ============================================================

const getNotifications = async (req, res) => {

    try {

        const result =
            await pool.query(`
                SELECT *
                FROM notifications
                ORDER BY created_at DESC
                LIMIT 20
            `);


        res.json(
            result.rows
        );

    } catch (err) {

        console.error(
            "GET NOTIFICATIONS ERROR:",
            err
        );


        res.status(500).json({

            message:
                "Server error",

            error:
                err.message
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getCampaigns,

    createCampaign,

    updateCampaign,

    deleteCampaign,

    importRecipients,

    launchCampaign,

    getCampaignProgress,

    pauseCampaign,

    resumeCampaign,

    getNotifications
};