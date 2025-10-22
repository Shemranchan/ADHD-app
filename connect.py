from flask import Flask, render_template, jsonify, request
from flask.logging import create_logger
import tasks
import os
import sys

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')

logger = create_logger(app)
# --- Homepage ---
@app.route("/", methods=['GET'])
def index():
    try:
        return render_template("index.html")
    except Exception as e:
        logger.error(f"Error rendering index: {str(e)}")
        return str(e), 500
# --- Get all tasks ---
@app.route("/tasks", methods=["GET"])
def get_tasks():
    try:
        data = tasks.load_tasks()
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error loading tasks: {str(e)}")
        return jsonify({"error": str(e)}), 500

app.debug = True

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
    # Use PORT environment variable for Vercel
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

