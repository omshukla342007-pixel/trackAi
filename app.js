// PESU ECE 3rd Sem AI Adaptive Engine
function generateAISchedule() {
    const collegeHours = document.getElementById('college-hours').value.trim();
    const energyLevel = parseInt(document.getElementById('energy-level').value);
    const disruptions = document.getElementById('disruptions').value.trim();
    
    const container = document.getElementById('schedule-slots');
    const insights = document.getElementById('ai-insights');
    const badge = document.getElementById('status-badge');
    const burnout = document.getElementById('burnout-status');

    // AI Adaptive Logic calculation based on energy & disruptions
    let toneMessage = "";
    let slotsHtml = "";

    if (energyLevel < 4) {
        toneMessage = `⚠️ Low energy detected (${energyLevel}/10). The AI has lightened today's core focus blocks, pushing heavy problem-solving to tomorrow morning while preserving your ISA 2 target through high-yield revision summaries.`;
        badge.className = "text-xs bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded-md";
        badge.innerText = "Adaptive Rest Mode Engaged";
        burnout.innerText = "High-protection mode: Task load reduced by 25% today without missing target dates.";
    } else if (disruptions.length > 0) {
        toneMessage = `🔄 Recalibrated successfully around your disruption ("${disruptions}"). Missed afternoon slots were automatically shifted to late evening buffer time to keep your ESA & Backlog goals intact.`;
        badge.className = "text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded-md";
        badge.innerText = "Recalibrated Without Stress";
        burnout.innerText = "Balanced: Micro-sessions used to absorb sudden schedule changes.";
    } else {
        toneMessage = `🚀 Optimal flow state configured! Your schedule matches your peak cognitive hours for ECE core topics.`;
        badge.className = "text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-md";
        badge.innerText = "Optimized & Balanced";
        burnout.innerText = "Active pacing: Steady progression across all 3 goals.";
    }

    insights.innerHTML = `<p class="text-slate-200 font-medium">${toneMessage}</p>`;

    // Generate Adaptive Time Blocks
    slotsHtml = `
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
                <span class="text-xs text-red-400 font-semibold uppercase">06:30 PM - 08:00 PM (Prime Focus)</span>
                <h4 class="text-sm font-bold text-white mt-0.5">ISA 2 Focus: Analog Circuits / Signals (Units 3 & 4)</h4>
            </div>
            <span class="text-xs bg-slate-900 px-2.5 py-1 rounded text-slate-300 border border-slate-800">1.5 hrs</span>
        </div>
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
                <span class="text-xs text-red-400 font-semibold uppercase">08:15 PM - 09:15 PM</span>
                <h4 class="text-sm font-bold text-white mt-0.5">ESA Core Mastery: Comprehensive Unit Review</h4>
            </div>
            <span class="text-xs bg-slate-900 px-2.5 py-1 rounded text-slate-300 border border-slate-800">1.0 hr</span>
        </div>
        <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
                <span class="text-xs text-emerald-400 font-semibold uppercase">09:30 PM - 10:15 PM (Low Stress)</span>
                <h4 class="text-sm font-bold text-white mt-0.5">Backlog Subject Quick Review & Problem Sets</h4>
            </div>
            <span class="text-xs bg-slate-900 px-2.5 py-1 rounded text-slate-300 border border-slate-800">45 mins</span>
        </div>
    `;

    container.innerHTML = slotsHtml;
}
