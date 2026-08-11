// ======================================================
// PulseSurvey - Users.js
// ======================================================

const API = "http://localhost:5000/api/users";

// ======================================================
// Données
// ======================================================

let users = [];
let filteredUsers = [];

const ROLE_API = "http://localhost:5000/api/roles";

const rolesModal = document.getElementById("rolesModal");

const rolesList = document.getElementById("rolesList");

const permissionsList = document.getElementById("permissionsList");
const savePermissionsBtn =
    document.getElementById("savePermissionsBtn");
const closeRolesModal =
document.getElementById("closeRolesModal");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "../login/index.html";
} else {

    // =========================
    // Initiales
    // =========================

    const initials =
        (user.first_name?.[0] || "").toUpperCase() +
        (user.last_name?.[0] || "").toUpperCase();

    const avatar = document.getElementById("adminAvatar");

    if (avatar) {
        avatar.textContent = initials;
    }


    // =========================
    // Nom + prénom
    // =========================

    const adminName = document.getElementById("adminName");

    if (adminName) {
        adminName.textContent =
            `${user.first_name} ${user.last_name}`;
    }


    // =========================
    // Email
    // =========================

    const adminEmail = document.getElementById("adminEmail");

    if (adminEmail) {
        adminEmail.textContent = user.email;
    }


    // =========================
    // Statut
    // =========================

    const adminRole = document.getElementById("adminRole");

    if (adminRole) {
        adminRole.textContent = user.role;
    }
}

let roles = [];

let permissions = [];

let selectedRole = null;
let selectedUser = null;
let editingUser = null;

// ======================================================
// Eléments principaux
// ======================================================

const usersTableBody = document.getElementById("usersTableBody");

const usersLoading = document.getElementById("usersLoading");
const usersTableWrap = document.getElementById("usersTableWrap");
const usersEmptyState = document.getElementById("usersEmptyState");
const rolesModalList = document.getElementById("rolesModalList");
const selectedRoleLabel = document.getElementById("selectedRoleLabel");
const selectAllPermissions = document.getElementById("selectAllPermissions");
const openPermissionsModalBtn = document.getElementById("openPermissionsModalBtn");
const searchInput = document.getElementById("userSearchInput");

const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");
roleFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);
const newUserBtn = document.getElementById("newUserBtn");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportUsersBtn");

// ======================================================
// Statistiques
// ======================================================

const statTotal = document.getElementById("statTotal");
const statActive = document.getElementById("statActive");
const statAdmins = document.getElementById("statAdmins");
const statNew = document.getElementById("statNew");

// ======================================================
// Toast
// ======================================================

const toast = document.getElementById("toast");

// ======================================================
// Modals
// ======================================================
const deleteConfirmBtn =
document.getElementById("deleteModalConfirm");
const userModal = document.getElementById("userModalOverlay");
const deleteModal = document.getElementById("deleteModalOverlay");

const userModalTitle = document.getElementById("userModalTitle");

const userModalClose = document.getElementById("userModalClose");
const userModalCancel = document.getElementById("userModalCancel");

const deleteModalClose = document.getElementById("deleteModalClose");
const deleteModalCancel = document.getElementById("deleteModalCancel");
const deleteModalConfirm = document.getElementById("deleteModalConfirm");

const deleteUserName = document.getElementById("deleteUserName");

// ======================================================
// Formulaire
// ======================================================

const userForm = document.getElementById("userForm");

const userId = document.getElementById("userId");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const password = document.getElementById("password");

const roleSelect = document.getElementById("roleSelect");
const statusSelect = document.getElementById("statusSelect");

const formError = document.getElementById("formError");
const emailError = document.getElementById("emailError");



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

// ======================================================
// Tabs
// ======================================================

document
.querySelectorAll(".tab-btn")
.forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".tab-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        document
            .querySelectorAll(".tab-panel")
            .forEach(panel => panel.classList.remove("active"));

        document
            .getElementById("tab-" + button.dataset.tab)
            .classList.add("active");

    });

});
// ======================================================
// Toast
// ======================================================

