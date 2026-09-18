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

const campaignFilter =
    document.getElementById("campaignFilter");

const previewOverlay =
    document.getElementById("previewOverlay");

const previewModal =
    document.getElementById("previewModal");

const previewTitle =
    document.getElementById("previewTitle");

const previewCampaign =
    document.getElementById("previewCampaign");

const previewBody =
    document.getElementById("previewBody");

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

const questionDeterminative =
    document.getElementById("questionDeterminative");

const branchingEditor =
    document.getElementById("branchingEditor");

const branchingList =
    document.getElementById("branchingList");
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


        const params =
            new URLSearchParams(window.location.search);

        const editId =
            params.get("edit");

        if (editId) {

            editSurvey(Number(editId));

        }

    }
);


// =====================================================
// EVENTS
// =====================================================

function bindEvents() {


    document
        .getElementById("closePreview")
        .addEventListener(
            "click",
            closePreview
        );


    previewOverlay
        .addEventListener(
            "click",
            closePreview
        );


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
questionDeterminative
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


    campaignFilter
        .addEventListener(
            "change",
            renderSurveys
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

        campaignFilter.innerHTML = `
            <option value="">
                Toutes les campagnes
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


            const filterOption =
                document.createElement("option");

            filterOption.value =
                campaign.id;

            filterOption.textContent =
                campaign.title;

            campaignFilter.appendChild(filterOption);

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
            `${API_URL}/questionnaires`,
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


    const filterId =
        campaignFilter.value;

    const filteredSurveys =
        filterId
            ? surveys.filter(
                s => Number(s.campaign_id) === Number(filterId)
            )
            : surveys;


    if (!filteredSurveys.length) {

        emptyState.classList.remove("hidden");

        return;

    }


    emptyState.classList.add("hidden");


    filteredSurveys.forEach(survey => {

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
                    data-view="${survey.id}"
                >
                    Voir
                </button>

                <button
                    data-edit="${survey.id}"
                >
                    Modifier
                </button>

                <button
                    class="danger-btn"
                    data-delete="${survey.id}"
                >
                    Supprimer
                </button>

            </div>
        `;


        surveyList.appendChild(card);

    });


    document
        .querySelectorAll("[data-view]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    previewSurvey(
                        Number(
                            button.dataset.view
                        )
                    );

                }
            );

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


    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.delete);

                    deleteSurvey(id);

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

    determinative:
        false,

    options: [],

    branching: []

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


questionDeterminative.checked =
    question.determinative === true;


renderOptions(
    question
);

renderBranching(
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

    question.determinative =
    questionDeterminative.checked;
if (
    question.determinative &&
    currentPageIndex >= 0
) {

    pages[currentPageIndex]
        .questions
        .forEach(otherQuestion => {

            if (
                otherQuestion.id !==
                question.id
            ) {

                otherQuestion.determinative =
                    false;

            }

        });

}
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
                            question.branching =
    Array.isArray(question.branching)
        ? question.branching
        : [];

const existingRule =
    question.branching.find(
        rule =>
            rule.value ===
            question.options[index].value
    );

if (!existingRule) {

    question.branching.push({

        value:
            question.options[index].value,

        targetPageId:
            null

    });

}

renderBranching(
    question
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
                    if (Array.isArray(question.branching)) {

    question.branching =
        question.branching.filter(
            rule =>
                rule.value !==
                option.value
        );

}

                    renderOptions(
                        question
                    );

                }
            );

        });

}

// =====================================================
// RENDER BRANCHING
// =====================================================

