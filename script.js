const CAPACITY_PER_DEV = 15;

let allSprintData = [];
let burndownChartInstance = null;
let assigneeChartInstance = null;

// Keeps the parser local and dependency-free while handling quoted commas.
function parseDelimitedLine(line, delimiter) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === delimiter && !inQuotes) {
            values.push(current.trim());
            current = "";
            continue;
        }

        current += ch;
    }

    values.push(current.trim());
    return values;
}

function parseCSV(data) {
    const lines = data
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const header = lines[0] || "";
    const delimiter = header.includes("\t") ? "\t" : ",";

    return lines.map(line => parseDelimitedLine(line, delimiter));
}

document.getElementById('csvFile').addEventListener('change', function(event) {
    const files = event.target.files;

    allSprintData = [];

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            processCSV(e.target.result, file.name);
        };
        reader.readAsText(file);
    }
});

function processCSV(data, sprintName) {
    const rows = parseCSV(data);
    const headers = rows[0] || [];

    const statusIndex = headers.indexOf("Status");
    const storyIndex = headers.indexOf("Custom field (Story Points)");
    const assigneeIndex = headers.indexOf("Assignee");
    const createdIndex = headers.indexOf("Created");

    if (statusIndex === -1 || storyIndex === -1 || assigneeIndex === -1 || createdIndex === -1) {
        console.warn(`Skipping ${sprintName}: missing one or more required columns.`);
        return;
    }

    let totalPoints = 0;
    let completedPoints = 0;
    let assigneeMap = {};
    let dailyBurn = {};

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[assigneeIndex]) continue;

        const status = row[statusIndex];
        const points = parseFloat(row[storyIndex]) || 0;
        const assignee = row[assigneeIndex] || "Unassigned";
        const created = row[createdIndex];

        totalPoints += points;

        if (status && status.toLowerCase() === "done") {
            completedPoints += points;

            const date = created ? created.split(" ")[0] : "Unknown";
            if (!dailyBurn[date]) dailyBurn[date] = 0;
            dailyBurn[date] += points;
        }

        if (!assigneeMap[assignee]) assigneeMap[assignee] = 0;
        assigneeMap[assignee] += points;
    }

    const healthScore = calculateHealth(totalPoints, completedPoints, assigneeMap);

    allSprintData.push({
        sprintName,
        totalPoints,
        completedPoints,
        assigneeMap,
        dailyBurn,
        healthScore
    });

    renderDashboard();
}

function calculateHealth(total, completed, assigneeMap) {
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    let utilizationPenalty = 0;
    for (let dev in assigneeMap) {
        const utilization = (assigneeMap[dev] / CAPACITY_PER_DEV) * 100;
        if (utilization > 120 || utilization < 50) {
            utilizationPenalty += 10;
        }
    }

    let score = completionRate - utilizationPenalty;
    return Math.max(0, Math.min(100, score)).toFixed(1);
}

function renderDashboard() {
    let html = "<h2>📊 Sprint Summary</h2>";

    allSprintData.forEach(sprint => {
        html += `
        <h3>${sprint.sprintName}</h3>
        <p>Total Points: ${sprint.totalPoints}</p>
        <p>Completed Points: ${sprint.completedPoints}</p>
        <p>🏥 Health Score: <strong>${sprint.healthScore}/100</strong></p>
        `;
    });

    document.getElementById("summary").innerHTML = html;

    renderBurndown();
    renderUtilization();
}

function renderBurndown() {
    const ctx = document.getElementById("burndownChart").getContext("2d");

    const sprint = allSprintData[0];
    if (!sprint) return;

    const dates = Object.keys(sprint.dailyBurn).sort();
    let remaining = sprint.totalPoints;
    const remainingPoints = [];

    dates.forEach(date => {
        remaining -= sprint.dailyBurn[date];
        remainingPoints.push(remaining);
    });

    if (burndownChartInstance) {
        burndownChartInstance.destroy();
    }

    burndownChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: "Remaining Points",
                data: remainingPoints
            }]
        }
    });
}

function renderUtilization() {
    const ctx = document.getElementById("assigneeChart").getContext("2d");

    const sprint = allSprintData[0];
    if (!sprint) return;

    const labels = Object.keys(sprint.assigneeMap);
    const values = labels.map(dev =>
        (sprint.assigneeMap[dev] / CAPACITY_PER_DEV) * 100
    );

    if (assigneeChartInstance) {
        assigneeChartInstance.destroy();
    }

    assigneeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Utilization %",
                data: values
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, max: 150 }
            }
        }
    });
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.text("Sprint Leadership Report", 10, y);
    y += 10;

    allSprintData.forEach(sprint => {
        doc.text(`Sprint: ${sprint.sprintName}`, 10, y); y += 8;
        doc.text(`Total Points: ${sprint.totalPoints}`, 10, y); y += 8;
        doc.text(`Completed Points: ${sprint.completedPoints}`, 10, y); y += 8;
        doc.text(`Health Score: ${sprint.healthScore}/100`, 10, y); y += 12;
    });

    doc.save("Sprint_Report.pdf");
}
