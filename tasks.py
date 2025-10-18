import json
import os
import random
from datetime import date

# --- Constant for the storage file ---
FILENAME = "storage.json"

# --- Save tasks to JSON ---
def save_tasks(tasks):
    """
    Saves the tasks dictionary to storage.json
    """
    with open(FILENAME, "w") as f:
        json.dump(tasks, f, indent=4)

# --- Load tasks from JSON ---
def load_tasks():
    if os.path.exists(FILENAME):
        with open(FILENAME, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {}
    else:
        data = {}

    # Ensure keys exist
    for key in ["today", "tomorrow", "priority"]:
        if key not in data or not isinstance(data[key], list):
            data[key] = []

    # Filter tasks older than 2 days safely
    for day in ["today", "tomorrow"]:
        filtered_tasks = []
        for task in data[day]:
            try:
                task_date = date.fromisoformat(task.get("date", str(date.today())))
            except ValueError:
                continue  # skip invalid date formats
            if (date.today() - task_date).days <= 2:
                filtered_tasks.append(task)
        data[day] = filtered_tasks

    save_tasks(data)
    return data


# --- Add a task ---
def add_task(task, day="today", priority="medium"):
    """
    Adds a task to 'today' or 'tomorrow'.
    Returns True if successful, False if task is empty or day invalid.
    """
    if not task.strip() or day not in ["today", "tomorrow"]:
        return False

    if priority not in ["high", "medium"]:
        priority = "medium"  # default to medium if invalid
        
    data = load_tasks()
    data[day].append({
        "task": task.strip(),
        "date": str(date.today()),  # store today's date
        "priority": priority 
    })
    save_tasks(data)
    return True

# --- Remove a task by index ---
def remove_task(index, day="today"):
    """
    Removes a task by its index in the list.
    Returns a positive message if successful, None if invalid index.
    """
    positive_messages = [
        "Great job, keep going!",
        "Well done, you're making progress!",
        "Task completed, you're on fire!",
        "Another one done, fantastic!",
        "Fantastic work!",
        "You're doing amazing!",
        "Keep up the great work!",
        "You are crushing it!",
        "Way to go!",
        "You're unstoppable, keep it up!"
    ]
    data = load_tasks()
    if 0 <= index < len(data[day]):
        removed = data[day].pop(index)
        save_tasks(data)
        return f"Removed: {removed['task']}. {random.choice(positive_messages)}"

    return None

# --- Get a random task ---
def get_random_task(day="today"):
    """
    Returns a random task from the specified day.
    Returns None if no tasks exist.
    """
    tasks = load_tasks()[day]
    weighted_list = []
    for task in tasks:
        if task["priority"] == "high":
            weighted_list.extend([task] * 3)  # High priority tasks get 3 entries
        else:
            weighted_list.append(task)  # Normal tasks get 1 entry

    return random.choice(weighted_list)

# --- Clear all tasks for a day ---
def clear_tasks(day="today"):
    """
    Clears all tasks for the specified day.
    """
    data = load_tasks()
    data[day] = []
    save_tasks(data)
