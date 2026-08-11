// =====================================================
// QUESTIONNAIRES
// =====================================================

const API_URL = "http://localhost:5000/api";


// =====================================================
// USER
// =====================================================

const user = JSON.parse(
    localStorage.getItem("user")
);


// =====================================================
// STATE
// =====================================================

let surveys = [];

let campaigns = [];

let pages = [];

let currentPageIndex = -1;

let selectedQuestionId = null;


// =====================================================
// DOM
// =====================================================

const surveyListView =
    document.getElementById("surveyListView");

const builderView =
    document.getElementById("builderView");

const surveyList =
    document.getElementById("surveyList");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const campaignSelect =
    document.getElementById("campaignSelect");

const surveyTitle =
    document.getElementById("surveyTitle");

const pagesList =
    document.getElementById("pagesList");

const questionsList =
    document.getElementById("questionsList");

const pageEditor =
    document.getElementById("pageEditor");

const pageEditorEmpty =
    document.getElementById("pageEditorEmpty");

const propertiesEmpty =
    document.getElementById("propertiesEmpty");

const questionProperties =
    document.getElementById("questionProperties");

const questionText =
    document.getElementById("questionText");

const questionType =
    document.getElementById("questionType");

const questionRequired =
    document.getElementById("questionRequired");

const optionsEditor =
    document.getElementById("optionsEditor");

const optionsList =
    document.getElementById("optionsList");


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!user) {

            window.location.href =
                "../login/index.html";

            return;

        }

        await loadCampaigns();

        await loadSurveys();

        bindEvents();

    }
);


// =====================================================
// EVENTS
// =====================================================

function bindEvents() {


    document
        .getElementById("createSurveyBtn")
        .addEventListener(
            "click",
            openBuilder
        );


    document
        .getElementById("emptyCreateBtn")
        .addEventListener(
            "click",
            openBuilder
        );


    document
        .getElementById("backToListBtn")
        .addEventListener(
            "click",
            closeBuilder
        );


    document
        .getElementById("addPageBtn")
        .addEventListener(
            "click",
            addPage
        );


    document
        .getElementById("deletePageBtn")
        .addEventListener(
            "click",
            deleteCurrentPage
        );


    document
        .getElementById("addQuestionBtn")
        .addEventListener(
            "click",
            addQuestion
        );


    document
        .getElementById("saveDraftBtn")
        .addEventListener(
            "click",
            saveSurvey
        );


    document
        .getElementById("pageTitle")
        .addEventListener(
            "input",
            updateCurrentPageTitle
        );


    questionText
        .addEventListener(
            "input",
            updateSelectedQuestion
        );


    questionType
        .addEventListener(
            "change",
            updateSelectedQuestion
        );


    questionRequired
        .addEventListener(
            "change",
            updateSelectedQuestion
        );


    document
        .getElementById("addOptionBtn")
        .addEventListener(
            "click",
            addOption
        );

}


// =====================================================
// LOAD CAMPAIGNS
// =====================================================

async function loadCampaigns() {

    try {

        const response = await fetch(
            `${API_URL}/campaigns`,
            {
                headers: getAuthHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                "Impossible de charger les campagnes"
            );

        }


        campaigns = await response.json();


        campaignSelect.innerHTML = `
            <option value="">
                Sélectionnez une campagne
            </option>
        `;


        campaigns.forEach(campaign => {

            const option =
                document.createElement("option");

            option.value =
                campaign.id;

            option.textContent =
                campaign.title;

            campaignSelect.appendChild(option);

        });


    }

    catch (error) {

        console.error(
            "Erreur campagnes :",
            error
        );

    }

}


// =====================================================
// LOAD SURVEYS
// =====================================================

async function loadSurveys() {

    try {

        loading.classList.remove("hidden");

        emptyState.classList.add("hidden");


        const response = await fetch(
            `${API_URL}/surveys`,
            {
                headers: getAuthHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                "Erreur chargement questionnaires"
            );

        }


        surveys = await response.json();


        renderSurveys();

    }

    catch (error) {

        console.error(
            "Erreur questionnaires :",
            error
        );

    }

    finally {

        loading.classList.add("hidden");

    }

}


// =====================================================
// RENDER SURVEYS
// =====================================================

