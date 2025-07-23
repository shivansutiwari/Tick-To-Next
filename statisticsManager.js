// StatisticsManager.js - Handles statistics and charts

export class StatisticsManager {
    constructor(app) {
        this.app = app;
        this.charts = {
            completion: null,
            trends: null,
            categories: null
        };
    }
    
    // Update all statistics charts
    updateStatistics() {
        const stats = this.app.taskManager.getTaskStatistics();
        this.updateCompletionChart(stats);
        this.updateTrendsChart(stats);
        this.updateCategoriesChart(stats);
    }
    
    // Update completion pie chart
    updateCompletionChart(stats) {
        const ctx = document.getElementById('completion-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.completion) {
            this.charts.completion.destroy();
        }
        
        // Create data for pie chart
        const data = {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [stats.completed, stats.pending - stats.overdue, stats.overdue],
                backgroundColor: [
                    '#33d9b2', // Completed - Green
                    '#4a6fa5', // Pending - Blue
                    '#ff5252'  // Overdue - Red
                ],
                borderWidth: 0
            }]
        };
        
        // Create chart
        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getTextColor()
                        }
                    },
                    title: {
                        display: true,
                        text: 'Task Completion Status',
                        color: this.getTextColor(),
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    // Update weekly trends bar chart
    updateTrendsChart(stats) {
        const ctx = document.getElementById('trends-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }
        
        // Format dates for labels
        const labels = stats.weeklyTrends.map(day => {
            const date = new Date(day.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });
        
        // Create data for bar chart
        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Total Tasks',
                    data: stats.weeklyTrends.map(day => day.total),
                    backgroundColor: '#4a6fa5',
                    borderWidth: 0
                },
                {
                    label: 'Completed Tasks',
                    data: stats.weeklyTrends.map(day => day.completed),
                    backgroundColor: '#33d9b2',
                    borderWidth: 0
                }
            ]
        };
        
        // Create chart
        this.charts.trends = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: this.getTextColor()
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: this.getTextColor()
                        },
                        grid: {
                            color: this.getGridColor()
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getTextColor()
                        }
                    },
                    title: {
                        display: true,
                        text: 'Weekly Task Trends',
                        color: this.getTextColor(),
                        font: {
                            size: 16
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Update categories pie chart
    updateCategoriesChart(stats) {
        const ctx = document.getElementById('categories-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.categories) {
            this.charts.categories.destroy();
        }
        
        // Get categories and their colors
        const categories = this.app.taskManager.getCategories();
        const categoryData = [];
        const categoryColors = [];
        const categoryLabels = [];
        
        categories.forEach(category => {
            const count = stats.byCategory[category.id] || 0;
            if (count > 0) {
                categoryData.push(count);
                categoryColors.push(category.color);
                categoryLabels.push(category.name);
            }
        });
        
        // Create data for pie chart
        const data = {
            labels: categoryLabels,
            datasets: [{
                data: categoryData,
                backgroundColor: categoryColors,
                borderWidth: 0
            }]
        };
        
        // Create chart
        this.charts.categories = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getTextColor()
                        }
                    },
                    title: {
                        display: true,
                        text: 'Tasks by Category',
                        color: this.getTextColor(),
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    // Get text color based on current theme
    getTextColor() {
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        return isDarkTheme ? '#e0e0e0' : '#333333';
    }
    
    // Get grid color based on current theme
    getGridColor() {
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        return isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }
}