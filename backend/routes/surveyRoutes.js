const express = require("express");

const router =
    express.Router();

const surveyController =
    require("../controllers/surveyController");

const {
    authenticateToken
} =
    require("../middleware/authMiddleware");


// Toutes les routes questionnaires
// nécessitent une connexion

router.use(
    authenticateToken
);


router.get(
    "/",
    surveyController.getSurveys
);


router.get(
    "/:id",
    surveyController.getSurvey
);


router.post(
    "/",
    surveyController.createSurvey
);


router.put(
    "/:id",
    surveyController.updateSurvey
);


router.delete(
    "/:id",
    surveyController.deleteSurvey
);


module.exports = router;