const pool = require("../config/db");
const { sendCampaignEmail } = require("./emailService");

const TICK_MS = 1000;

const IMMEDIATE_BATCH_SIZE = 20; // Maximum emails processed concurrently per tick
const MAX_BATCH_SIZE = 50;       // Hard ceiling for controlled cadence

const UNIT_TO_MS = {
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000
};

// In-memory token buckets, one per actively sending campaign.
// Reset on server restart.
const rateState = new Map();

const isValidEmail = (email) =>
    !!email &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());


// ============================================================
// WORKER TICK
// ============================================================

async function tick() {
    try {
        const { rows: activeCampaigns } = await pool.query(
            `SELECT id, cadence_mode, cadence_amount, cadence_unit
             FROM campaigns
             WHERE status = 'sending'`
        );

        for (const campaign of activeCampaigns) {
            await processCampaignTick(campaign);
        }

    } catch (err) {
        console.error("CADENCE WORKER TICK ERROR:", err);
    }
}


// ============================================================
// PROCESS ONE CAMPAIGN
// ============================================================

async function processCampaignTick(campaign) {
    const {
        id,
        cadence_mode,
        cadence_amount,
        cadence_unit
    } = campaign;

    let batchSize;


    // --------------------------------------------------------
    // CONTROLLED CADENCE
    // --------------------------------------------------------

    if (
        cadence_mode === "controlled" &&
        cadence_amount &&
        cadence_unit &&
        UNIT_TO_MS[cadence_unit]
    ) {

        const emailsPerMs =
            cadence_amount / UNIT_TO_MS[cadence_unit];

        let state = rateState.get(id);
        const now = Date.now();

        if (!state) {
            state = {
                tokens: 0,
                lastRefill: now
            };

            rateState.set(id, state);
        }

        const elapsed = now - state.lastRefill;

        state.tokens = Math.min(
            state.tokens + emailsPerMs * elapsed,
            MAX_BATCH_SIZE
        );

        state.lastRefill = now;

        batchSize = Math.floor(state.tokens);

        if (batchSize < 1) {
            return;
        }

        state.tokens -= batchSize;

    } else {

        // ----------------------------------------------------
        // IMMEDIATE MODE
        // ----------------------------------------------------

        batchSize = IMMEDIATE_BATCH_SIZE;
    }


    // ========================================================
    // GET PENDING RECIPIENTS
    // ========================================================

   const { rows: pending } = await pool.query(
    `
    SELECT
        cr.id AS link_id,
        r.email,
        cr.unique_token
    FROM campaign_recipients cr
    INNER JOIN recipients r
        ON r.id = cr.recipient_id
    WHERE cr.campaign_id = $1
      AND cr.send_status = 'pending'
    ORDER BY cr.id
    LIMIT $2
    `,
    [id, batchSize]
);


    // No more emails
    if (pending.length === 0) {
        await finalizeIfDone(id);
        return;
    }


    // ========================================================
    // GET CAMPAIGN EMAIL CONTENT
    // ========================================================

    const campaignResult = await pool.query(
        `SELECT email_subject, email_template
         FROM campaigns
         WHERE id = $1`,
        [id]
    );

    const campaignRow = campaignResult.rows[0];

    if (!campaignRow) {
        console.error(
            `CAMPAIGN ${id} NOT FOUND WHILE PROCESSING EMAILS.`
        );
        return;
    }



    const emailTasks = pending.map(async (row) => {

        // ----------------------------------------------------
        // Validate email
        // ----------------------------------------------------

        if (!isValidEmail(row.email)) {

            await markResult(
                id,
                row.link_id,
                "failed",
                "Invalid email address."
            );

            return;
        }


        // ----------------------------------------------------
        // Send email
        // ----------------------------------------------------

        try {

           const result = await sendCampaignEmail(
    row.email,
    campaignRow.email_subject,
    campaignRow.email_template,
    row.unique_token
);

            if (result === false) {
                throw new Error(
                    "Email service returned false."
                );
            }


            // ------------------------------------------------
            // Mark as sent
            // ------------------------------------------------

            await markResult(
                id,
                row.link_id,
                "sent",
                null
            );

            console.log(
                `EMAIL SENT: ${row.email}`
            );

        } catch (err) {

            // ------------------------------------------------
            // Mark as failed
            // ------------------------------------------------

            await markResult(
                id,
                row.link_id,
                "failed",
                err.message || String(err)
            );

            console.error(
                `EMAIL FAILED: ${row.email}`,
                err.message || err
            );
        }
    });


    // ========================================================
    // WAIT FOR THE WHOLE BATCH
    // ========================================================

    await Promise.allSettled(emailTasks);


    // ========================================================
    // CHECK IF CAMPAIGN IS FINISHED
    // ========================================================

    await finalizeIfDone(id);
}


// ============================================================
// MARK EMAIL RESULT
// ============================================================

async function markResult(
    campaignId,
    linkId,
    status,
    errorMessage
) {

    if (status === "sent") {

        await pool.query(
            `
            UPDATE campaign_recipients
            SET
                send_status = 'sent',
                email_sent = true,
                email_sent_at = NOW(),
                sent_at = NOW(),
                attempts = attempts + 1,
                last_error = NULL
            WHERE id = $1
            `,
            [linkId]
        );

        await pool.query(
            `
            UPDATE campaigns
            SET sent_count = sent_count + 1
            WHERE id = $1
            `,
            [campaignId]
        );

    } else {

        await pool.query(
            `
            UPDATE campaign_recipients
            SET
                send_status = 'failed',
                email_sent = false,
                attempts = attempts + 1,
                last_error = $2
            WHERE id = $1
            `,
            [
                linkId,
                errorMessage
            ]
        );

        await pool.query(
            `
            UPDATE campaigns
            SET failed_count = failed_count + 1
            WHERE id = $1
            `,
            [campaignId]
        );
    }
}


// ============================================================
// FINALIZE CAMPAIGN
// ============================================================

async function finalizeIfDone(campaignId) {

    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS remaining
         FROM campaign_recipients
         WHERE campaign_id = $1
           AND send_status = 'pending'`,
        [campaignId]
    );


    if (rows[0].remaining === 0) {

        await pool.query(
            `UPDATE campaigns
             SET
                status = 'completed',
                completed_at = NOW()
             WHERE id = $1
               AND status = 'sending'`,
            [campaignId]
        );

        rateState.delete(campaignId);

        console.log(
            `CAMPAIGN ${campaignId} COMPLETED.`
        );
    }
}


// ============================================================
// START WORKER
// ============================================================

function start() {

    setInterval(tick, TICK_MS);

    console.log(
        `CADENCE WORKER STARTED (tick every ${TICK_MS}ms).`
    );
}


module.exports = {
    start
};