const express = require("express");
const router = express.Router();

const { dashboard , 
     activeCampaigns,
    recentActivity,
    responsesChart } = require("../controllers/dashboardController");

router.get("/", dashboard);
router.get("/campaigns", activeCampaigns);
router.get("/activity", recentActivity);
router.get("/chart", responsesChart);

module.exports = router;