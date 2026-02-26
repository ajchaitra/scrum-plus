document.getElementById('csvFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };

    reader.readAsText(file);
});

function processCSV(data) {
    const rows = data.split("\n").map(row => row.split(","));
    const headers = rows[0];

    const statusIndex = headers.indexOf("Status");
    const storyIndex = headers.indexOf("Custom field (Story Points)");
    const assigneeIndex = headers.indexOf("Assignee");

    let totalPoints = 0;
    let statusMap = {};
    let assigneeMap = {};

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        const status = row[statusIndex];
        const points = parseFloat(row[storyIndex]) || 0;
        const assignee = row[assigneeIndex] || "Unassigned";

        totalPoints += points;

        // Status
        if (!statusMap[status]) statusMap[status] = 0;
        statusMap[status] += points;

        // Assignee
        if (!assigneeMap[assignee]) assigneeMap[assignee] = 0;
        assigneeMap[assignee] += points;
    }

    document.getElementById("summary").innerHTML = 
        "<h2>Summary</h2>" +
        "<p>Total Story Points: " + totalPoints + "</p>";

    createChart("statusChart", statusMap);
    createChart("assigneeChart", assigneeMap);
}

function createChart(canvasId, dataMap) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataMap),
            datasets: [{
                label: "Story Points",
                data: Object.values(dataMap)
            }]
        }
    });
}