function showToast(message, error = false) {

    toast.textContent = message;

    toast.classList.remove("error", "show");

    if (error) {
        toast.classList.add("error");
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


// ======================================================
// Loader
// ======================================================

function showLoader() {

    usersLoading.style.display = "flex";

    usersTableWrap.style.display = "none";

    usersEmptyState.style.display = "none";

}

function hideLoader() {

    usersLoading.style.display = "none";

    usersTableWrap.style.display = "block";

}


// ======================================================
// Modals
// ======================================================

function openModal(modal) {

    modal.classList.add("open");

}

function closeModal(modal) {

    modal.classList.remove("open");

}
// ======================================================
// Modals - fermeture
// ======================================================

if (userModalClose) {
    userModalClose.onclick = () => closeModal(userModal);
}

if (userModalCancel) {
    userModalCancel.onclick = () => closeModal(userModal);
}

if (deleteModalClose) {
    deleteModalClose.onclick = () => closeModal(deleteModal);
}

if (deleteModalCancel) {
    deleteModalCancel.onclick = () => closeModal(deleteModal);
}


// ======================================================
// Helpers
// ======================================================

function getInitials(firstName, lastName) {

    return (
        firstName.charAt(0).toUpperCase() +
        lastName.charAt(0).toUpperCase()
    );

}

function formatDate(date) {

    return new Date(date).toLocaleDateString("fr-FR", {

        year: "numeric",

        month: "short",

        day: "numeric"

    });

}

function clearForm() {

    userId.value = "";

    firstName.value = "";

    lastName.value = "";

    email.value = "";

    password.value = "";

    roleSelect.value = "";

    statusSelect.value = "active";

    formError.style.display = "none";

    emailError.textContent = "";

    editingUser = null;

}


// ======================================================
// Chargement utilisateurs
// ======================================================
async function loadUsers() {

    showLoader();

    try {

        const response = await fetch(API);

        users = await response.json();

        filteredUsers = [...users];

        updateStats();

        loadRolesFilter();

        renderUsers(filteredUsers);

        hideLoader();

    } catch (err) {

        console.error(err);

        hideLoader();

        showToast("Impossible de charger les utilisateurs.", true);

    }

}

// ======================================================
// Statistiques
// ======================================================

function updateStats(){

    document.getElementById("statTotal").textContent =
        users.length;

    document.getElementById("statActive").textContent =

        users.filter(u=>u.status==="ACTIVE").length;

    document.getElementById("statAdmins").textContent =

        users.filter(u=>u.role==="ADMIN").length;

    const month=new Date().getMonth();

    const year=new Date().getFullYear();

    document.getElementById("statNew").textContent=

        users.filter(user=>{

            const d=new Date(user.created_at);

            return(

                d.getMonth()===month &&

                d.getFullYear()===year

            );

        }).length;

}


// ======================================================
// Remplissage filtre rôle
// ======================================================

function populateRoleFilter(){

    roleFilter.innerHTML=

    `<option value="">Tous les rôles</option>`;

    const roles=[...new Set(users.map(u=>u.role))];

    roles.forEach(role=>{

        roleFilter.innerHTML+=`

        <option value="${role}">

            ${role}

        </option>

        `;

    });

}

// =========================================
// Refresh
// =========================================

refreshBtn.addEventListener("click", () => {

    loadUsers();

    showToast("Liste actualisée");

});


// =========================================
// Export CSV
// =========================================

exportBtn.addEventListener("click", () => {

    let csv =
`Nom,Prénom,Email,Rôle,Statut\n`;

    filteredUsers.forEach(user => {

        csv +=
`${user.last_name},${user.first_name},${user.email},${user.role},${user.status}\n`;

    });

    const blob = new Blob(
        [csv],
        {
            type: "text/csv"
        }
    );

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "utilisateurs.csv";

    a.click();

    window.URL.revokeObjectURL(url);

});
// =========================================
// Affichage des utilisateurs
// =========================================


function renderUsers(list) {

    usersTableBody.innerHTML = "";

    if (list.length === 0) {

        usersTableWrap.style.display = "none";
        usersEmptyState.style.display = "block";
        return;
    }

    usersEmptyState.style.display = "none";
    usersTableWrap.style.display = "block";

    list.forEach(user => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

        <td>
            <div style="display:flex;align-items:center;gap:12px;">

                <div class="avatar">
                    ${getInitials(user.first_name, user.last_name)}
                </div>

                <div>
                    <strong>
                        ${user.first_name} ${user.last_name}
                    </strong>
                    <br>
                    <small>${user.email}</small>
                </div>

            </div>
        </td>

        <td>

            <span class="user-role-badge role-${user.role}">
                <span class="dot"></span>
                ${user.role}
            </span>

        </td>

        <td>

            ${
                user.status === "ACTIVE"

                ?

                `<span class="badge bg-success">Actif</span>`

                :

                `<span class="badge bg-secondary">Inactif</span>`
            }

        </td>

        <td>

            ${
                new Date(user.created_at)
                .toLocaleDateString("fr-FR")
            }

        </td>

        <td>

            <div class="row-actions">

                <button
                    class="row-btn"
                   onclick="editUser(${user.id})">

                    ✏️

                </button>

                <button
                    class="row-btn danger"
                    onclick="openDeleteModal(${user.id})">

                    🗑️

                </button>

            </div>

        </td>

        `;

        usersTableBody.appendChild(tr);

    });

}
// =========================================
// Nouveau utilisateur
// =========================================

newUserBtn.addEventListener("click", async () => {

    selectedUser = null;

    userForm.reset();

    userId.value = "";

    document.getElementById("userModalTitle").textContent =
        "Nouvel utilisateur";

    document.querySelector("#userModalSubmit .btn-label").textContent =
        "Créer l'utilisateur";

    document.getElementById("passwordField").style.display = "block";

    formError.style.display = "none";

    // Charger les rôles
    await loadRolesForUserForm();

    userModal.classList.add("open");

});

document.getElementById("userModalClose").onclick = closeUserModal;

document.getElementById("userModalCancel").onclick = closeUserModal;

function closeUserModal() {

    userModal.classList.remove("open");

}
// =========================================
// Modifier un utilisateur
// =========================================

async function editUser(id) {

    const user = users.find(u => Number(u.id) === Number(id));

    if (!user) {
        showToast("Utilisateur introuvable.", true);
        return;
    }

    editingUser = user;

    // Ouvrir le formulaire
    userModal.classList.add("open");

    // Titre
    userModalTitle.textContent = "Modifier l'utilisateur";

    // Bouton
    document.querySelector("#userModalSubmit .btn-label").textContent =
        "Enregistrer les modifications";

    // ID
    userId.value = user.id;

    // Informations
    firstName.value = user.first_name || "";
    lastName.value = user.last_name || "";
    email.value = user.email || "";

    // Statut
    if (statusSelect) {
        statusSelect.value =
            user.status?.toUpperCase() === "ACTIVE"
                ? "active"
                : "inactive";
    }

    // En modification : pas besoin de mot de passe
    password.value = "";
    document.getElementById("passwordField").style.display = "none";

    formError.style.display = "none";
    emailError.textContent = "";

    // Charger les rôles dans le select
    await loadRolesForUserForm();

    // Sélectionner le rôle actuel
    if (roleSelect) {

        // Si ton utilisateur contient role_id
        if (user.role_id) {
            roleSelect.value = String(user.role_id);
        }

        // Sinon retrouver le rôle grâce à son nom
        else if (user.role) {

            const role = Array.from(roleSelect.options)
                .find(option =>
                    option.textContent.trim().toUpperCase() ===
                    String(user.role).trim().toUpperCase()
                );

            if (role) {
                roleSelect.value = role.value;
            }
        }
    }
}
// =========================================
// Enregistrer utilisateur
// =========================================
userForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    formError.style.display = "none";

    // ==============================
    // Validation
    // ==============================

    if (
        !firstName.value.trim() ||
        !lastName.value.trim() ||
        !email.value.trim() ||
        !roleSelect.value
    ) {

        formError.textContent =
            "Veuillez remplir tous les champs obligatoires.";

        formError.style.display = "block";

        return;
    }

    // Mot de passe obligatoire uniquement à la création
    if (!userId.value && password.value.length < 8) {

        formError.textContent =
            "Le mot de passe doit contenir au moins 8 caractères.";

        formError.style.display = "block";

        return;
    }

    // ==============================
    // Données
    // ==============================

    const data = {

        first_name: firstName.value.trim(),

        last_name: lastName.value.trim(),

        email: email.value.trim(),

        role: roleSelect.options[roleSelect.selectedIndex].textContent.trim(),

        // Si tu gardes le statut dans ta BDD
        status: userId.value
            ? statusSelect.value.toUpperCase()
            : "ACTIVE"
    };

    // Mot de passe uniquement pour un nouvel utilisateur
    if (!userId.value) {
        data.password = password.value;
    }

    // ==============================
    // Requête
    // ==============================

    try {

        const response = await fetch(

            userId.value
                ? `${API}/${userId.value}`
                : API,

            {
                method: userId.value ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const result = await response.text();

        console.log("Réponse serveur :", response.status, result);

        if (!response.ok) {
            throw new Error(result);
        }

        // ==============================
        // Succès
        // ==============================

        const isEdit = Boolean(userId.value);

        closeUserModal();

        showToast(
            isEdit
                ? "Utilisateur modifié avec succès."
                : "Utilisateur créé avec succès."
        );

        await loadUsers();

    } catch (error) {

        console.error(
            "Erreur lors de l'enregistrement :",
            error
        );

        formError.textContent =
            "Impossible d'enregistrer les modifications.";

        formError.style.display = "block";
    }

});

// =========================================
// Suppression
// =========================================

let userToDelete = null;

function openDeleteModal(id) {

    userToDelete = users.find(user => user.id == id);

    if (!userToDelete) return;

    document.getElementById("deleteUserName").textContent =
        `${userToDelete.first_name} ${userToDelete.last_name}`;

    deleteModal.classList.add("open");

}

function closeDeleteModal() {

    deleteModal.classList.remove("open");

    userToDelete = null;

}

document
.getElementById("deleteModalClose")
.addEventListener("click", closeDeleteModal);

document
.getElementById("deleteModalCancel")
.addEventListener("click", closeDeleteModal);

deleteConfirmBtn.addEventListener("click", async () => {

    if (!userToDelete) return;

    try {

        const response = await fetch(`${API}/${userToDelete.id}`, {

            method: "DELETE"

        });

        if (!response.ok) {

            throw new Error();

        }

        closeDeleteModal();

        showToast("Utilisateur supprimé.");

        loadUsers();

    }

    catch (err) {

        console.error(err);

        showToast("Erreur lors de la suppression.", true);

    }

});
function loadRolesFilter() {

    const roles = [...new Set(users.map(u => u.role))];

    roleFilter.innerHTML = `
        <option value="">Tous les rôles</option>
    `;

    roles.forEach(role => {

        roleFilter.innerHTML += `
            <option value="${role}">
                ${role}
            </option>
        `;

    });

}
function applyFilters() {

    const role = roleFilter.value;
    const status = statusFilter.value;
    const search = searchInput.value.toLowerCase();

    filteredUsers = users.filter(user => {

        const matchRole =
            role === "" || user.role === role;

        const matchStatus =
            status === "" ||  user.status.toLowerCase() === status.toLowerCase();

        const matchSearch =
            (`${user.first_name} ${user.last_name}`
                .toLowerCase()
                .includes(search))
            ||
            user.email.toLowerCase().includes(search);

        return matchRole && matchStatus && matchSearch;

    });

    renderUsers(filteredUsers);

}
const rolesGrid = document.getElementById("rolesGrid");
async function loadRoles() {

    if (rolesModalList) {
        rolesModalList.innerHTML = `
            <div class="roles-modal-loading">
                <div class="spinner"></div>
                <span>Chargement des rôles…</span>
            </div>
        `;
    }

    try {

        const response = await fetch(ROLE_API);

        if (!response.ok) {
            throw new Error();
        }

        roles = await response.json();

        renderModalRoles();

    }

    catch(err){

        console.error(err);

        if (rolesModalList) {
            rolesModalList.innerHTML = `
                <div class="roles-modal-error">
                    Impossible de charger les rôles.
                </div>
            `;
        }

        if (selectedRoleLabel) {
            selectedRoleLabel.textContent = "Sélectionnez un rôle";
        }

        if (permissionsList) {
            permissionsList.innerHTML = "";
        }

    }

}
function renderModalRoles() {

    if (!rolesModalList) {
        console.error("❌ rolesModalList introuvable !");
        return;
    }

    rolesModalList.innerHTML = "";

    roles
        .filter(role => role.name !== "ADMIN")
        .forEach((role, index) => {

            const roleBtn = document.createElement("button");

            roleBtn.type = "button";
            roleBtn.className = "role-modal-item";

            roleBtn.innerHTML = `
                <span>${role.name}</span>
                <span class="role-arrow">›</span>
            `;

            roleBtn.addEventListener("click", async () => {

                document
                    .querySelectorAll(".role-modal-item")
                    .forEach(btn => btn.classList.remove("active"));

                roleBtn.classList.add("active");

                selectedRole = role.id;

                if (selectedRoleLabel) {
                    selectedRoleLabel.textContent = role.name;
                }

                await loadPermissions(role.id);
            });

            rolesModalList.appendChild(roleBtn);

            // sélectionner automatiquement le premier rôle
            if (index === 0) {
                roleBtn.click();
            }
        });
}
async function loadPermissions(roleId){

    const permissionsResponse = await fetch(
        "http://localhost:5000/api/permissions"
    );

    const allPermissions = await permissionsResponse.json();

    const roleResponse = await fetch(
        `http://localhost:5000/api/roles/${roleId}/permissions`
    );

    const rolePermissions = await roleResponse.json();

    permissions = allPermissions.map(permission => ({

        ...permission,
allowed: rolePermissions.some(
    p => p.permission_id === permission.id
)

    }));

    renderPermissions();

}
function renderPermissions() {

    const permissionsList = document.getElementById("permissionsList");

    if (!permissionsList) {
        console.error("permissionsList introuvable");
        return;
    }

    permissionsList.innerHTML = "";

    permissions.forEach(permission => {

        const label = document.createElement("label");

        label.innerHTML = `
            <input
                type="checkbox"
                data-id="${permission.id}"
                ${permission.allowed ? "checked" : ""}
            >
            ${permission.label}
        `;

        permissionsList.appendChild(label);
    });

    if (selectAllPermissions) {
        selectAllPermissions.checked =
            permissions.length > 0 &&
            permissions.every(p => p.allowed);
    }
}
// =========================================
// Enregistrer les permissions du rôle
// =========================================

if (savePermissionsBtn) {

    savePermissionsBtn.addEventListener("click", async () => {

        // Vérifier qu'un rôle est sélectionné
        if (!selectedRole) {
            showToast("Veuillez sélectionner un rôle.", true);
            return;
        }

        // Récupérer toutes les permissions cochées
        const checkedPermissions = Array.from(
            document.querySelectorAll(
                "#permissionsList input[type='checkbox']:checked"
            )
        ).map(input => Number(input.dataset.id));

        console.log("Rôle sélectionné :", selectedRole);
        console.log("Permissions sélectionnées :", checkedPermissions);

        // Éviter les doubles clics
        const originalText = savePermissionsBtn.textContent;

        savePermissionsBtn.disabled = true;
        savePermissionsBtn.textContent = "Enregistrement...";

        try {

            const response = await fetch(
                `${ROLE_API}/${selectedRole}/permissions`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        permissions: checkedPermissions
                    })
                }
            );

            // Lire la réponse même si le serveur renvoie une erreur
            const text = await response.text();

            console.log("Réponse API :", response.status, text);

            if (!response.ok) {
                throw new Error(
                    `Erreur ${response.status}: ${text}`
                );
            }

            // Succès
            showToast("Permissions enregistrées avec succès.");

            // Recharger les permissions depuis la BDD
            await loadPermissions(selectedRole);

        } catch (error) {

            console.error(
                "Erreur lors de l'enregistrement des permissions :",
                error
            );

            showToast(
                "Impossible d'enregistrer les permissions.",
                true
            );

        } finally {

            savePermissionsBtn.disabled = false;
            savePermissionsBtn.textContent = originalText;

        }

    });

}
const rolesTabButton = document.querySelector(
    '.tab-btn[data-tab="roles"]'
);

