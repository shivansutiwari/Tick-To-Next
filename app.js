// Import modules
import { TaskManager } from './taskManager.js';
import { UIManager } from './uiManager.js';
import { CalendarManager } from './calendarManager.js';
import { StatisticsManager } from './statisticsManager.js';
import { SettingsManager } from './settingsManager.js';

// Main App Class
export class App {
    constructor() {
        // Initialize managers
        this.taskManager = new TaskManager();
        this.uiManager = new UIManager(this);
        this.calendarManager = new CalendarManager(this);
        this.statisticsManager = new StatisticsManager(this);
        this.settingsManager = new SettingsManager(this);
    }
    
    init() {
        // Load saved data
        this.taskManager.loadTasks();
        this.settingsManager.loadSettings();
        
        // Initialize UI
        this.uiManager.initUI();
        this.calendarManager.initCalendar();
        
        // Render initial data
        this.refreshAllViews();
    }
    
    refreshAllViews() {
        // Update all views with current data
        this.uiManager.renderTasks();
        this.calendarManager.renderCalendar();
        this.statisticsManager.updateStatistics();
    }
    
    // Task Management Methods
    addTask(taskData) {
        const newTask = this.taskManager.addTask(taskData);
        this.refreshAllViews();
        return newTask;
    }
    
    updateTask(taskId, taskData) {
        this.taskManager.updateTask(taskId, taskData);
        this.refreshAllViews();
    }
    
    deleteTask(taskId) {
        this.taskManager.deleteTask(taskId);
        this.refreshAllViews();
    }
    
    toggleTaskCompletion(taskId) {
        this.taskManager.toggleTaskCompletion(taskId);
        this.refreshAllViews();
    }
    
    // Subtask Methods
    addSubtask(taskId, subtaskText) {
        this.taskManager.addSubtask(taskId, subtaskText);
        this.uiManager.renderTasks();
    }
    
    toggleSubtaskCompletion(taskId, subtaskId) {
        this.taskManager.toggleSubtaskCompletion(taskId, subtaskId);
        this.uiManager.renderTasks();
    }
    
    // Filter Methods
    applyFilters(filters) {
        this.taskManager.setFilters(filters);
        this.uiManager.renderTasks();
    }
    
    clearFilters() {
        this.taskManager.clearFilters();
        this.uiManager.renderTasks();
    }
    
    // Category Methods
    addCategory(categoryName, color) {
        this.taskManager.addCategory(categoryName, color);
        this.settingsManager.updateCategoriesList();
        this.uiManager.updateCategoryDropdowns();
    }
    
    updateCategory(categoryId, newName, newColor) {
        this.taskManager.updateCategory(categoryId, newName, newColor);
        this.settingsManager.updateCategoriesList();
        this.uiManager.updateCategoryDropdowns();
        this.uiManager.renderTasks();
    }
    
    deleteCategory(categoryId) {
        this.taskManager.deleteCategory(categoryId);
        this.settingsManager.updateCategoriesList();
        this.uiManager.updateCategoryDropdowns();
        this.uiManager.renderTasks();
    }
    
    // Settings Methods
    toggleTheme() {
        this.settingsManager.toggleTheme();
    }
    
    toggleNotifications() {
        this.settingsManager.toggleNotifications();
    }
    
    clearCompletedTasks() {
        this.taskManager.clearCompletedTasks();
        this.refreshAllViews();
    }
}

// Export the App class for use in main.js