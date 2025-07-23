// SettingsManager.js - Handles user settings and preferences

export class SettingsManager {
    constructor(app) {
        this.app = app;
        this.settings = {
            theme: 'light',
            notifications: false
        };
    }
    
    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('tickToNextSettings');
        
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.applySettings();
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('tickToNextSettings', JSON.stringify(this.settings));
    }
    
    // Apply current settings to the UI
    applySettings() {
        // Apply theme
        if (this.settings.theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('theme-toggle').checked = true;
            document.getElementById('theme-label').textContent = 'Dark';
        } else {
            document.body.removeAttribute('data-theme');
            document.getElementById('theme-toggle').checked = false;
            document.getElementById('theme-label').textContent = 'Light';
        }
        
        // Apply notification setting
        document.getElementById('notification-toggle').checked = this.settings.notifications;
    }
    
    // Toggle between light and dark theme
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applySettings();
        
        // Update charts if statistics are open
        if (!document.getElementById('stats-modal').classList.contains('hidden')) {
            this.app.statisticsManager.updateStatistics();
        }
    }
    
    // Toggle notifications
    toggleNotifications() {
        this.settings.notifications = !this.settings.notifications;
        this.saveSettings();
        
        // Request notification permission if enabled
        if (this.settings.notifications && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }
    
    // Update categories list in settings
    updateCategoriesList() {
        const categoriesList = document.getElementById('categories-list');
        const categories = this.app.taskManager.getCategories();
        
        // Clear list
        categoriesList.innerHTML = '';
        
        // Add categories
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.setAttribute('data-category-id', category.id);
            
            // Check if it's a default category
            const isDefaultCategory = ['home', 'personal', 'work', 'study', 'others'].includes(category.id);
            
            categoryItem.innerHTML = `
                <div class="category-name-display">
                    <span class="category-color" style="background-color: ${category.color}"></span>
                    <span>${category.name}</span>
                </div>
                <div class="category-actions">
                    <button class="edit-category" aria-label="Edit category">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${!isDefaultCategory ? `
                    <button class="delete-category" aria-label="Delete category">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </div>
            `;
            
            // Add event listeners
            const editButton = categoryItem.querySelector('.edit-category');
            editButton.addEventListener('click', () => {
                this.openEditCategoryModal(category);
            });
            
            if (!isDefaultCategory) {
                const deleteButton = categoryItem.querySelector('.delete-category');
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete the category "${category.name}"?\nTasks in this category will be moved to "Others".`)) {
                        this.app.deleteCategory(category.id);
                    }
                });
            }
            
            categoriesList.appendChild(categoryItem);
        });
    }
    
    // Open edit category modal
    openEditCategoryModal(category) {
        // Create a modal for editing category
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Category</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="edit-category-form">
                    <div class="form-group">
                        <label for="category-name">Category Name</label>
                        <input type="text" id="category-name" value="${category.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="category-color">Category Color</label>
                        <input type="color" id="category-color" value="${category.color}">
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancel-category">Cancel</button>
                        <button type="button" id="save-category">Save</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.close-modal');
        const cancelButton = modal.querySelector('#cancel-category');
        const saveButton = modal.querySelector('#save-category');
        
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeButton.addEventListener('click', closeModal);
        cancelButton.addEventListener('click', closeModal);
        
        saveButton.addEventListener('click', () => {
            const newName = document.getElementById('category-name').value.trim();
            const newColor = document.getElementById('category-color').value;
            
            if (newName) {
                this.app.updateCategory(category.id, newName, newColor);
                closeModal();
            }
        });
    }
    
    // Check for due tasks and send notifications
    checkDueTasksNotifications() {
        // Only proceed if notifications are enabled and permission is granted
        if (!this.settings.notifications || Notification.permission !== 'granted') {
            return;
        }
        
        const now = new Date();
        const tasks = this.app.taskManager.getAllTasks();
        
        tasks.forEach(task => {
            if (task.completed) return;
            
            const dueDate = new Date(task.dueDate);
            
            // Check if task is due within the next hour
            const timeDiff = dueDate.getTime() - now.getTime();
            const hourInMs = 60 * 60 * 1000;
            
            if (timeDiff > 0 && timeDiff <= hourInMs) {
                // Check if we've already notified for this task
                const notifiedTasks = JSON.parse(localStorage.getItem('tickToNextNotifiedTasks') || '[]');
                
                if (!notifiedTasks.includes(task.id)) {
                    // Send notification
                    const notification = new Notification('Task Due Soon', {
                        body: `"${task.title}" is due in ${Math.round(timeDiff / (60 * 1000))} minutes`,
                        icon: '/favicon.ico'
                    });
                    
                    // Add to notified tasks
                    notifiedTasks.push(task.id);
                    localStorage.setItem('tickToNextNotifiedTasks', JSON.stringify(notifiedTasks));
                }
            }
        });
    }
    
    // Start notification checking
    startNotificationChecks() {
        // Check for notifications every minute
        setInterval(() => {
            this.checkDueTasksNotifications();
        }, 60 * 1000);
    }
}