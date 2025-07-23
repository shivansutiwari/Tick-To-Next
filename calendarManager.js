// CalendarManager.js - Handles calendar view and date-based task management

export class CalendarManager {
    constructor(app) {
        this.app = app;
        this.currentDate = new Date();
        this.selectedDate = null;
    }
    
    // Initialize calendar
    initCalendar() {
        // Set up event listeners for calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.navigateMonth(-1);
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.navigateMonth(1);
        });
        
        // Close calendar tasks view
        document.getElementById('close-calendar-tasks').addEventListener('click', () => {
            document.getElementById('calendar-tasks').classList.add('hidden');
            this.selectedDate = null;
        });
    }
    
    // Navigate to previous/next month
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    // Render calendar for current month
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get days from previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Get all tasks for efficient lookup
        const allTasks = this.app.taskManager.getAllTasks();
        
        // Create calendar grid
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Add days from previous month
        for (let i = 0; i < firstDay; i++) {
            const prevMonthDay = daysInPrevMonth - firstDay + i + 1;
            const prevMonthDate = new Date(year, month - 1, prevMonthDay);
            const dayElement = this.createDayElement(prevMonthDay, 'other-month', prevMonthDate);
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from current month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            currentDate.setHours(0, 0, 0, 0);
            
            // Check if this day has tasks
            const hasTasks = allTasks.some(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === currentDate.getTime();
            });
            
            // Check if this is today
            const isToday = currentDate.getTime() === today.getTime();
            
            // Create day element
            const dayElement = this.createDayElement(
                i, 
                isToday ? 'today' : (hasTasks ? 'has-tasks' : ''), 
                currentDate
            );
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from next month to fill the grid
        const totalCells = 42; // 6 rows of 7 days
        const remainingCells = totalCells - (firstDay + daysInMonth);
        
        for (let i = 1; i <= remainingCells; i++) {
            // Create a proper date object for the next month
            const nextMonthDate = new Date(year, month + 1, i);
            // Create the day element with the correct date
            const dayElement = this.createDayElement(i, 'other-month', nextMonthDate);
            calendarDays.appendChild(dayElement);
        }
        
        // If a date was previously selected, update the tasks view
        if (this.selectedDate) {
            this.showTasksForDate(this.selectedDate);
        }
    }
    
    // Create a day element for the calendar
    createDayElement(day, className, date) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.textContent = day;
        
        // Store date data - ensure we're using the correct date format
        const dateStr = date.toISOString().split('T')[0];
        dayElement.setAttribute('data-date', dateStr);
        
        // Add click event to show tasks for this day
        dayElement.addEventListener('click', () => {
            // Get the date string from the element's data attribute
            const clickedDateStr = dayElement.getAttribute('data-date');
            this.selectedDate = clickedDateStr;
            this.showTasksForDate(clickedDateStr);
        });
        
        return dayElement;
    }
    
    // Show tasks for a specific date
    showTasksForDate(dateStr) {
        // Parse the date string to ensure consistent format
        // The date string is in ISO format (YYYY-MM-DD)
        const dateParts = dateStr.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        
        // Create a new date object with the parsed values
        const date = new Date(year, month, day);
        
        // Format the date for display
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        
        // Update selected date display
        document.getElementById('selected-date').textContent = `Tasks for ${formattedDate}`;
        
        // Get tasks for this date using the original date string
        // This ensures consistent date handling between calendar and tasks
        const tasks = this.app.taskManager.getTasksByDate(dateStr);
        
        // Render tasks
        const tasksContainer = document.getElementById('calendar-tasks-list');
        tasksContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tasks-message';
            emptyMessage.textContent = 'No tasks for this date';
            tasksContainer.appendChild(emptyMessage);
        } else {
            tasks.forEach(task => {
                const taskElement = this.createCalendarTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });
        }
        
        // Show tasks container
        document.getElementById('calendar-tasks').classList.remove('hidden');
    }
    
    // Create a task element for the calendar view
    createCalendarTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.priority} ${task.completed ? 'completed' : ''}`;
        taskElement.setAttribute('data-task-id', task.id);
        
        // Get category
        const category = this.app.taskManager.getCategoryById(task.category);
        
        // Create task HTML
        taskElement.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
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
    
    // Add event listeners to calendar task element
    addTaskEventListeners(taskElement, task) {
        // Checkbox - toggle completion
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => {
            this.app.toggleTaskCompletion(task.id);
            this.renderCalendar(); // Update calendar to reflect changes
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
                
                // Refresh calendar tasks view
                if (this.selectedDate) {
                    this.showTasksForDate(this.selectedDate);
                }
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
                this.app.uiManager.addSubtaskField(subtask);
            });
        }
        
        // Set task ID and title
        taskForm.setAttribute('data-task-id', task.id);
        taskModalTitle.textContent = 'Edit Task';
        
        // Show modal
        taskModal.classList.remove('hidden');
    }
}