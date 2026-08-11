const sidebarHTML = `
<aside class="sidebar" id="sidebar">

    <div class="brand">
        <img
            src="../images/logo_djezzy.png"
            alt="Djezzy"
            class="brand-logo"
        >

        <div>
            <div class="brand-name">Djezzy</div>
        </div>
    </div>

    <nav class="nav-group">

        <div class="nav-label">Pilotage</div>

        <a class="nav-item"
           href="../dashboard/dashboard.html"
           data-page="dashboard">

            <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="9"
                      rx="1.5" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="5"
                      rx="1.5" stroke-width="2"/>
                <rect x="14" y="12" width="7" height="9"
                      rx="1.5" stroke-width="2"/>
                <rect x="3" y="16" width="7" height="5"
                      rx="1.5" stroke-width="2"/>
            </svg>

            <span class="label">Tableau de bord</span>
        </a>


        <a class="nav-item"
           href="../campaigns/campaigns.html"
           data-page="campagnes">

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 11l18-7-7 18-3-8-8-3z"
                      stroke-width="2"
                      stroke-linejoin="round"/>
            </svg>

            <span class="label">Campagnes</span>

            <span class="badge">6</span>
        </a>


        <a class="nav-item"
           href="../questionnaires/questionnaires.html"
           data-page="questionnaires">

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-1"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <path d="M9 12l2 2 4-4"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>

                <path d="M13 3h5a2 2 0 012 2v5"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>

            <span class="label">Questionnaires</span>
        </a>


        <a class="nav-item"
           href="../destinataires/destinataires.html"
           data-page="destinataires">

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <circle cx="10" cy="7" r="4"
                        stroke-width="2"/>

                <path d="M23 20v-1a4 4 0 00-3-3.87"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <path d="M16 3.13a4 4 0 010 7.75"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>

            <span class="label">Destinataires</span>
        </a>


        <a class="nav-item"
           href="../emails/emails.html"
           data-page="emails">

            <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke-width="2"/>

                <path d="M2 6l10 7L22 6"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
            </svg>

            <span class="label">Emails</span>
        </a>

    </nav>


    <nav class="nav-group">

        <div class="nav-label">Analyse</div>

        <a class="nav-item"
           href="../stats/stats.html"
           data-page="stats">

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 3v18h18"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <path d="M7 15l4-5 3 3 5-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
            </svg>

            <span class="label">Statistiques</span>
        </a>


        <a class="nav-item"
           href="../export/export.html"
           data-page="export">

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <path d="M7 10l5 5 5-5"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>

                <path d="M4 21h16"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>

            <span class="label">Exports</span>
        </a>

    </nav>


    <nav class="nav-group">

        <div class="nav-label">Administration</div>

        <a class="nav-item"
           href="../users/users.html"
           data-page="utilisateurs">

            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4"
                        stroke-width="2"/>

                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>

            <span class="label">
                Utilisateurs & rôles
            </span>
        </a>


        <a class="nav-item"
           href="../parametres/parametres.html"
           data-page="parametres">

            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3"
                        stroke-width="2"/>

                <path d="M19.4 15a1.7 1.7 0 00.33 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.33 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a2 2 0 00.33-1.87 1.7 1.7 0 00-1.55-1H3a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.33-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.33H9a1.7 1.7 0 001-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.33l.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 00-.33 1.87V9a1.7 1.7 0 001.55 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
            </svg>

            <span class="label">Paramètres</span>
        </a>

    </nav>


    <div class="sidebar-bottom">

        <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
        >

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 17l5-5-5-5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>

                <path d="M15 12H3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"/>

                <path d="M20 4v16"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"/>
            </svg>

            <span class="label">
                Déconnexion
            </span>

        </button>


        <button
            class="collapse-btn"
            id="collapseBtn"
            type="button"
        >

            <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      stroke-width="2.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"/>
            </svg>

            <span class="ctext">
                Réduire
            </span>

        </button>

    </div>

</aside>
`;

// ==========================================
// GESTION DES PERMISSIONS
// ==========================================

