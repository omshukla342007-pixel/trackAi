// PESU ECE 3rd Sem AI Adaptive Engine v5.1

let masterSchedule = {};
let userProfile = {};

document.addEventListener("DOMContentLoaded", function () {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById("log-date");
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split("T")[0];
    }

    try {
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
    } catch (e) {
        console.error("Initialization error:", e);
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
    const strongEl = document.getElementById("q-strong");
    const weakEl = document.getElementById("q-weak");
    const backlogEl = document.getElementById("q-backlog-names");
    const hoursEl = document.getElementById("q-daily-hours");

    userProfile = {
        strong: strongEl ? strongEl.value : "Computer Aided Digital Design, Tech Writing",
        weak: weakEl ? weakEl.value : "Maths for ECE, Analog Circuits, Signals & Systems",
        backlogs: backlogEl ? backlogEl.value : "Math 1, Network Theory, EDC",
        hours: hoursEl ? parseFloat(hoursEl.value) || 3.5 : 3.5
    };

    localStorage.setItem("pesu_ece_profile_v5", JSON.stringify(userProfile));
    
    generateMasterSchedule();
    
    document.getElementById("ai-modal").classList.add("hidden");
}

function generateMasterSchedule() {
    masterSchedule = {};

    const startDate = new Date(2026, 9, 28);   // Oct 28, 2026
    const isaEndDate = new Date(2026, 10, 28);  // Nov 28, 2026
    const endDate = new Date(2026, 11, 31);    // Dec 31, 2026

    let curr = new Date(startDate);
    let dayCount = 1;

    const weakTopics = userProfile.weak.split(",");
    const strongTopics = userProfile.strong.split(",");
    const backlogTopics = userProfile.backlogs.split(",");

    while (curr <= endDate) {
        const dateKey = curr.toISOString().split("T")[0];
        const month = curr.getMonth(); // 9 = Oct, 10 = Nov, 11 = Dec
        const dateNum = curr.getDate();

        let isTravel = (month === 10 && (dateNum === 6 || dateNum === 10));
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

        if (postISA2) {
            masterSchedule[dateKey] = {
                dayNum: dayCount,
                dateDisplay: curr.toDateString(),
                hours: dailyHours,
                postISA: true,
                isTravel: isTravel,
                block1: { label: "ESA PREP (Re-Allocated ISA Time)", title: esaTitle, duration: (dailyHours * 0.65).toFixed(1) },
                block2: { label: "BACKLOG FOCUS", title: backlogTitle, duration: (dailyHours * 0.35).toFixed(1) }
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
    if (!container) return;
    
    container.innerHTML = "";

    const keys = Object.keys(masterSchedule).sort();
    const badge = document.getElementById("total-days-badge");
    if (badge) badge.innerText = `${keys.length} Days Active`;

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
    const dateInput = document.getElementById("log-date");
    const dateKey = dateInput ? dateInput.value : "";
    
    if (!masterSchedule[dateKey]) {
        alert("Date outside active schedule range.");
        return;
    }

    const energyEl = document.getElementById("log-energy");
    const disruptionEl = document.getElementById("log-disruption");

    const energy = energyEl ? parseInt(energyEl.value) : 7;
    const disruption = disruptionEl ? disruptionEl.value.trim() : "";

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
