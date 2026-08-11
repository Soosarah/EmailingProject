
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign
} = require("../controllers/campaignController");

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

router.post(
    "/:id/launch",
    authenticateToken,
    launchCampaign
);

module.exports = router;