function renderBranching(question) {

    if (!question) {
        branchingEditor.classList.add("hidden");
        return;
    }


    const canBranch =
        question.determinative === true &&
        question.type === "single_choice" &&
        Array.isArray(question.options) &&
        question.options.length > 0;


    if (!canBranch) {

        branchingEditor.classList.add(
            "hidden"
        );

        branchingList.innerHTML = "";

        return;

    }


    branchingEditor.classList.remove(
        "hidden"
    );


    if (!Array.isArray(question.branching)) {

        question.branching = [];

    }


    branchingList.innerHTML = "";


    question.options.forEach(
        option => {

            let rule =
                question.branching.find(
                    r =>
                        String(r.value) ===
                        String(option.value)
                );


            if (!rule) {

                rule = {

                    value:
                        option.value,

                    targetPageId:
                        null

                };


                question.branching.push(
                    rule
                );

            }


            const row =
                document.createElement("div");


            row.className =
                "branching-row";


            const label =
                document.createElement("div");


            label.className =
                "branching-answer";


            label.textContent =
                `Si réponse = ${option.label}`;


            const select =
                document.createElement("select");


            select.className =
                "branching-target";


            select.innerHTML = `

                <option value="">
                    Choisir une page
                </option>

            `;


            pages.forEach(
                (page, pageIndex) => {

                    /*
                     * On évite de proposer
                     * la page actuelle comme destination.
                     */

                    if (
                        pageIndex ===
                        currentPageIndex
                    ) {

                        return;

                    }


                    const pageOption =
                        document.createElement("option");


                    pageOption.value =
                        page.id;


                    pageOption.textContent =
                        page.title;


                    if (
                        rule.targetPageId ===
                        page.id
                    ) {

                        pageOption.selected =
                            true;

                    }


                    select.appendChild(
                        pageOption
                    );

                }
            );


            select.addEventListener(
                "change",
                event => {

                    rule.targetPageId =
                        event.target.value ||
                        null;

                }
            );


            row.appendChild(label);

            row.appendChild(select);


            branchingList.appendChild(row);

        }
    );

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


   const value =
    `option_${question.options.length + 1}`;


question.options.push({

    value,

    label:
        `Option ${question.options.length + 1}`

});


if (!Array.isArray(question.branching)) {

    question.branching = [];

}


question.branching.push({

    value,

    targetPageId:
        null

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
                `${API_URL}/questionnaires`,
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
// PREVIEW SURVEY (READ-ONLY)
// =====================================================

async function previewSurvey(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/questionnaires/${id}`,
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


        const campaign =
            campaigns.find(
                c => Number(c.id) === Number(survey.campaign_id)
            );


        previewTitle.textContent =
            survey.title || "Sans titre";

        previewCampaign.textContent =
            campaign
                ? campaign.title
                : "Campagne inconnue";


        const pages =
            survey.survey_json?.pages ||
            [];


        if (!pages.length) {

            previewBody.innerHTML = `
                <div class="preview-empty">
                    Ce questionnaire ne contient aucune page.
                </div>
            `;

        }

        else {

            previewBody.innerHTML =
                pages
                    .map(renderPreviewPage)
                    .join("");

        }


        previewOverlay.classList.add("show");
        previewModal.classList.add("open");

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


function renderPreviewPage(page, index) {

    const questions =
        page.questions || [];


    const questionsHtml =
        questions.length
            ? questions.map(renderPreviewQuestion).join("")
            : `<div class="preview-empty">Aucune question sur cette page.</div>`;


    return `
        <div class="preview-page">

            <h3 class="preview-page-title">
                ${escapeHtml(
                    page.title ||
                    `Page ${index + 1}`
                )}
            </h3>

            ${questionsHtml}

        </div>
    `;

}


function renderPreviewQuestion(question) {

    const optionsHtml =
        Array.isArray(question.options) &&
        question.options.length
            ? `
                <div class="preview-q-options">
                    ${question.options
                        .map(option =>
                            `<span>${escapeHtml(option)}</span>`
                        )
                        .join("")}
                </div>
            `
            : "";


    return `
        <div class="preview-question">

            <div class="preview-q-label">
                ${escapeHtml(
                    question.label ||
                    "Sans intitulé"
                )}
                ${
                    question.required
                        ? '<span class="req">*</span>'
                        : ""
                }
            </div>

            <div class="preview-q-type">
                ${getQuestionTypeLabel(question.type)}
            </div>

            ${optionsHtml}

        </div>
    `;

}


function closePreview() {

    previewOverlay.classList.remove("show");
    previewModal.classList.remove("open");

}


// =====================================================
// DELETE SURVEY
// =====================================================

async function deleteSurvey(id) {

    const confirmed = confirm(
        "Supprimer définitivement ce questionnaire ? Cette action est irréversible."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/questionnaires/${id}`,
                {
                    method: "DELETE",
                    headers:
                        getAuthHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Erreur lors de la suppression."
            );

        }

        await loadSurveys();

    }

    catch (error) {

        console.error(
            "Erreur suppression :",
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
                `${API_URL}/questionnaires/${id}`,
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