function renderSurveys() {

    surveyList.innerHTML = "";


    if (!surveys.length) {

        emptyState.classList.remove("hidden");

        return;

    }


    emptyState.classList.add("hidden");


    surveys.forEach(survey => {

        const campaign =
            campaigns.find(
                c => Number(c.id) === Number(survey.campaign_id)
            );


        const card =
            document.createElement("div");

        card.className =
            "survey-card";


        card.innerHTML = `

            <div class="survey-icon">
                ?
            </div>

            <h3>
                ${escapeHtml(survey.title || "Sans titre")}
            </h3>

            <p>
                ${
                    campaign
                        ? escapeHtml(campaign.title)
                        : "Campagne inconnue"
                }
            </p>

            <div class="survey-meta">

                <span>
                    ${countPages(survey)} page(s)
                </span>

                <span>
                    ${formatDate(survey.created_at)}
                </span>

            </div>

            <div class="survey-actions">

                <button
                    data-edit="${survey.id}"
                >
                    Modifier
                </button>

            </div>
        `;


        surveyList.appendChild(card);

    });


    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.edit);

                    editSurvey(id);

                }
            );

        });

}


// =====================================================
// OPEN BUILDER
// =====================================================

function openBuilder() {

    surveyListView.classList.add("hidden");

    builderView.classList.remove("hidden");


    pages = [];

    currentPageIndex = -1;

    selectedQuestionId = null;


    surveyTitle.value = "";

    campaignSelect.value = "";


    renderPages();

    showEmptyEditor();

}


// =====================================================
// CLOSE BUILDER
// =====================================================

function closeBuilder() {

    builderView.classList.add("hidden");

    surveyListView.classList.remove("hidden");

}


// =====================================================
// ADD PAGE
// =====================================================

function addPage() {

    if (pages.length >= 10) {

        alert(
            "Un questionnaire peut contenir au maximum 10 pages."
        );

        return;

    }


    const pageNumber =
        pages.length + 1;


    const page = {

        id:
            `page_${Date.now()}`,

        title:
            `Page ${pageNumber}`,

        questions: [],

        next: {

            default: null,

            rules: []

        }

    };


    pages.push(page);


    currentPageIndex =
        pages.length - 1;


    selectedQuestionId = null;


    renderPages();

    renderCurrentPage();

}


// =====================================================
// SELECT PAGE
// =====================================================

function selectPage(index) {

    currentPageIndex =
        index;

    selectedQuestionId =
        null;

    renderPages();

    renderCurrentPage();

}


// =====================================================
// RENDER PAGES
// =====================================================

