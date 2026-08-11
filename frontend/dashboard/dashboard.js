 const user = JSON.parse(localStorage.getItem("user"));
const today = new Date();

const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

const formattedDate = today.toLocaleDateString("fr-FR", options);

if (!user) {
    window.location.href = "../login/index.html";
    throw new Error("Utilisateur non connecté");
}

document.getElementById("welcomeDate").textContent =
    formattedDate.toUpperCase();

document.getElementById("welcomeTitle").textContent =
    `Bon retour, ${user.first_name} 👋`;

document.getElementById("adminName").textContent =
    `${user.first_name} ${user.last_name}`;

document.getElementById("adminEmail").textContent =
    user.email;

document.getElementById("adminRole").textContent =
    user.role;

const initials =
    user.first_name[0].toUpperCase() +
    user.last_name[0].toUpperCase();

document.getElementById("adminAvatar").textContent =
    initials;

 
  async function loadDashboard() {
    try {
        const response = await fetch("http://localhost:5000/api/dashboard");
        const data = await response.json();

        console.log(data);

        document.getElementById("campaignsCount").textContent = data.campaigns;
        document.getElementById("surveysCount").textContent = data.surveys;
        document.getElementById("responsesCount").textContent = data.responses;
        document.getElementById("recipientsCount").textContent = data.recipients;

    } catch (error) {
        console.error(error);
    }
}

async function loadCampaigns() {

    try {

        const response = await fetch("http://localhost:5000/api/dashboard/campaigns");

        const campaigns = await response.json();

        const container = document.getElementById("campaignList");

        container.innerHTML = "";

        campaigns.forEach(campaign => {

            container.innerHTML += `
                <div class="camp-row">

                    <div class="camp-ic">

                        📧

                    </div>

                    <div class="camp-info">

                        <div class="camp-name">
                            ${campaign.title}
                        </div>

                        <div class="camp-meta">
                            ${campaign.status}
                        </div>

                    </div>

                </div>
            `;

        });

    }

    catch(err){

        console.error(err);

    }

}
async function loadRecentActivity() {

    try {

        const response = await fetch("http://localhost:5000/api/dashboard/activity");

        const activities = await response.json();

        const table = document.getElementById("activityTable");

        table.innerHTML = "";

        activities.forEach(activity => {

            const completed = activity.survey_completed
                ? `<span class="pill ok"><span class="d"></span>Terminé</span>`
                : `<span class="pill warn"><span class="d"></span>En cours</span>`;

            table.innerHTML += `
                <tr>

                    <td>
                        ${activity.first_name} ${activity.last_name}
                    </td>

                    <td>
                        ${activity.title}
                    </td>

                    <td>
                        ${completed}
                    </td>

                    <td>
                        ${activity.survey_completed ? "✔" : "..."}
                    </td>

                    <td>
                        ${
                            activity.survey_completed_at
                                ? new Date(activity.survey_completed_at).toLocaleString("fr-FR")
                                : "-"
                        }
                    </td>

                </tr>
            `;

        });

    } catch(err) {

        console.error(err);

    }

}

// ======================================================
// Theme
// ======================================================

const themeToggle =
document.getElementById("themeToggle");

themeToggle.addEventListener("click", e => {

    const button = e.target.closest("button");

    if (!button) return;

    themeToggle
        .querySelectorAll("button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    document.body.dataset.theme =
        button.dataset.mode;

});

async function loadChart() {

    const response = await fetch("http://localhost:5000/api/dashboard/chart");
    const data = await response.json();

    const categories = data.map(item =>
        new Date(item.day).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short"
        })
    );

    const values = data.map(item => Number(item.total));

    const options = {

        chart: {
            type: "bar",
            height: 330,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },

        series: [{
            name: "Réponses",
            data: values
        }],

        colors: ["#E30613"],

        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: "45%",
                distributed: false
            }
        },

        dataLabels: {
            enabled: true
        },

        xaxis: {
            categories: categories,
            labels: {
                style: {
                    fontSize: "13px"
                }
            }
        },

        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: {
                style: {
                    fontSize: "13px"
                }
            }
        },

        grid: {
            borderColor: "#ececec",
            strokeDashArray: 4
        },

        stroke: {
            show: false
        },

        tooltip: {
            theme: "light"
        }

    };

    document.querySelector("#responsesChart").innerHTML = "";

    const chart = new ApexCharts(
        document.querySelector("#responsesChart"),
        options
    );

    chart.render();
}
async function loadTodayStats() {
    try {
        const response = await fetch("http://localhost:5000/api/dashboard/today");
        const data = await response.json();

        document.getElementById("todayEmails").textContent =
            data.emails_today;

        document.getElementById("todayResponses").textContent =
            data.responses_today;

        document.getElementById("todayRecipients").textContent =
            data.recipients_today;

    } catch (err) {
        console.error(err);
    }
}
async function loadEvolutionStats() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/dashboard/evolution"
        );

        const data = await response.json();

        updateTrend(
            "campaignTrend",
            Number(data.campaignEvolution)
        );

        updateTrend(
            "emailTrend",
            Number(data.emailEvolution)
        );

        updateTrend(
            "responseTrend",
            Number(data.responseEvolution)
        );

        updateTrend(
            "recipientTrend",
            Number(data.recipientEvolution)
        );

    } catch (err) {

        console.error(err);

    }

}
function updateTrend(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    const parent = element.parentElement;

    if (value > 0) {

        parent.classList.remove("warn");
        parent.classList.add("up");

        element.textContent = `▲ +${value}% cette semaine`;

    }

    else if (value < 0) {

        parent.classList.remove("up");
        parent.classList.add("warn");

        element.textContent = `▼ ${value}% cette semaine`;

    }

    else {

        parent.classList.remove("up");
        parent.classList.remove("warn");

        element.textContent = "▬ Stable";

    }

}
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

searchInput.addEventListener("input", async () => {

    const keyword = searchInput.value.trim();

    if(keyword.length < 2){

        searchResults.style.display="none";
        return;

    }

    const response = await fetch(
        `http://localhost:5000/api/dashboard/search?q=${encodeURIComponent(keyword)}`
    );

    const data = await response.json();

    searchResults.innerHTML="";

    data.forEach(item=>{

        searchResults.innerHTML += `
            <div class="search-item">
                <div class="search-title">${item.title}</div>
                <div class="search-subtitle">${item.subtitle}</div>
            </div>
        `;

    });

    searchResults.style.display =
        data.length ? "block" : "none";

});

document.addEventListener("click",(e)=>{

    if(!searchResults.contains(e.target) && e.target!==searchInput){

        searchResults.style.display="none";

    }

});
loadEvolutionStats();
loadChart();
loadDashboard();
loadCampaigns();
loadRecentActivity();
loadTodayStats();