function hasPermission(permissionLabel) {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {
        return false;
    }

    // ADMIN = accès complet
    if (user.role === "ADMIN") {
        return true;
    }

    if (!Array.isArray(user.permissions)) {
        return false;
    }

    return user.permissions.some(permission => {

        return permission.label === permissionLabel;

    });

}
function applyPermissions() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {

        window.location.href =
            "../login/index.html";

        return;

    }

    // ==========================================
    // TABLEAU DE BORD
    // ==========================================

    // Le dashboard reste accessible
    // à tous les utilisateurs connectés.


    // ==========================================
    // CAMPAGNES
    // ==========================================

    if (!hasPermission("Voir les campagnes")) {

        document
            .querySelector('[data-page="campagnes"]')
            ?.remove();

    }


    // ==========================================
    // QUESTIONNAIRES
    // ==========================================

    if (!hasPermission("Voir les questionnaires")) {

        document
            .querySelector('[data-page="questionnaires"]')
            ?.remove();

    }


    // ==========================================
    // EMAILS
    // ==========================================

    if (!hasPermission("Envoyer des emails")) {

        document
            .querySelector('[data-page="emails"]')
            ?.remove();

    }


    // ==========================================
    // STATISTIQUES
    // ==========================================

    if (!hasPermission("Voir les statistiques")) {

        document
            .querySelector('[data-page="stats"]')
            ?.remove();

    }


    // ==========================================
    // EXPORTS
    // ==========================================

    if (!hasPermission("Exporter les données")) {

        document
            .querySelector('[data-page="export"]')
            ?.remove();

    }


    // ==========================================
    // DESTINATAIRES
    // ==========================================

    // Tu n'as actuellement aucune permission
    // "Voir les destinataires" dans ta liste.
    // Donc réservé à l'ADMIN pour le moment.

    if (user.role !== "ADMIN") {

        document
            .querySelector('[data-page="destinataires"]')
            ?.remove();

    }


    // ==========================================
    // UTILISATEURS & RÔLES
    // ==========================================

    if (user.role !== "ADMIN") {

        document
            .querySelector('[data-page="utilisateurs"]')
            ?.remove();

    }


    // ==========================================
    // PARAMÈTRES
    // ==========================================

    if (user.role !== "ADMIN") {

        document
            .querySelector('[data-page="parametres"]')
            ?.remove();

    }


    // ==========================================
    // MASQUER LES GROUPES VIDES
    // ==========================================

    document
        .querySelectorAll(".nav-group")
        .forEach(group => {

            const items =
                group.querySelectorAll(".nav-item");

            if (items.length === 0) {

                group.remove();

            }

        });

}
// ==========================================
// CHARGER LA SIDEBAR
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.getElementById("sidebar-container");

    if (!container) {

        console.error(
            "❌ sidebar-container introuvable"
        );

        return;
    }

    container.innerHTML = sidebarHTML;

    console.log("✅ Sidebar injectée");

    function checkCurrentPagePermission() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {

        window.location.href =
            "../login/index.html";

        return;

    }

    // ADMIN peut tout voir
    if (user.role === "ADMIN") {
        return;
    }

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");

    const pagePermissions = {

        campaigns:
            "Voir les campagnes",

        questionnaires:
            "Voir les questionnaires",

        emails:
            "Envoyer des emails",

        stats:
            "Voir les statistiques",

        export:
            "Exporter les données"

    };

    const requiredPermission =
        pagePermissions[currentPage];

    // Dashboard accessible
    if (!requiredPermission) {

        // Pages administration
        if (
            currentPage === "users" ||
            currentPage === "parametres" ||
            currentPage === "destinataires"
        ) {

            window.location.href =
                "../dashboard/dashboard.html";

        }

        return;

    }

    if (!hasPermission(requiredPermission)) {

        alert(
            "Vous n'avez pas la permission d'accéder à cette page."
        );

        window.location.href =
            "../dashboard/dashboard.html";

    }

}
// Appliquer les permissions de l'utilisateur
applyPermissions();
checkCurrentPagePermission();
// ==========================================
// COLLAPSE
// ==========================================

    const sidebar =
        document.getElementById("sidebar");

    const collapseBtn =
        document.getElementById("collapseBtn");

    if (collapseBtn && sidebar) {

        collapseBtn.addEventListener("click", function () {

            sidebar.classList.toggle("collapsed");

        });

    }


// ==========================================
// DÉCONNEXION
// ==========================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            localStorage.removeItem("user");

            window.location.href =
                "../login/index.html";

        });

    }


// ==========================================
// PAGE ACTIVE
// ==========================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");


    document.querySelectorAll(".nav-item")
        .forEach(item => {

            const href =
                item.getAttribute("href");

            if (!href) return;

            const targetPage =
                href
                    .split("/")
                    .pop()
                    .replace(".html", "");

            if (targetPage === currentPage) {

                item.classList.add("active");

            }

        });

});