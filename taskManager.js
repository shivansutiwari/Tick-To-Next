// TaskManager.js - Handles all task data operations

export class TaskManager {
    constructor() {
        this.tasks = [];
        this.categories = [
            { id: 'home', name: 'Home', color: '#4a6fa5' },
            { id: 'personal', name: 'Personal', color: '#ff9a3c' },
            { id: 'work', name: 'Work', color: '#ff5252' },
            { id: 'study', name: 'Study', color: '#33d9b2' },
            { id: 'others', name: 'Others', color: '#a55eea' }
        ];
        this.filters = {
            categories: [],
            date: null,
            priority: []
        };
    }
    
    // Load tasks from localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('tickToNextTasks');
        const savedCategories = localStorage.getItem('tickToNextCategories');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
    }
    
    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tickToNextTasks', JSON.stringify(this.tasks));
        localStorage.setItem('tickToNextCategories', JSON.stringify(this.categories));
    }
    
    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Add a new task
    addTask(taskData) {
        const newTask = {
            id: this.generateId(),
            title: taskData.title,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            category: taskData.category,
            completed: false,
            subtasks: taskData.subtasks || [],
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }
    
    // Update an existing task
    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...taskData
            };
            this.saveTasks();
            return true;
        }
        
        return false;
    }
    
    // Delete a task
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
    }
    
    // Toggle task completion status
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            return task.completed;
        }
        
        return null;
    }
    
    // Add a subtask to a task
    addSubtask(taskId, subtaskText) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            const newSubtask = {
                id: this.generateId(),
                text: subtaskText,
                completed: false
            };
            
            if (!task.subtasks) {
                task.subtasks = [];
            }
            
            task.subtasks.push(newSubtask);
            this.saveTasks();
            return newSubtask;
        }
        
        return null;
    }
    
    // Toggle subtask completion status
    toggleSubtaskCompletion(taskId, subtaskId) {
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task && task.subtasks) {
            const subtask = task.subtasks.find(subtask => subtask.id === subtaskId);
            
            if (subtask) {
                subtask.completed = !subtask.completed;
                this.saveTasks();
                return subtask.completed;
            }
        }
        
        return null;
    }
    
    // Get all tasks
    getAllTasks() {
        return this.tasks;
    }
    
    // Get tasks for today
    getDailyTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.getFilteredTasks().filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime();
        });
    }
    
    // Get upcoming tasks (next 7 days)
    getUpcomingTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return this.getFilteredTasks().filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate >= today && taskDate <= nextWeek;
        });
    }
    
    // Get missed/overdue tasks
    getMissedTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.getFilteredTasks().filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate < today && !task.completed;
        });
    }
    
    // Get tasks for a specific date
    getTasksByDate(date) {
        // Parse the date string to ensure consistent format
        // The date string is in ISO format (YYYY-MM-DD)
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(dateParts[2]);
        
        // Create a new date object with the parsed values
        const targetDate = new Date(year, month, day);
        // Reset time to midnight to ensure proper date comparison
        targetDate.setHours(0, 0, 0, 0);
        
        return this.getFilteredTasks().filter(task => {
            // Parse the task's due date
            const taskDateParts = task.dueDate.split('-');
            const taskYear = parseInt(taskDateParts[0]);
            const taskMonth = parseInt(taskDateParts[1]) - 1; // JavaScript months are 0-indexed
            const taskDay = parseInt(taskDateParts[2]);
            
            // Create a new date object with the parsed values
            const taskDate = new Date(taskYear, taskMonth, taskDay);
            // Reset time to midnight to ensure proper date comparison
            taskDate.setHours(0, 0, 0, 0);
            
            // Compare timestamps to check if dates are the same
            return taskDate.getTime() === targetDate.getTime();
        });
    }
    
    // Set filters
    setFilters(filters) {
        this.filters = {
            ...this.filters,
            ...filters
        };
    }
    
    // Clear all filters
    clearFilters() {
        this.filters = {
            categories: [],
            date: null,
            priority: []
        };
    }
    
    // Get filtered tasks based on current filters
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // Filter by categories
        if (this.filters.categories && this.filters.categories.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                this.filters.categories.includes(task.category)
            );
        }
        
        // Filter by date
        if (this.filters.date) {
            const filterDate = new Date(this.filters.date);
            filterDate.setHours(0, 0, 0, 0);
            
            filteredTasks = filteredTasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === filterDate.getTime();
            });
        }
        
        // Filter by priority
        if (this.filters.priority && this.filters.priority.length > 0) {
            filteredTasks = filteredTasks.filter(task => 
                this.filters.priority.includes(task.priority)
            );
        }
        
        return filteredTasks;
    }
    
    // Category management
    addCategory(name, color) {
        const newCategory = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            color: color || this.getRandomColor()
        };
        
        this.categories.push(newCategory);
        this.saveTasks();
        return newCategory;
    }
    
    updateCategory(categoryId, newName, newColor) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
        
        if (categoryIndex !== -1) {
            // Update category
            if (newName) {
                this.categories[categoryIndex].name = newName;
            }
            
            if (newColor) {
                this.categories[categoryIndex].color = newColor;
            }
            
            // Update tasks with this category
            this.tasks.forEach(task => {
                if (task.category === categoryId) {
                    task.category = categoryId;
                }
            });
            
            this.saveTasks();
            return true;
        }
        
        return false;
    }
    
    deleteCategory(categoryId) {
        // Don't delete default categories
        const defaultCategories = ['home', 'personal', 'work', 'study', 'others'];
        if (defaultCategories.includes(categoryId)) {
            return false;
        }
        
        // Remove the category
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
        
        // Update tasks with this category to 'others'
        this.tasks.forEach(task => {
            if (task.category === categoryId) {
                task.category = 'others';
            }
        });
        
        this.saveTasks();
        return true;
    }
    
    getCategories() {
        return this.categories;
    }
    
    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    }
    
    // Generate a random color for new categories
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    // Clear completed tasks
    clearCompletedTasks() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
    }
    
    // Get task statistics
    getTaskStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = this.getMissedTasks().length;
        
        // Tasks by category
        const byCategory = {};
        this.categories.forEach(category => {
            byCategory[category.id] = this.tasks.filter(task => task.category === category.id).length;
        });
        
        // Tasks by priority
        const byPriority = {
            high: this.tasks.filter(task => task.priority === 'high').length,
            medium: this.tasks.filter(task => task.priority === 'medium').length,
            low: this.tasks.filter(task => task.priority === 'low').length
        };
        
        // Weekly trends (last 7 days)
        const weeklyTrends = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const tasksForDay = this.tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() === date.getTime();
            });
            
            const completedForDay = tasksForDay.filter(task => task.completed).length;
            
            weeklyTrends.push({
                date: date.toISOString().split('T')[0],
                total: tasksForDay.length,
                completed: completedForDay
            });
        }
        
        return {
            total,
            completed,
            pending,
            overdue,
            byCategory,
            byPriority,
            weeklyTrends
        };
    }
}