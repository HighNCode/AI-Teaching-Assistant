def generate_mock_content(subject: str, level: str, topic: str):
    lesson_plan = f"""
# Lesson Plan: {topic}

## Subject: {subject}
## Level: {level}

### 1. Introduction
- Introduce the topic of {topic}.
- Discuss the learning objectives.

### 2. Main Activities
- Activity 1: ...
- Activity 2: ...

### 3. Conclusion
- Recap of {topic}.
- Q&A session.
"""
    worksheet = f"""
# Worksheet: {topic}

## Subject: {subject}
## Level: {level}

### Exercise 1
...

### Exercise 2
...
"""
    return {
        "lesson_plan": lesson_plan,
        "worksheet": worksheet,
    }
def generate_mock_parent_updates(csv_data: str):
    updates = []
    lines = csv_data.strip().split('\n')

    # If there is only one line and it's not a header, treat it as a single update
    if len(lines) == 1 and "name" not in lines[0].lower():
        student_name = "Student"  # Assign a generic name
        updates.append(f"Update for {student_name}: {lines[0]}")
        return updates

    # Process as CSV
    header = [h.strip() for h in lines[0].split(',')]
    for line in lines[1:]:
        values = [v.strip() for v in line.split(',')]
        row_data = dict(zip(header, values))

        student_name = row_data.get("Name", "Unknown").strip()
        score = row_data.get("Score", "N/A").strip()

        updates.append(f"Update for {student_name}: Their score was {score}.")
    
    return updates
