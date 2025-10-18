// static/script.js

let currentRandomTask = null;
let currentTaskDay = null;

async function fetchTasks() {
    const response = await fetch("/tasks");
    const data = await response.json();
    displayTasks(data);
}

function displayTasks(data) {
    const tasksDiv = document.getElementById("tasks");
    tasksDiv.innerHTML = "";
    ["today", "tomorrow"].forEach(day => {
        const dayHeader = document.createElement("h2");
        dayHeader.textContent = day.toUpperCase();
        tasksDiv.appendChild(dayHeader);

        data[day].forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.textContent = `${index}: ${task.task} (Priority: ${task.priority})`;
            tasksDiv.appendChild(taskItem);
        });
    });
}

async function addTask() {
    const taskName = document.getElementById("taskName").value;
    const day = document.getElementById("day").value;
    const priority = document.getElementById("priority").value;

    const response = await fetch("/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({task: taskName, day, priority})
    })
    const result = await response.json();
    if (result.success) {
        document.getElementById("taskName").value = "";
        fetchTasks();
    } else {
        alert("Failed to add task.");
    }
}

function displayTasks (data){
    const tasksDiv = document.getElementById("tasks");
    tasksDiv.innerHTML = "";
    ["today", "tomorrow"].forEach(day => {
        const dayFrame = document.createElement("div");
        dayFrame.classList.add("day-frame");
        const dayHeader = document.createElement("h2");
        dayHeader.textContent = day.toUpperCase();
        dayFrame.appendChild(dayHeader);
        data[day].forEach((task, index) => {
            const taskItem = document.createElement("div");
            taskItem.textContent = `${index}: ${task.task} (Priority: ${task.priority})`;
            taskItem.classList.add("task-item");
            dayFrame.appendChild(taskItem);
        });
        tasksDiv.appendChild(dayFrame);
    });
}
async function getRandomTask() {
    const day = document.getElementById("day").value;
    const response = await fetch(`/random_task?day=${day}`);
    const task = await response.json();

    if (task.task) {
        currentRandomTask = task;
        currentTaskDay = day;
        
        const modal = document.getElementById("taskModal");
        const modalText = document.getElementById("modalTaskText");
        modalText.textContent = `Task: ${task.task}\nPriority: ${task.priority}`;
        modal.style.display = "block";
    } else {
        alert("No tasks available for this day.");
    }
}

// Add these new functions
async function completeTask() {
    if (!currentRandomTask) return;
    
    const response = await fetch("/remove", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            index: currentRandomTask.index,
            day: currentTaskDay
        })
    });
    
    const result = await response.json();
    if (result.result) {
        alert("Task completed! " + result.result);
        closeModal();
        fetchTasks();
    }
}

function closeModal() {
    const modal = document.getElementById("taskModal");
    modal.style.display = "none";
    currentRandomTask = null;
    currentTaskDay = null;
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("completeTaskBtn").addEventListener("click", completeTask);
    document.getElementById("cancelTaskBtn").addEventListener("click", closeModal);
    
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("taskModal");
        if (event.target === modal) {
            closeModal();
        }
    });
});

async function clearDay() {
    const day = document.getElementById("day").value;
    await fetch(`/clear/${day}`, {method: "POST"});
    fetchTasks();
}


// Initial load
fetchTasks();
