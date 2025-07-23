// UIManager.js - Handles UI rendering and interactions

export class UIManager {
    constructor(app) {
        this.app = app;
        this.currentTab = 'daily';
        this.swipeStartX = null;
        this.swipeTaskElement = null;
    }
    
    // Initialize UI elements and event listeners
    initUI() {
        this.initTabNavigation();
        this.initFilterControls();
        this.initTaskModal();
        this.initSettingsModal();
        this.initStatsModal();
        this.initAddTaskButton();
        this.initSwipeActions();
    }
    
    // Initialize tab navigation
    initTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    // Switch between tabs
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Store current tab
        this.currentTab = tabName;
        
        // Render tasks for the current tab
        this.renderTasks();
    }
    
    // Initialize filter controls
    initFilterControls() {
        const filterToggle = document.getElementById('filter-toggle');
        const filterOptions = document.querySelector('.filter-options');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const priorityButtons = document.querySelectorAll('.priority-btn');
        
        // Toggle filter options visibility
        filterToggle.addEventListener('click', () => {
            filterOptions.classList.toggle('hidden');
        });
        
        // Priority toggle buttons
        priorityButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.toggle('active');
            });
        });
        
        // Apply filters
        applyFiltersBtn.addEventListener('click', () => {
            const categoryFilter = document.getElementById('category-filter');
            const dateFilter = document.getElementById('date-filter');
            
            // Get selected categories
            const selectedCategories = Array.from(categoryFilter.selectedOptions).map(option => option.value);
            
            // Get selected date
            const selectedDate = dateFilter.value || null;
            
            // Get selected priorities
            const selectedPriorities = Array.from(document.querySelectorAll('.priority-btn.active')).map(btn => 
                btn.getAttribute('data-priority')
            );
            
            // Apply filters
            this.app.applyFilters({
                categories: selectedCategories,
                date: selectedDate,
                priority: selectedPriorities
            });
            
            // Hide filter options
            filterOptions.classList.add('hidden');
        });
        
        // Clear filters
        clearFiltersBtn.addEventListener('click', () => {
            // Reset form elements
            document.getElementById('category-filter').selectedIndex = -1;
            document.getElementById('date-filter').value = '';
            document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
            
            // Clear filters in app
            this.app.clearFilters();
            
            // Hide filter options
            filterOptions.classList.add('hidden');
        });
    }
    
    // Initialize task modal
    initTaskModal() {
        const taskModal = document.getElementById('task-modal');
        const taskForm = document.getElementById('task-form');
        const closeModalButtons = taskModal.querySelectorAll('.close-modal, #cancel-task');
        const addSubtaskButton = document.getElementById('add-subtask');
        
        // Close modal
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                taskModal.classList.add('hidden');
                taskForm.reset();
                document.getElementById('subtasks-container').innerHTML = '';
                taskForm.removeAttribute('data-task-id');
            });
        });
        
        // Add subtask field
        addSubtaskButton.addEventListener('click', () => {
            this.addSubtaskField();
        });
        
        // Form submission
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const taskTitle = document.getElementById('task-title').value;
            const taskDate = document.getElementById('task-date').value;
            const taskPriority = document.querySelector('input[name="task-priority"]:checked').value;
            const taskCategory = document.getElementById('task-category').value;
            
            // Get subtasks
            const subtaskInputs = document.querySelectorAll('.subtask-input');
            const subtasks = Array.from(subtaskInputs)
                .filter(input => input.value.trim() !== '')
                .map(input => ({
                    id: input.getAttribute('data-id') || this.app.taskManager.generateId(),
                    text: input.value.trim(),
                    completed: input.hasAttribute('data-completed') ? 
                        input.getAttribute('data-completed') === 'true' : false
                }));
            
            // Create task data object
            const taskData = {
                title: taskTitle,
                dueDate: taskDate,
                priority: taskPriority,
                category: taskCategory,
                subtasks: subtasks
            };
            
            // Check if editing or adding
            const taskId = taskForm.getAttribute('data-task-id');
            
            if (taskId) {
                // Update existing task
                this.app.updateTask(taskId, taskData);
            } else {
                // Add new task
                this.app.addTask(taskData);
            }
            
            // Close modal and reset form
            taskModal.classList.add('hidden');
            taskForm.reset();
            document.getElementById('subtasks-container').innerHTML = '';
            taskForm.removeAttribute('data-task-id');
        });
    }
    
    // Add a subtask input field to the form
    addSubtaskField(subtask = null) {
        const subtasksContainer = document.getElementById('subtasks-container');
        const subtaskId = subtask ? subtask.id : this.app.taskManager.generateId();
        
        const subtaskGroup = document.createElement('div');
        subtaskGroup.className = 'subtask-input-group';
        
        const subtaskInput = document.createElement('input');
        subtaskInput.type = 'text';
        subtaskInput.className = 'subtask-input';
        subtaskInput.placeholder = 'Enter subtask';
        subtaskInput.setAttribute('data-id', subtaskId);
        
        if (subtask) {
            subtaskInput.value = subtask.text;
            if (subtask.completed) {
                subtaskInput.setAttribute('data-completed', 'true');
            }
        }
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-subtask';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.addEventListener('click', () => {
            subtasksContainer.removeChild(subtaskGroup);
        });
        
        subtaskGroup.appendChild(subtaskInput);
        subtaskGroup.appendChild(removeButton);
        subtasksContainer.appendChild(subtaskGroup);
    }
    
    // Initialize settings modal
    initSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeModalButtons = settingsModal.querySelectorAll('.close-modal');
        const themeToggle = document.getElementById('theme-toggle');
        const notificationToggle = document.getElementById('notification-toggle');
        const clearCompletedBtn = document.getElementById('clear-completed');
        const addCategoryBtn = document.getElementById('add-category-btn');
        
        // Open settings modal
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            this.app.settingsManager.updateCategoriesList();
        });
        
        // Close modal
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
            });
        });
        
        // Theme toggle
        themeToggle.addEventListener('change', () => {
            this.app.toggleTheme();
        });
        
        // Notification toggle
        notificationToggle.addEventListener('change', () => {
            this.app.toggleNotifications();
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                this.app.clearCompletedTasks();
                settingsModal.classList.add('hidden');
            }
        });
        
        // Add new category
        addCategoryBtn.addEventListener('click', () => {
            const newCategoryInput = document.getElementById('new-category');
            const categoryName = newCategoryInput.value.trim();
            
            if (categoryName) {
                this.app.addCategory(categoryName);
                newCategoryInput.value = '';
            }
        });
    }
    
    // Initialize statistics modal
    initStatsModal() {
        const statsBtn = document.getElementById('stats-btn');
        const statsModal = document.getElementById('stats-modal');
        const closeModalButtons = statsModal.querySelectorAll('.close-modal');
        const statsTabButtons = document.querySelectorAll('.stats-tab-btn');
        
        // Open stats modal
        statsBtn.addEventListener('click', () => {
            statsModal.classList.remove('hidden');
            this.app.statisticsManager.updateStatistics();
        });
        
        // Close modal
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                statsModal.classList.add('hidden');
            });
        });
        
        // Stats tab navigation
        statsTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-stats-tab');
                
                // Update active tab button
                statsTabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.stats-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-stats`).classList.add('active');
            });
        });
    }
    
    // Initialize add task button
    initAddTaskButton() {
        const addTaskBtn = document.getElementById('add-task-btn');
        const taskModal = document.getElementById('task-modal');
        const taskModalTitle = document.getElementById('task-modal-title');
        
        addTaskBtn.addEventListener('click', () => {
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('task-date').value = today;
            
            // Clear form and set title
            document.getElementById('task-form').reset();
            document.getElementById('subtasks-container').innerHTML = '';
            taskModalTitle.textContent = 'Add New Task';
            
            // Show modal
            taskModal.classList.remove('hidden');
        });
    }
    
    // Initialize swipe actions for mobile
    initSwipeActions() {
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.task-card')) {
                this.swipeStartX = e.touches[0].clientX;
                this.swipeTaskElement = e.target.closest('.task-card');
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.swipeStartX || !this.swipeTaskElement) return;
            
            const currentX = e.touches[0].clientX;
            const diffX = currentX - this.swipeStartX;
            
            // Limit swipe distance
            if (Math.abs(diffX) < 80) {
                this.swipeTaskElement.style.transform = `translateX(${diffX}px)`;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!this.swipeStartX || !this.swipeTaskElement) return;
            
            const currentX = e.changedTouches[0].clientX;
            const diffX = currentX - this.swipeStartX;
            
            // Reset position
            this.swipeTaskElement.style.transform = '';
            
            // Check if swipe was significant
            if (Math.abs(diffX) > 50) {
                const taskId = this.swipeTaskElement.getAttribute('data-task-id');
                
                if (diffX > 0) {
                    // Swipe right - mark as complete/incomplete
                    this.app.toggleTaskCompletion(taskId);
                } else {
                    // Swipe left - edit task
                    this.openEditTaskModal(taskId);
                }
            }
            
            // Reset swipe tracking
            this.swipeStartX = null;
            this.swipeTaskElement = null;
        }, { passive: true });
    }
    
    // Render tasks based on current tab
    renderTasks() {
        switch (this.currentTab) {
            case 'daily':
                this.renderDailyTasks();
                break;
            case 'upcoming':
                this.renderUpcomingTasks();
                break;
            case 'missed':
                this.renderMissedTasks();
                break;
            // Calendar tab is handled by CalendarManager
        }
    }
    
    // Render daily tasks
    renderDailyTasks() {
        const dailyTasksContainer = document.getElementById('daily-tasks');
        const tasks = this.app.taskManager.getDailyTasks();
        
        this.renderTaskList(dailyTasksContainer, tasks);
    }
    
    // Render upcoming tasks
    renderUpcomingTasks() {
        const upcomingTasksContainer = document.getElementById('upcoming-tasks');
        const tasks = this.app.taskManager.getUpcomingTasks();
        
        this.renderTaskList(upcomingTasksContainer, tasks);
    }
    
    // Render missed tasks
    renderMissedTasks() {
        const missedTasksContainer = document.getElementById('missed-tasks');
        const tasks = this.app.taskManager.getMissedTasks();
        
        this.renderTaskList(missedTasksContainer, tasks);
    }
    
    // Render a list of tasks in a container
    renderTaskList(container, tasks) {
        // Clear container
        container.innerHTML = '';
        
        // Check if there are tasks
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tasks-message';
            emptyMessage.textContent = 'No tasks found';
            container.appendChild(emptyMessage);
            return;
        }
        
        // Sort tasks by date and priority
        tasks.sort((a, b) => {
            // First by date
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            
            // Then by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // Render each task
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
            
            // Add animation
            setTimeout(() => {
                taskElement.classList.add('visible');
            }, 10);
        });
    }
    
    // Create a task element
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority} ${task.completed ? 'completed' : ''}`;
        taskElement.setAttribute('data-task-id', task.id);
        
        // Format date
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const isOverdue = taskDate < today && !task.completed;
        
        let dateText;
        if (taskDate.getTime() === today.getTime()) {
            dateText = 'Today';
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            dateText = 'Tomorrow';
        } else {
            dateText = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        // Get category
        const category = this.app.taskManager.getCategoryById(task.category);
        
        // Create task HTML
        taskElement.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
                        <div class="task-date ${isOverdue ? 'overdue' : ''}">
                            <i class="far fa-calendar"></i>
                            ${isOverdue ? 'Overdue' : dateText}
                        </div>
                        <div class="task-category ${task.category}">${category ? category.name : 'Other'}</div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-task" aria-label="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-task" aria-label="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add subtasks section if there are subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const subtasksContainer = document.createElement('div');
            subtasksContainer.className = 'task-subtasks';
            
            task.subtasks.forEach(subtask => {
                const subtaskElement = document.createElement('div');
                subtaskElement.className = `subtask-item ${subtask.completed ? 'subtask-completed' : ''}`;
                subtaskElement.innerHTML = `
                    <input type="checkbox" class="subtask-checkbox" data-subtask-id="${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                    <div class="subtask-text">${subtask.text}</div>
                `;
                subtasksContainer.appendChild(subtaskElement);
            });
            
            const toggleButton = document.createElement('div');
            toggleButton.className = 'toggle-subtasks';
            toggleButton.innerHTML = `
                <i class="fas fa-chevron-down"></i>
                <span>Show Subtasks (${task.subtasks.length})</span>
            `;
            
            toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                subtasksContainer.classList.toggle('expanded');
                const icon = toggleButton.querySelector('i');
                const text = toggleButton.querySelector('span');
                
                if (subtasksContainer.classList.contains('expanded')) {
                    icon.className = 'fas fa-chevron-up';
                    text.textContent = `Hide Subtasks (${task.subtasks.length})`;
                } else {
                    icon.className = 'fas fa-chevron-down';
                    text.textContent = `Show Subtasks (${task.subtasks.length})`;
                }
            });
            
            taskElement.appendChild(toggleButton);
            taskElement.appendChild(subtasksContainer);
        }
        
        // Add event listeners
        this.addTaskEventListeners(taskElement, task);
        
        return taskElement;
    }
    
    // Add event listeners to task element
    addTaskEventListeners(taskElement, task) {
        // Checkbox - toggle completion
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            this.app.toggleTaskCompletion(task.id);
        });
        
        // Edit button
        const editButton = taskElement.querySelector('.edit-task');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditTaskModal(task.id);
        });
        
        // Delete button
        const deleteButton = taskElement.querySelector('.delete-task');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
                this.app.deleteTask(task.id);
            }
        });
        
        // Subtask checkboxes
        const subtaskCheckboxes = taskElement.querySelectorAll('.subtask-checkbox');
        subtaskCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const subtaskId = checkbox.getAttribute('data-subtask-id');
                this.app.toggleSubtaskCompletion(task.id, subtaskId);
            });
        });
    }
    
    // Open edit task modal
    openEditTaskModal(taskId) {
        const task = this.app.taskManager.getAllTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const taskModal = document.getElementById('task-modal');
        const taskForm = document.getElementById('task-form');
        const taskModalTitle = document.getElementById('task-modal-title');
        
        // Set form values
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-date').value = task.dueDate;
        document.querySelector(`input[name="task-priority"][value="${task.priority}"]`).checked = true;
        document.getElementById('task-category').value = task.category;
        
        // Clear and add subtasks
        document.getElementById('subtasks-container').innerHTML = '';
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                this.addSubtaskField(subtask);
            });
        }
        
        // Set task ID and title
        taskForm.setAttribute('data-task-id', task.id);
        taskModalTitle.textContent = 'Edit Task';
        
        // Show modal
        taskModal.classList.remove('hidden');
    }
    
    // Update category dropdowns
    updateCategoryDropdowns() {
        const categories = this.app.taskManager.getCategories();
        const categoryDropdowns = [
            document.getElementById('task-category'),
            document.getElementById('category-filter')
        ];
        
        categoryDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // Save current selection
            const currentSelection = Array.from(dropdown.selectedOptions).map(option => option.value);
            
            // Clear dropdown
            dropdown.innerHTML = '';
            
            // Add categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                dropdown.appendChild(option);
                
                // Restore selection for multi-select
                if (dropdown.multiple && currentSelection.includes(category.id)) {
                    option.selected = true;
                }
            });
        });
    }
}