if (rolesTabButton) {

    rolesTabButton.addEventListener("click", async () => {

        // Réinitialise l'état pendant le chargement
        selectedRole = null;
        selectedRoleLabel.textContent = "Sélectionnez un rôle";
        permissionsList.innerHTML = "";

        // Charge les rôles (renderModalRoles() sélectionne
        // automatiquement le premier rôle et ses permissions)
        await loadRoles();

    });

}

// =========================================
// Tout sélectionner (permissions)
// =========================================

if (selectAllPermissions) {

    selectAllPermissions.addEventListener("change", () => {

        const checked = selectAllPermissions.checked;

        document
            .querySelectorAll("#permissionsList input[type='checkbox']")
            .forEach(input => {
                input.checked = checked;
            });

    });

}
async function loadRolesForUserForm() {

    if (!roleSelect) return;

    roleSelect.innerHTML = `
        <option value="">Sélectionner un rôle</option>
    `;

    try {

        const response = await fetch(ROLE_API);

        if (!response.ok) {
            throw new Error("Impossible de charger les rôles");
        }

        const rolesData = await response.json();

        rolesData
            .forEach(role => {

                const option = document.createElement("option");

                option.value = role.name;
                option.textContent = role.name;

                roleSelect.appendChild(option);

            });

    } catch (error) {

        console.error("Erreur chargement rôles :", error);

        roleSelect.innerHTML = `
            <option value="">Erreur de chargement</option>
        `;

    }
}

// =========================================
// Initialisation
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    loadUsers();
    loadRoles();
});