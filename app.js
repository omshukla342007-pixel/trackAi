// PESU ECE 3rd Sem AI Day-by-Day Neural Engine v4.0

let masterSchedule = {}; // Stores day-by-day plan keyed by "YYYY-MM-DD"
let userProfile = {};

document.addEventListener("DOMContentLoaded", function () {
    // Set default log date to tomorrow (Day 1)
    const tomorrow = getTomorrowDateStr();
    document.getElementById("log-date").value = tomorrow;

    calculateCountdown();
    
    // Check if profile exists, otherwise open modal
    const savedProfile = localStorage.getItem("pesu_ece_profile_v4");
    const savedSchedule = localStorage.getItem("pesu_ece_schedule_v4");

    if (savedProfile && savedSchedule) {
        userProfile = JSON.parse(savedProfile);
        masterSchedule = JSON.parse(savedSchedule);
        document.getElementById("ai-modal").classList.add("hidden");
        renderDayByDaySchedule();
    } else {
        document.getElementById("ai-modal").classList.remove("hidden");
    }
});

function getTomorrowDateStr() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
}

function calculateCountdown() {
    const today = new Date();
    const isaDate = new Date(2026, 10, 21); // Nov 21, 2026
    const esaDate = new Date(2026, 11, 2);  // Dec 2, 2026
    const backlogDate = new Date(2026, 11, 31); // Dec 31, 2026

    const diff = (target) => Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    document.getElementById("cd-isa").innerText = `Nov 21 (${diff(isaDate)}d)`;
    document.getElementById("cd-esa").innerText = `Dec 02 (${diff(esaDate)}d)`;
    document.getElementById("cd-backlog").innerText = `Dec 31 (${diff(backlogDate)}d)`;
}

// Multi-step Wizard Navigation
function nextWizardStep(step) {
    document.getElementById("wizard-step-1").classList.add("hidden");
    document.getElementById("wizard-step-2").classList.add("hidden");
    document.getElementById("wizard-step-3").classList.add("hidden");

    document.getElementById(`wizard-step-${step}`).classList.remove("hidden");
    document.getElementById("modal-step-tag").innerText = `Step ${step} of 3`;
}

function reopenQuestionnaire() {
    document.getElementById("ai-modal").classList.remove("hidden");
    nextWizardStep(1);
}

// Complete Questionnaire & Build Day 1 -> Dec 31 Schedule
function finishOnboarding() {
    userProfile = {
        strong: document.getElementById("q-strong").value || "Digital Logic & Networks",
        weak: document.getElementById("q-weak").value || "Signals & Systems, Analog Circuits",
        backlogs: document.getElementById("q-backlog-names").value || "3 Backlog Subjects",
        hours: parseFloat(document.getElementById("q-daily-hours").value) || 3.5,
        window: document.getElementById("q-time-window").value
    };

    localStorage.setItem("pesu_ece_profile_v4", JSON.stringify(userProfile));
    
    generateMasterDayByDaySchedule();
    
    document.getElementById("ai-modal").classList.add("hidden");
}

