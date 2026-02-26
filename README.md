# scrum-plus

A lightweight sprint analytics repo with:

- A browser dashboard (`index.html` + `script.js`) for:
  - sprint summary cards
  - burn-down chart
  - assignee utilization chart
  - PDF leadership report export
  - BRD-to-delivery workflow board with PO, Coding, Code Review, QA, and Done lanes
- A Python CLI analyzer (`analyzer.py`) for quick terminal summaries from CSV exports.

## Run the dashboard

Open `index.html` in a browser and upload one or more sprint CSV files.

Expected dashboard columns:

- `Status`
- `Custom field (Story Points)`
- `Assignee`
- `Created`

## Workflow dashboard usage

1. Upload your BRD document in the **BRD to Delivery Workflow Dashboard** section.
2. Let the PO agent create initial user stories from BRD lines.
3. Move stories through dedicated agent buttons:
   - PO Agent → Coding Agent
   - Coding Agent → Code Reviewer Agent
   - Code Reviewer Agent → QA Agent
   - QA Agent → Done + Evidence
4. Add completion notes in the evidence textbox (Jira ticket, PR, test run, screenshots, sign-off).

## Run the Python analyzer

```bash
python3 analyzer.py
```

The analyzer supports either points column:

- `Story Points`
- `Custom field (Story Points)`

And always requires:

- `Status`
