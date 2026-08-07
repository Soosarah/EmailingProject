const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    getLogic,
    saveLogic
} = require("../controllers/logicController");

router.get("/:questionId", authenticateToken, getLogic);

router.post("/", authenticateToken, saveLogic);

module.exports = router;