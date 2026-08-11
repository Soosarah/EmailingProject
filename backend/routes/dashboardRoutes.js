const express = require("express");
const router = express.Router();

const { dashboard , 
     activeCampaigns,
    recentActivity,
    responsesChart,
    todayStats,
    evolutionStats,
    search

 } = require("../controllers/dashboardController");

router.get("/", dashboard);
router.get("/campaigns", activeCampaigns);
router.get("/activity", recentActivity);
router.get("/chart", responsesChart);
router.get("/today", todayStats);
router.get("/evolution", evolutionStats);
router.get("/search", search);
module.exports = router;