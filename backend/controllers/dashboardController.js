const { getDashboardStats,
     getActiveCampaigns,
     getRecentActivity,
     getResponsesLast7Days,
     getTodayStats,
    getEvolutionStats,
searchDashboard } = require("../models/dashboardModel");

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
async function todayStats(req, res) {
    try {
        const stats = await getTodayStats();
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}
async function evolutionStats(req, res) {

    try {

        const stats = await getEvolutionStats();

        const calculate = (current, previous) => {

    current = Number(current);
    previous = Number(previous);

    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }

    return (((current - previous) / previous) * 100).toFixed(1);

};

res.json({

    campaignEvolution: calculate(
        stats.campaigns_week,
        stats.campaigns_last_week
    ),

    emailEvolution: calculate(
        stats.emails_week,
        stats.emails_last_week
    ),

    responseEvolution: calculate(
        stats.responses_week,
        stats.responses_last_week
    ),

    recipientEvolution: calculate(
        stats.recipients_week,
        stats.recipients_last_week
    )

});
    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

}
async function search(req, res) {

    try {

        const keyword = req.query.q || "";

        const results = await searchDashboard(keyword);

        res.json(results);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error"
        });

    }

}
module.exports = {
    dashboard,
    activeCampaigns,
    recentActivity,
    responsesChart,
    todayStats,
     evolutionStats,
     search
};