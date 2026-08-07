
const API_BASE = 'http://localhost:5000';

const token = localStorage.getItem('token');
const userRaw = localStorage.getItem('user');


if (!token || !userRaw) {
  window.location.href = 'djezzy_login.html';
}

const user = JSON.parse(userRaw);


document.getElementById('welcome').textContent = `Bienvenue, ${user.first_name}`;
document.getElementById('adminName').textContent = `${user.first_name} ${user.last_name}`;
document.getElementById('adminRole').textContent = user.role;

const dateEl = document.getElementById("date");
const welcomeEl = document.getElementById("welcome");

function updateDateTime() {

    const now = new Date();

    const hour = now.getHours();

    let greeting = "Bienvenue";

    if (hour >= 5 && hour < 12) {
        greeting = "☀ Bonjour";
    }
    else if (hour >= 12 && hour < 18) {
        greeting = "🌤 Bon après-midi";
    }
    else {
        greeting = "🌙 Bonsoir";
    }

    welcomeEl.textContent = `${greeting}, ${user.first_name}`;

    dateEl.textContent =
        now.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }) +
        " • " +
        now.toLocaleTimeString("fr-FR");
}

updateDateTime();
setInterval(updateDateTime,1000);


const statusMessage = document.getElementById('statusMessage');

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'djezzy_login.html';
      return;
    }

    const data = await res.json();
    statusMessage.textContent = data.message || 'Session active.';
    statusMessage.classList.add('ok');

  
   function animateCounter(id,target){

    const element=document.getElementById(id);

    let current=0;

    const increment=Math.max(1,Math.ceil(target/60));

    const timer=setInterval(()=>{

        current+=increment;

        if(current>=target){

            current=target;

            clearInterval(timer);

        }

        element.textContent=current;

    },15);

}
   animateCounter("campaignCount",0);
animateCounter("recipientCount",0);
animateCounter("surveyCount",0);
animateCounter("responseCount",0);
  } catch (err) {
    console.error(err);
    statusMessage.textContent = 'Impossible de contacter le serveur.';
    statusMessage.classList.add('error');
  }
}

loadDashboard();
async function loadNotificationCount(){

    try{

        const response=await fetch(
            `${API_BASE}/api/password-reset-requests/count`,
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        if(!response.ok)return;

        const data=await response.json();

        const badge=document.getElementById("notificationCount");

        badge.textContent=data.count;

        badge.style.display=data.count>0?"flex":"none";

    }
    catch(err){

        console.error(err);

    }

}
loadNotificationCount();


document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'djezzy_login.html';
});


document.querySelectorAll('.sidebar li').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar li').forEach((i) => i.classList.remove('active'));
    item.classList.add('active');
  });


  document.getElementById("campaignsLink").addEventListener("click", () => {
    window.location.href = "campaigns.html";
});
});