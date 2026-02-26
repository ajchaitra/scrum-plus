import csv


def to_int(value):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def detect_dialect(file_obj):
    sample = file_obj.read(4096)
    file_obj.seek(0)

    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        return csv.excel


def analyze_sprint(file_name):
    total_points = 0
    completed_points = 0
    not_completed_points = 0

    with open(file_name, newline='', encoding='utf-8-sig') as csvfile:
        dialect = detect_dialect(csvfile)
        reader = csv.DictReader(csvfile, dialect=dialect)

        if not reader.fieldnames:
            raise ValueError("CSV has no header row")

        points_field = (
            'Story Points'
            if 'Story Points' in reader.fieldnames
            else 'Custom field (Story Points)'
            if 'Custom field (Story Points)' in reader.fieldnames
            else None
        )

        if not points_field or 'Status' not in reader.fieldnames:
            raise KeyError(
                "CSV must include 'Status' and either 'Story Points' or 'Custom field (Story Points)'"
            )

        for row in reader:
            points = to_int(row.get(points_field, 0))
            status = (row.get('Status') or '').strip().lower()

            total_points += points

            if status == "done":
                completed_points += points
            else:
                not_completed_points += points

    print("SPRINT REPORT SUMMARY")
    print("---------------------")
    print(f"Total Story Points: {total_points}")
    print(f"Completed Points: {completed_points}")
    print(f"Not Completed Points: {not_completed_points}")
    print(f"Velocity: {completed_points}")


if __name__ == "__main__":
    analyze_sprint("sprint_data.csv")
