const { getDashboardStats,
     getActiveCampaigns,
     getRecentActivity,
     getResponsesLast7Days } = require("../models/dashboardModel");

async function dashboard(req, res) {
    try {
        const stats = await getDashboardStats();

        res.status(200).json(stats);
    } catch (error) {
        console.error("Erreur dashboard :", error);

        res.status(500).json({
            message: "Erreur lors de la récupération des statistiques."
        });
    }
}
async function activeCampaigns(req, res) {
    try {
        const campaigns = await getActiveCampaigns();

        res.json(campaigns);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }
}
async function recentActivity(req, res) {

    try {

        const activity = await getRecentActivity();

        res.json(activity);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

}
async function responsesChart(req, res) {
    try {
        const data = await getResponsesLast7Days();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    dashboard,
    activeCampaigns,
    recentActivity,
    responsesChart
};