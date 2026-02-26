import csv

def analyze_sprint(file_name):
    total_points = 0
    completed_points = 0
    not_completed_points = 0

    with open(file_name, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            points = int(row['Story Points'])
            status = row['Status'].lower()

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