function renderPages() {

    pagesList.innerHTML = "";


    pages.forEach(
        (page, index) => {

            const item =
                document.createElement("div");


            item.className =
                "page-item";


            if (
                index === currentPageIndex
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.innerHTML = `

                <span>
                    ${escapeHtml(page.title)}
                </span>

                <span>
                    ${page.questions.length}
                </span>

            `;


            item.addEventListener(
                "click",
                () => selectPage(index)
            );


            pagesList.appendChild(item);

        }
    );


    document
        .getElementById("pageCounter")
        .textContent =
            `${pages.length} / 10`;

}


// =====================================================
// RENDER CURRENT PAGE
// =====================================================

function renderCurrentPage() {

    if (currentPageIndex < 0) {

        showEmptyEditor();

        return;

    }


    pageEditorEmpty.classList.add(
        "hidden"
    );

    pageEditor.classList.remove(
        "hidden"
    );


    const page =
        pages[currentPageIndex];


    document
        .getElementById("currentPageTitle")
        .textContent =
            page.title;


    document
        .getElementById("pageTitle")
        .value =
            page.title;


    renderQuestions();


    hideProperties();

}


// =====================================================
// EMPTY EDITOR
// =====================================================

function showEmptyEditor() {

    pageEditor.classList.add(
        "hidden"
    );

    pageEditorEmpty.classList.remove(
        "hidden"
    );

    hideProperties();

}


// =====================================================
// DELETE PAGE
// =====================================================

function deleteCurrentPage() {

    if (currentPageIndex < 0) {
        return;
    }


    if (
        !confirm(
            "Supprimer cette page ?"
        )
    ) {

        return;

    }


    pages.splice(
        currentPageIndex,
        1
    );


    if (!pages.length) {

        currentPageIndex = -1;

    }

    else {

        currentPageIndex =
            Math.max(
                0,
                currentPageIndex - 1
            );

    }


    renderPages();

    renderCurrentPage();

}


// =====================================================
// UPDATE PAGE TITLE
// =====================================================

function updateCurrentPageTitle(event) {

    if (currentPageIndex < 0) {
        return;
    }


    const value =
        event.target.value.trim();


    pages[currentPageIndex].title =
        value || "Page";


    document
        .getElementById("currentPageTitle")
        .textContent =
            pages[currentPageIndex].title;


    renderPages();

}


// =====================================================
// ADD QUESTION
// =====================================================

function addQuestion() {

    if (currentPageIndex < 0) {

        alert(
            "Ajoutez d'abord une page."
        );

        return;

    }


    const question = {

        id:
            `q_${Date.now()}`,

        type:
            "text",

        label:
            "Nouvelle question",

        required:
            false,

        options: []

    };


    pages[currentPageIndex]
        .questions
        .push(question);


    selectedQuestionId =
        question.id;


    renderQuestions();

    showQuestionProperties(
        question
    );

}


// =====================================================
// RENDER QUESTIONS
// =====================================================

function renderQuestions() {

    questionsList.innerHTML = "";


    const page =
        pages[currentPageIndex];


    if (!page.questions.length) {

        questionsList.innerHTML = `

            <div class="empty-state">

                <h3>
                    Aucune question
                </h3>

                <p>
                    Ajoutez une question à cette page.
                </p>

            </div>

        `;

        return;

    }


    page.questions.forEach(
        (question, index) => {

            const card =
                document.createElement("div");


            card.className =
                "question-card";


            if (
                question.id ===
                selectedQuestionId
            ) {

                card.classList.add(
                    "selected"
                );

            }


            card.innerHTML = `

                <div class="question-number">

                    QUESTION ${index + 1}

                </div>

                <div class="question-text">

                    ${escapeHtml(
                        question.label ||
                        "Nouvelle question"
                    )}

                </div>

                <div class="question-type">

                    ${getQuestionTypeLabel(
                        question.type
                    )}

                    ${
                        question.required
                            ? " • Obligatoire"
                            : ""
                    }

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedQuestionId =
                        question.id;

                    renderQuestions();

                    showQuestionProperties(
                        question
                    );

                }
            );


            questionsList.appendChild(card);

        }
    );

}


// =====================================================
// QUESTION PROPERTIES
// =====================================================

function showQuestionProperties(
    question
) {

    propertiesEmpty.classList.add(
        "hidden"
    );

    questionProperties.classList.remove(
        "hidden"
    );


    questionText.value =
        question.label || "";


    questionType.value =
        question.type;


    questionRequired.checked =
        question.required;


    renderOptions(
        question
    );

}


// =====================================================
// HIDE PROPERTIES
// =====================================================

function hideProperties() {

    propertiesEmpty.classList.remove(
        "hidden"
    );

    questionProperties.classList.add(
        "hidden"
    );

}


// =====================================================
// GET SELECTED QUESTION
// =====================================================

function getSelectedQuestion() {

    if (
        currentPageIndex < 0 ||
        !selectedQuestionId
    ) {

        return null;

    }


    return pages[currentPageIndex]
        .questions
        .find(
            q =>
                q.id ===
                selectedQuestionId
        );

}


// =====================================================
// UPDATE QUESTION
// =====================================================

function updateSelectedQuestion() {

    const question =
        getSelectedQuestion();


    if (!question) {
        return;
    }


    question.label =
        questionText.value;


    question.type =
        questionType.value;


    question.required =
        questionRequired.checked;


    if (
        question.type === "single_choice" ||
        question.type === "multiple_choice"
    ) {

        if (!question.options.length) {

            question.options = [

                {
                    value: "option_1",
                    label: "Option 1"
                },

                {
                    value: "option_2",
                    label: "Option 2"
                }

            ];

        }

    }


    renderQuestions();

    renderOptions(
        question
    );

}


// =====================================================
// OPTIONS
// =====================================================

function renderOptions(
    question
) {

    const needsOptions =
        question &&
        (
            question.type ===
                "single_choice" ||

            question.type ===
                "multiple_choice"
        );


    if (!needsOptions) {

        optionsEditor.classList.add(
            "hidden"
        );

        return;

    }


    optionsEditor.classList.remove(
        "hidden"
    );


    optionsList.innerHTML = "";


    question.options.forEach(
        (option, index) => {

            const row =
                document.createElement("div");


            row.className =
                "option-row";


            row.innerHTML = `

                <input
                    type="text"
                    value="${escapeAttribute(
                        option.label
                    )}"
                    data-option-index="${index}"
                >

                <button
                    type="button"
                    class="remove-option"
                    data-remove-option="${index}"
                >
                    ×
                </button>

            `;


            optionsList.appendChild(row);

        }
    );


    optionsList
        .querySelectorAll(
            "[data-option-index]"
        )
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target
                                .dataset
                                .optionIndex
                        );


                    question.options[index]
                        .label =
                            event.target.value;


                    question.options[index]
                        .value =
                            slugify(
                                event.target.value
                            );

                }
            );

        });


    optionsList
        .querySelectorAll(
            "[data-remove-option]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset
                                .removeOption
                        );


                    question.options.splice(
                        index,
                        1
                    );


                    renderOptions(
                        question
                    );

                }
            );

        });

}


// =====================================================
// ADD OPTION
// =====================================================

function addOption() {

    const question =
        getSelectedQuestion();


    if (!question) {
        return;
    }


    question.options.push({

        value:
            `option_${question.options.length + 1}`,

        label:
            `Option ${question.options.length + 1}`

    });


    renderOptions(
        question
    );

}


// =====================================================
// SAVE SURVEY
// =====================================================

async function saveSurvey() {

    const title =
        surveyTitle.value.trim();


    const campaignId =
        campaignSelect.value;


    if (!title) {

        alert(
            "Veuillez donner un titre au questionnaire."
        );

        return;

    }


    if (!campaignId) {

        alert(
            "Veuillez sélectionner une campagne."
        );

        return;

    }


    if (!pages.length) {

        alert(
            "Ajoutez au moins une page."
        );

        return;

    }


    const surveyJson = {

        version: 1,

        pages: pages

    };


    try {

        const response =
            await fetch(
                `${API_URL}/surveys`,
                {

                    method: "POST",

                    headers: {

                        ...getAuthHeaders(),

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            campaign_id:
                                Number(
                                    campaignId
                                ),

                            title,

                            survey_json:
                                surveyJson

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Erreur lors de l'enregistrement"
            );

        }


        alert(
            "Questionnaire enregistré avec succès !"
        );


        closeBuilder();

        await loadSurveys();

    }

    catch (error) {

        console.error(
            "Erreur sauvegarde :",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================================
// EDIT SURVEY
// =====================================================

async function editSurvey(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/surveys/${id}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        const survey =
            await response.json();


        if (!response.ok) {

            throw new Error(
                survey.message ||
                "Erreur"
            );

        }


        surveyListView.classList.add(
            "hidden"
        );

        builderView.classList.remove(
            "hidden"
        );


        surveyTitle.value =
            survey.title || "";


        campaignSelect.value =
            survey.campaign_id;


        pages =
            survey.survey_json?.pages ||
            [];


        currentPageIndex =
            pages.length
                ? 0
                : -1;


        selectedQuestionId =
            null;


        renderPages();

        renderCurrentPage();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// =====================================================
// AUTH HEADERS
// =====================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("token");


    return {

        Authorization:
            `Bearer ${token}`

    };

}


// =====================================================
// HELPERS
// =====================================================

function countPages(survey) {

    return (
        survey.survey_json?.pages?.length
        || 0
    );

}


function formatDate(date) {

    if (!date) {
        return "-";
    }


    return new Date(
        date
    ).toLocaleDateString(
        "fr-FR"
    );

}


function getQuestionTypeLabel(type) {

    const labels = {

        text: "Texte",

        email: "Email",

        number: "Nombre",

        date: "Date",

        boolean: "Oui / Non",

        single_choice: "Choix unique",

        multiple_choice: "Choix multiple",

        rating: "Note"

    };


    return labels[type] || type;

}


function slugify(value) {

    return value
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "_"
        )
        .replace(
            /^_+|_+$/g,
            ""
        );

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}