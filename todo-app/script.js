let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// ELEMENTS
const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");

// ADD TASK
document.getElementById("addBtn").onclick = () => {
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
        id: Date.now(),
        text,
        category: category.value,
        priority: priority.value,
        dueDate: dueDate.value,
        completed: false
    });

    taskInput.value = "";
    saveTasks();
    renderTasks();
};

// SEARCH
document.getElementById("searchInput").onkeyup = function () {
    renderTasks(this.value.toLowerCase());
};

// SORT
document.getElementById("sortSelect").onchange = function () {
    sortTasks(this.value);
};

// FILTER BUTTONS
document.querySelectorAll(".filters button").forEach(btn => {
    btn.onclick = () => {
        currentFilter = btn.dataset.filter;
        renderTasks();
    };
});

// RENDER
function renderTasks(search = "") {
    taskList.innerHTML = "";

    let filtered = tasks.filter(task =>
        task.text.toLowerCase().includes(search)
    );

    if (currentFilter === "completed") {
        filtered = filtered.filter(t => t.completed);
    } else if (currentFilter === "pending") {
        filtered = filtered.filter(t => !t.completed);
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.classList.add(task.priority);
        if (task.completed) li.classList.add("completed");

        li.setAttribute("draggable", true);

        li.innerHTML = `
            <strong>${task.text}</strong>
            <small>📂 ${task.category} | 📅 ${task.dueDate || "No date"}</small>
            <div>
                <button onclick="toggleTask(${task.id})">✔</button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;

        // DRAG
        li.addEventListener("dragstart", () => li.classList.add("dragging"));
        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            updateOrder();
        });

        taskList.appendChild(li);
    });

    updateProgress();
}

// TOGGLE
function toggleTask(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks();
    renderTasks();
}

// DELETE
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// SORT FUNCTION
function sortTasks(type) {
    if (type === "newest") tasks.sort((a, b) => b.id - a.id);
    if (type === "oldest") tasks.sort((a, b) => a.id - b.id);

    if (type === "priority") {
        const order = { high: 1, medium: 2, low: 3 };
        tasks.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    renderTasks();
}

// SAVE
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// PROGRESS
function updateProgress() {
    const completed = tasks.filter(t => t.completed).length;
    const percent = tasks.length
        ? (completed / tasks.length) * 100
        : 0;

    document.getElementById("progress").style.width = percent + "%";
}

// DRAG DROP
taskList.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(taskList, e.clientY);

    if (afterElement == null) {
        taskList.appendChild(dragging);
    } else {
        taskList.insertBefore(dragging, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const items = [...container.querySelectorAll("li:not(.dragging)")];

    return items.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: -Infinity }).element;
}

// SAVE ORDER
function updateOrder() {
    const newTasks = [];
    document.querySelectorAll("#taskList li").forEach(li => {
        const text = li.querySelector("strong").innerText;
        const found = tasks.find(t => t.text === text);
        if (found) newTasks.push(found);
    });

    tasks = newTasks;
    saveTasks();
}

// DARK MODE
document.getElementById("darkToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

// ENTER KEY SUPPORT
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        document.getElementById("addBtn").click();
    }
});

// INIT
renderTasks();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}