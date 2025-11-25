// --- New Selectors for Filtering/Search ---
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');

// --- 4. Debouncing Search Implementation ---
// A custom debounce utility function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// 5. Elastic Search-style Flow: Input -> Debounce -> Filter local data -> Render

function applyFiltersAndSearch() {
    let filteredTasks = [...tasks]; // Start with all tasks

    const searchTerm = searchInput.value.toLowerCase().trim();
    const currentStatusFilter = statusFilter.value;
    const currentPriorityFilter = priorityFilter.value;

    // Apply Search (Case-insensitive partial substring match on title/description)
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply Status Filter
    if (currentStatusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === currentStatusFilter);
    }

    // Apply Priority Filter
    if (currentPriorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === currentPriorityFilter);
    }

    renderTasks(filteredTasks);
}

// 2. Filtering & Search Event Listeners
// Use the debounced function for the search input
searchInput.addEventListener('input', debounce(applyFiltersAndSearch, 300));

// Non-debounced listeners for immediate filter application
statusFilter.addEventListener('change', applyFiltersAndSearch);
priorityFilter.addEventListener('change', applyFiltersAndSearch);


// --- Updated Render Function (Accepts filtered list) ---

// Modified 1.2. Read/Display Tasks Logic
function renderTasks(tasksToDisplay = tasks) {
    taskList.innerHTML = ''; // Clear current list

    // Sort tasks to show pending first, or by date if desired
    tasksToDisplay.sort((a, b) => (a.status === 'pending' && b.status === 'completed' ? -1 : 1));

    tasksToDisplay.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('task-item', task.status);
        li.dataset.id = task.id;

        const priorityClass = `badge-${task.priority}`;

        li.innerHTML = `
            <div class="task-details">
                <strong>${task.title}</strong>
                <p>${task.description || 'No description'}</p>
                <span class="${priorityClass}">Priority: ${task.priority}</span> |
                <span>Due: ${task.dueDate || 'N/A'}</span> |
                <span>Status: ${task.status}</span>
            </div>
            <div class="task-actions">
                <button onclick="toggleComplete('${task.id}')">${task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}</button>
                <button onclick="editTaskInline('${task.id}')">Edit</button>
                <button onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

// Update existing CRUD functions (toggleComplete, deleteTask, editTaskInline)
// to call applyFiltersAndSearch() instead of renderTasks() at the end of their execution.

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        // Changed from renderTasks() to applyFiltersAndSearch()
        applyFiltersAndSearch(); 
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        // Changed from renderTasks() to applyFiltersAndSearch()
        applyFiltersAndSearch();
    }
}

function editTaskInline(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = prompt('Enter new title:', task.title);
    if (newTitle && newTitle.trim() !== '') {
        task.title = newTitle.trim();
        // Changed from renderTasks() to applyFiltersAndSearch()
        applyFiltersAndSearch();
    }
}

// And finally, update the form submission listener:
taskForm.addEventListener('submit', function(event) {
    // ... existing logic to create newTask object ...
    tasks.push(newTask);
    // Changed from renderTasks() to applyFiltersAndSearch()
    applyFiltersAndSearch();
    // ... existing logic to clear form ...
});


// Initial render uses the new function
applyFiltersAndSearch();
