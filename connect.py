from flask import Flask, render_template, jsonify, request
import tasks

app = Flask(__name__)

# --- Homepage ---
@app.route("/")
def index():
    return render_template("front.html")  # our new modern HTML

# --- Get all tasks ---
@app.route("/tasks", methods=["GET"])
def get_tasks():
    data = tasks.load_tasks()
    return jsonify(data)

# --- Add a new task ---
@app.route("/tasks", methods=["POST"])
def add_task_api():
    new_task = request.json
    task_name = new_task.get("task", "")
    day = new_task.get("day", "today")
    priority = new_task.get("priority", "medium")
    success = tasks.add_task(task_name, day=day, priority=priority)
    return jsonify({"success": success})

# --- Remove a task ---
@app.route("/remove", methods=["POST"])
def remove_task_api():
    info = request.json
    index = info.get("index", 0)
    day = info.get("day", "today")
    result = tasks.remove_task(index, day=day)
    return jsonify({"result": result})

# --- Clear all tasks ---
@app.route("/clear", methods=["POST"])
def clear_all_tasks():
    from tasks import clear_tasks
    clear_tasks()  # clears both today and tomorrow
    return jsonify({"success": True})


@app.route("/random_task")
def get_random_task_api():
    day = request.args.get("day", "today")
    task = tasks.get_random_task(day=day)
    return jsonify(task if task else {"task": None})

if __name__ == "__main__":
    app.run(debug=True)

