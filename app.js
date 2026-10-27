// PESU ECE 3rd Sem AI Adaptive Day Engine v5.0

let masterSchedule = {};
let userProfile = {};

document.addEventListener("DOMContentLoaded", function () {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("log-date").value = tomorrow.toISOString().split("T")[0];

    const savedProfile = localStorage.getItem("pesu_ece_profile_v5");
    const savedSchedule = localStorage.getItem("pesu_ece_schedule_v5");

    if (savedProfile && savedSchedule) {
        userProfile = JSON.parse(savedProfile);
        masterSchedule = JSON.parse(savedSchedule);
        document.getElementById("ai-modal").classList.add("hidden");
        renderDayByDaySchedule();
    } else {
        document.getElementById("ai-modal").classList.remove("hidden");
    }
});

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

function finishOnboarding() {
    userProfile = {
        strong: document.getElementById("q-strong").value || "Digital Logic, Tech Writing",
        weak: document.getElementById("q-weak").value || "Maths for ECE, Analog Circuits, Signals & Systems",
        backlogs: document.getElementById("q-backlog-names").value || "3 Backlog Subjects",
        hours: parseFloat(document.getElementById("q-daily-hours").value) || 3.5
    };

    localStorage.setItem("pesu_ece_profile_v5", JSON.stringify(userProfile));
    generateMasterSchedule();
    document.getElementById("ai-modal").classList.add("hidden");
}

