 // Sidebar collapse
  const sidebar = document.getElementById('sidebar');
  document.getElementById('collapseBtn').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Nav active state (mock routing)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const label = item.querySelector('.label').textContent;
      document.querySelector('.page-title').textContent = label;
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const mode = btn.dataset.mode;
    document.body.setAttribute('data-theme', mode);
    themeToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
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
async function loadChart() {

    const response = await fetch("http://localhost:5000/api/dashboard/chart");

    const data = await response.json();

    const categories = data.map(item => item.day);

    const values = data.map(item => Number(item.total));

    const options = {

        chart: {
            type: "bar",
            height: 320
        },

        series: [{
            name: "Réponses",
            data: values
        }],

        xaxis: {
            categories: categories
        }

    };

    const chart = new ApexCharts(
        document.querySelector("#responsesChart"),
        options
    );

    chart.render();
}

loadChart();
loadDashboard();
loadCampaigns();
loadRecentActivity();