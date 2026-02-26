document.getElementById('csvFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };

    reader.readAsText(file);
});

const CAPACITY_PER_DEV = 15;

function processCSV(data) {
    const rows = data.split("\n").map(row => row.split(","));
    const headers = rows[0];

    const statusIndex = headers.indexOf("Status");
    const storyIndex = headers.indexOf("Custom field (Story Points)");
    const assigneeIndex = headers.indexOf("Assignee");

    let totalPoints = 0;
    let assigneeMap = {};
    let completedPoints = 0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[assigneeIndex]) continue;

        const status = row[statusIndex];
        const points = parseFloat(row[storyIndex]) || 0;
        const assignee = row[assigneeIndex] || "Unassigned";

        totalPoints += points;

        if (status && status.toLowerCase() === "done") {
            completedPoints += points;
        }

        if (!assigneeMap[assignee]) assigneeMap[assignee] = 0;
        assigneeMap[assignee] += points;
    }

    displaySummary(totalPoints, completedPoints, assigneeMap);
    createUtilizationChart(assigneeMap);
}

function displaySummary(totalPoints, completedPoints, assigneeMap) {
    let html = "<h2>📊 Sprint Summary</h2>";
    html += "<p>Total Story Points: " + totalPoints + "</p>";
    html += "<p>Completed Story Points: " + completedPoints + "</p>";

    html += "<h3>👥 Resource Utilization</h3>";
    html += "<table border='1' cellpadding='8'>";
    html += "<tr><th>Developer</th><th>Allocated</th><th>Capacity</th><th>Utilization %</th><th>Status</th></tr>";

    for (let dev in assigneeMap) {
        const allocated = assigneeMap[dev];
        const utilization = (allocated / CAPACITY_PER_DEV) * 100;

        let status = "✅ Healthy";
        if (utilization > 100) status = "🚨 Overallocated";
        else if (utilization < 60) status = "⚠ Underutilized";

        html += "<tr>";
        html += "<td>" + dev + "</td>";
        html += "<td>" + allocated + "</td>";
        html += "<td>" + CAPACITY_PER_DEV + "</td>";
        html += "<td>" + utilization.toFixed(1) + "%</td>";
        html += "<td>" + status + "</td>";
        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("summary").innerHTML = html;
}

function createUtilizationChart(assigneeMap) {
    const ctx = document.getElementById("assigneeChart").getContext("2d");

    const labels = [];
    const utilizationValues = [];

    for (let dev in assigneeMap) {
        labels.push(dev);
        utilizationValues.push((assigneeMap[dev] / CAPACITY_PER_DEV) * 100);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Utilization %",
                data: utilizationValues
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 150
                }
            }
        }
    });
}