function generateMasterSchedule() {
    masterSchedule = {};

    const startDate = new Date(2026, 9, 28); // Oct 28, 2026
    const isaEndDate = new Date(2026, 10, 28); // Nov 28, 2026 (ISA 2 LWD)
    const endDate = new Date(2026, 11, 31);   // Dec 31, 2026

    let curr = new Date(startDate);
    let dayCount = 1;

    const weakTopics = userProfile.weak.split(",");
    const strongTopics = userProfile.strong.split(",");
    const backlogTopics = userProfile.backlogs.split(",");

    while (curr <= endDate) {
        const dateKey = curr.toISOString().split("T")[0];
        const month = curr.getMonth(); // 10 = Nov, 11 = Dec
        const dateNum = curr.getDate();

        let isTravel = (month === 10 && (dateNum === 6 || dateNum === 10));
        let isHoliday = (month === 10 && (dateNum === 9 || dateNum === 10)); // Deepavali
        let isISA2Week = (month === 10 && dateNum >= 23 && dateNum <= 28);
        let postISA2 = curr > isaEndDate;

        let dailyHours = isTravel ? 1.5 : userProfile.hours;

        let isaTitle = weakTopics[(dayCount - 1) % weakTopics.length].trim() + " (Units 3 & 4)";
        let esaTitle = strongTopics[(dayCount - 1) % strongTopics.length].trim() + " (Syllabus Prep)";
        let backlogTitle = backlogTopics[(dayCount - 1) % backlogTopics.length].trim() + " (Problem Drill)";

        if (isTravel) {
            isaTitle = "TRAVEL DAY: Formula Flashcards Only";
            esaTitle = "Light Review";
            backlogTitle = "Rest / Buffer";
        } else if (isISA2Week) {
            isaTitle = `ISA 2 EXAM SPRINT: ${weakTopics[(dayCount) % weakTopics.length].trim()}`;
        }

        // Sequential Goal Sunset Rule:
        // After Nov 28, ISA 2 Goal vanishes and its time is re-allocated to ESA + Backlogs
        if (postISA2) {
            masterSchedule[dateKey] = {
                dayNum: dayCount,
                dateDisplay: curr.toDateString(),
                hours: dailyHours,
                postISA: true,
                isTravel: isTravel,
                block1: { label: "ESA PREP (Re-Allocated ISA Time)", title: esaTitle, duration: (dailyHours * 0.65).toFixed(1) },
                block2: { label: "BACKLOG FOCUS", title: backlogTopic, duration: (dailyHours * 0.35).toFixed(1) }
            };
        } else {
            masterSchedule[dateKey] = {
                dayNum: dayCount,
                dateDisplay: curr.toDateString(),
                hours: dailyHours,
                postISA: false,
                isTravel: isTravel,
                block1: { label: "ISA 2 FOCUS", title: isaTitle, duration: (dailyHours * 0.45).toFixed(1) },
                block2: { label: "ESA PREP", title: esaTitle, duration: (dailyHours * 0.35).toFixed(1) },
                block3: { label: "BACKLOGS", title: backlogTitle, duration: (dailyHours * 0.20).toFixed(1) }
            };
        }

        curr.setDate(curr.getDate() + 1);
        dayCount++;
    }

    localStorage.setItem("pesu_ece_schedule_v5", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();
}

function renderDayByDaySchedule() {
    const container = document.getElementById("day-by-day-container");
    container.innerHTML = "";

    const keys = Object.keys(masterSchedule).sort();
    document.getElementById("total-days-badge").innerText = `${keys.length} Days Active`;

    keys.forEach(dateKey => {
        const day = masterSchedule[dateKey];
        const card = document.createElement("div");

        card.className = `p-4 bg-[#030712] border ${day.isTravel ? 'border-amber-500' : 'border-slate-800'} rounded-xl space-y-2 relative`;

        let blocksHtml = "";
        if (day.postISA) {
            blocksHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div class="p-2 bg-[#0b0f19] rounded border border-red-900/40">
                        <span class="text-[10px] text-red-400 font-mono font-bold uppercase">${day.block1.label} (${day.block1.duration}h)</span>
                        <p class="font-medium text-slate-200 mt-0.5">${day.block1.title}</p>
                    </div>
                    <div class="p-2 bg-[#0b0f19] rounded border border-emerald-900/40">
                        <span class="text-[10px] text-emerald-400 font-mono font-bold uppercase">${day.block2.label} (${day.block2.duration}h)</span>
                        <p class="font-medium text-slate-200 mt-0.5">${day.block2.title}</p>
                    </div>
                </div>
            `;
        } else {
            blocksHtml = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
                    <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                        <span class="text-[10px] text-amber-400 font-mono font-bold uppercase">${day.block1.label} (${day.block1.duration}h)</span>
                        <p class="font-medium text-slate-200 mt-0.5">${day.block1.title}</p>
                    </div>
                    <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                        <span class="text-[10px] text-red-400 font-mono font-bold uppercase">${day.block2.label} (${day.block2.duration}h)</span>
                        <p class="font-medium text-slate-200 mt-0.5">${day.block2.title}</p>
                    </div>
                    <div class="p-2 bg-[#0b0f19] rounded border border-slate-800">
                        <span class="text-[10px] text-emerald-400 font-mono font-bold uppercase">${day.block3.label} (${day.block3.duration}h)</span>
                        <p class="font-medium text-slate-200 mt-0.5">${day.block3.title}</p>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-mono bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold">Day ${day.dayNum}</span>
                    <h4 class="text-xs font-bold text-white font-mono">${day.dateDisplay}</h4>
                    ${day.isTravel ? '<span class="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-mono font-bold"><i class="fa-solid fa-plane"></i> TRAVEL DAY</span>' : ''}
                    ${day.postISA ? '<span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">ISA 2 Goal Complete</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 font-mono">${day.hours}h</span>
                    <button onclick="openEditModal('${dateKey}')" class="text-xs text-amber-400 border border-amber-800 px-2 py-0.5 rounded bg-amber-950/40 font-mono">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                </div>
            </div>
            ${blocksHtml}
        `;

        container.appendChild(card);
    });
}

function recalibrateDay() {
    const dateKey = document.getElementById("log-date").value;
    if (!masterSchedule[dateKey]) {
        alert("Date outside active schedule range.");
        return;
    }

    const energy = parseInt(document.getElementById("log-energy").value);
    const disruption = document.getElementById("log-disruption").value.trim();

    let day = masterSchedule[dateKey];
    if (energy <= 4) {
        day.hours = (userProfile.hours * 0.5).toFixed(1);
        day.block1.title += " (Light Revision)";
    } else if (disruption.length > 0) {
        day.block1.title += ` [Disruption: ${disruption}]`;
    }

    localStorage.setItem("pesu_ece_schedule_v5", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();
    alert(`Recalibrated Day ${day.dayNum} (${dateKey})!`);
}

function openEditModal(dateKey) {
    const day = masterSchedule[dateKey];
    document.getElementById("edit-date-key").value = dateKey;
    document.getElementById("edit-date-display").value = `Day ${day.dayNum} - ${day.dateDisplay}`;
    document.getElementById("edit-p1-topic").value = day.block1.title;
    document.getElementById("edit-p2-topic").value = day.block2.title;
    document.getElementById("edit-day-modal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("edit-day-modal").classList.add("hidden");
}

function saveManualDayEdit() {
    const dateKey = document.getElementById("edit-date-key").value;
    let day = masterSchedule[dateKey];

    day.block1.title = document.getElementById("edit-p1-topic").value;
    day.block2.title = document.getElementById("edit-p2-topic").value;

    localStorage.setItem("pesu_ece_schedule_v5", JSON.stringify(masterSchedule));
    renderDayByDaySchedule();
    closeEditModal();
}
