// static/script.js

let currentRandomTask = null;
let currentTaskDay = null;

// Fetch tasks from server and display
async function fetchTasks() {
    const response = await fetch("/tasks");
    const data = await response.json();
    displayTasks(data);
}

function updateClock() {
    const clockDiv = document.getElementById("clock");
    const now = new Date();

    // Format hours, minutes, seconds
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Add leading zero if needed
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    clockDiv.textContent = `${hours}:${minutes}:${seconds}`;
}

// Update clock every second
setInterval(updateClock, 1000);

// Initialize clock immediately
updateClock();

// Display tasks grouped by day
function displayTasks(data) {
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
            taskItem.textContent = `${index})\t${task.task} (Priority: ${task.priority})`;
            taskItem.classList.add("task-item");
            dayFrame.appendChild(taskItem);
        });

        tasksDiv.appendChild(dayFrame);
    });
}

// Add a new task
async function addTask() {
    const taskName = document.getElementById("taskName").value.trim();
    if (!taskName) {
        alert("Please enter a task name.");
        return;
    }

    const day = getCustomSelectValue('daySelect');
    const priority = getCustomSelectValue('prioritySelect');

    const response = await fetch("/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({task: taskName, day, priority})
    });

    const result = await response.json();
    if (result.success) {
        document.getElementById("taskName").value = "";
        fetchTasks();
    } else {
        alert("Failed to add task.");
    }
}

// Get a random task
async function getRandomTask() {
    const day = getCustomSelectValue('daySelect');

    const response = await fetch(`/random_task?day=${day}`);
    const task = await response.json();

    if (task.task) {
        currentRandomTask = task;
        currentTaskDay = day;

        const modal = document.getElementById("taskModal");
        const modalText = document.getElementById("modalTaskText");
        modalText.textContent = `Task: ${task.task}\n\tPriority: ${task.priority}`;
        modal.style.display = "block";
    } else {
        alert("No tasks available for this day.");
    }
}

// Complete the currently displayed random task
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

// Close the modal
function closeModal() {
    const modal = document.getElementById("taskModal");
    modal.style.display = "none";
    currentRandomTask = null;
    currentTaskDay = null;
}

// Clear all tasks for a day
// Clear all tasks for both today and tomorrow
async function clearDay() {
    await fetch("/clear", { method: "POST" }); // call backend route that clears both
    fetchTasks(); // refresh tasks on frontend
}


// Custom select logic
function getCustomSelectValue(selectId) {
    const selected = document.querySelector(`#${selectId} .selected`);
    return selected.dataset.value || selected.textContent;
}

function setupCustomDropdown(selectId) {
    const select = document.getElementById(selectId);
    const selected = select.querySelector('.selected');
    const optionsContainer = select.querySelector('.options');
    const optionsList = optionsContainer.querySelectorAll('div');

    selected.addEventListener('click', () => {
        select.classList.toggle('active');
    });

    optionsList.forEach(option => {
        option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            selected.dataset.value = option.dataset.value;
            select.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove('active');
        }
    });
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    setupCustomDropdown('prioritySelect');
    setupCustomDropdown('daySelect');
    
    fetchTasks();

    document.getElementById("completeTaskBtn").addEventListener("click", completeTask);
    document.getElementById("cancelTaskBtn").addEventListener("click", closeModal);
    document.getElementById("addTaskBtn").addEventListener("click", addTask);
});