// Generate Day-by-Day Plans From Day 1 (Oct 28) to Dec 31
function generateMasterDayByDaySchedule() {
    masterSchedule = {};

    const startDate = new Date(2026, 9, 28); // Oct 28, 2026 (Tomorrow)
    const endDate = new Date(2026, 11, 31);  // Dec 31, 2026

    let curr = new Date(startDate);

    const weakTopics = userProfile.weak.split(",");
    const strongTopics = userProfile.strong.split(",");
    const backlogTopics = userProfile.backlogs.split(",");

    let dayCount = 1;

    while (curr <= endDate) {
        const dateKey = curr.toISOString().split("T")[0];
        
        // Pick rotating topics
        const isaTopic = weakTopics[(dayCount - 1) % weakTopics.length].trim() + " (Units 3 & 4)";
        const esaTopic = strongTopics[(dayCount - 1) % strongTopics.length].trim() + " (Syllabus Synthesis)";
        const backlogTopic = backlogTopics[(dayCount - 1) % backlogTopics.length].trim() + " (Problem Set)";

        masterSchedule[dateKey] = {
            dayNum: dayCount,
            dateDisplay: curr.toDateString(),
            energy: 7,
            hours: userProfile.hours,
            disruption: "",
            isa: { title: isaTopic, duration: (userProfile.hours * 0.45).toFixed(1) },
            esa: { title: esaTopic, duration: (userProfile.hours * 0.35).toFixed(1) },
            backlog: { title: backlogTopic, duration: (userProfile.hours * 0.20).toFixed(1) },
            modified: false
        };

        curr.setDate(curr.getDate() + 1);
        dayCount++;
    }

    localStorage.setItem("pesu_ece_schedule_v4", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();
}

// Render All Days in Right Sidebar
function renderDayByDaySchedule() {
    const container = document.getElementById("day-by-day-container");
    container.innerHTML = "";

    const keys = Object.keys(masterSchedule).sort();
    document.getElementById("total-days-badge").innerText = `${keys.length} Days Planned`;

    keys.forEach(dateKey => {
        const day = masterSchedule[dateKey];
        
        const card = document.createElement("div");
        card.className = `p-4 bg-[#030712] border ${day.modified ? 'border-amber-500/60' : 'border-slate-800'} rounded-xl space-y-2 relative`;

        card.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-mono bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">Day ${day.dayNum}</span>
                    <h4 class="text-xs font-bold text-white font-mono">${day.dateDisplay}</h4>
                    ${day.modified ? '<span class="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 font-mono">Recalibrated</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 font-mono"><i class="fa-solid fa-clock text-slate-500"></i> ${day.hours}h</span>
                    <button onclick="openEditModal('${dateKey}')" class="text-xs text-amber-400 hover:text-amber-300 font-mono border border-amber-800/60 px-2 py-0.5 rounded bg-amber-950/40">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </div>
            </div>

            <!-- Parallel 3 Targets Active -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
                <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                    <span class="text-[10px] text-amber-400 font-mono font-bold uppercase">ISA 2 Target (${day.isa.duration}h)</span>
                    <p class="font-medium text-slate-200 mt-0.5">${day.isa.title}</p>
                </div>
                <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                    <span class="text-[10px] text-red-400 font-mono font-bold uppercase">ESA Target (${day.esa.duration}h)</span>
                    <p class="font-medium text-slate-200 mt-0.5">${day.esa.title}</p>
                </div>
                <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                    <span class="text-[10px] text-emerald-400 font-mono font-bold uppercase">Backlogs (${day.backlog.duration}h)</span>
                    <p class="font-medium text-slate-200 mt-0.5">${day.backlog.title}</p>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Recalibrate Specific Day Based on Energy/Disruption
function recalibrateDay() {
    const dateKey = document.getElementById("log-date").value;
    
    if (!masterSchedule[dateKey]) {
        alert("Selected date is outside the active range (Oct 28 - Dec 31).");
        return;
    }

    const energy = parseInt(document.getElementById("log-energy").value);
    const disruption = document.getElementById("log-disruption").value.trim();

    let day = masterSchedule[dateKey];
    day.energy = energy;
    day.disruption = disruption;
    day.modified = true;

    if (energy <= 4) {
        day.hours = (userProfile.hours * 0.5).toFixed(1);
        day.isa.title += " (Light Formula & Summary)";
        day.esa.title += " (Flashcards)";
        day.backlog.title += " (Concept Review)";
    } else if (disruption.length > 0) {
        day.hours = (userProfile.hours * 0.7).toFixed(1);
        day.isa.title += ` [Adjusted for: ${disruption}]`;
    }

    day.isa.duration = (day.hours * 0.45).toFixed(1);
    day.esa.duration = (day.hours * 0.35).toFixed(1);
    day.backlog.duration = (day.hours * 0.20).toFixed(1);

    localStorage.setItem("pesu_ece_schedule_v4", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();

    alert(`Day ${day.dayNum} (${dateKey}) recalibrated without shifting your final deadlines!`);
}

// Manual Day Modal Editing
function openEditModal(dateKey) {
    const day = masterSchedule[dateKey];
    document.getElementById("edit-date-key").value = dateKey;
    document.getElementById("edit-date-display").value = `Day ${day.dayNum} - ${day.dateDisplay}`;
    document.getElementById("edit-isa-topic").value = day.isa.title;
    document.getElementById("edit-esa-topic").value = day.esa.title;
    document.getElementById("edit-backlog-topic").value = day.backlog.title;

    document.getElementById("edit-day-modal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("edit-day-modal").classList.add("hidden");
}

function saveManualDayEdit() {
    const dateKey = document.getElementById("edit-date-key").value;
    let day = masterSchedule[dateKey];

    day.isa.title = document.getElementById("edit-isa-topic").value;
    day.esa.title = document.getElementById("edit-esa-topic").value;
    day.backlog.title = document.getElementById("edit-backlog-topic").value;
    day.modified = true;

    localStorage.setItem("pesu_ece_schedule_v4", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();
    closeEditModal();
}
