const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    importRecipients,
    getCampaignProgress,
    pauseCampaign,
    resumeCampaign
} = require("../controllers/campaignController");


// ===============================
// CAMPAIGNS
// ===============================

router.get(
    "/",
    authenticateToken,
    getCampaigns
);

router.post(
    "/",
    authenticateToken,
    createCampaign
);

router.put(
    "/:id",
    authenticateToken,
    updateCampaign
);

router.delete(
    "/:id",
    authenticateToken,
    deleteCampaign
);


// ===============================
// CAMPAIGN PROGRESS
// ===============================

router.get(
    "/:id/progress",
    authenticateToken,
    getCampaignProgress
);


// ===============================
// PAUSE / RESUME
// ===============================

router.post(
    "/:id/pause",
    authenticateToken,
    pauseCampaign
);

router.post(
    "/:id/resume",
    authenticateToken,
    resumeCampaign
);


// ===============================
// IMPORT RECIPIENTS
// ===============================

router.post(
    "/:id/import-recipients",
    authenticateToken,
    upload.single("file"),
    importRecipients
);


// ===============================
// LAUNCH CAMPAIGN
// ===============================

router.post(
    "/:id/launch",
    authenticateToken,
    launchCampaign
);


module.exports = router;