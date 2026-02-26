# scrum-plus

A lightweight sprint analytics repo with:

- A browser dashboard (`index.html` + `script.js`) for:
  - sprint summary cards
  - burn-down chart
  - assignee utilization chart
  - PDF leadership report export
- A Python CLI analyzer (`analyzer.py`) for quick terminal summaries from CSV exports.

## Run the dashboard

Open `index.html` in a browser and upload one or more sprint CSV files.

Expected dashboard columns:

- `Status`
- `Custom field (Story Points)`
- `Assignee`
- `Created`

## Run the Python analyzer

```bash
python3 analyzer.py
```

The analyzer supports either points column:

- `Story Points`
- `Custom field (Story Points)`

And always requires:

- `Status`
