# Tick To Next - Task Management Mobile App

## Overview

Tick To Next is a responsive, mobile-first task management web application built with vanilla JavaScript, HTML, and CSS. It helps users organize and manage tasks effectively with clear categorization, filters, and an engaging UI.

## Features

### Core Features

1. **Daily Task List**
   - View tasks scheduled for today
   - Add, edit, and delete tasks
   - Mark tasks as complete with checkboxes
   - Color-coded task borders based on priority (High, Medium, Low)

2. **Upcoming Tasks**
   - View tasks due in the next 7 days
   - Sort and filter by category, date, or priority

3. **Missed Tasks**
   - Automatically detect and highlight overdue tasks

4. **Custom Task Categories**
   - Default categories: Home, Personal, Work, Study, Others
   - Create, rename, and manage custom categories
   - Color-coded category badges

5. **Subtasks**
   - Add checklists of smaller steps within each task
   - Expand/collapse subtasks with animation

6. **Calendar Integration**
   - Month view with task indicators
   - Click dates to view tasks for specific days

7. **Statistics Dashboard**
   - Pie chart for completed, pending, and missed tasks
   - Weekly task trends with bar graph
   - Category breakdown

8. **Filters**
   - Filter by category, date, and priority

9. **Settings**
   - Toggle between light and dark themes
   - Enable/disable notifications
   - Manage categories
   - Clear completed tasks

## Technical Details

- **Responsive Design**: Fully responsive layout that works on mobile devices and desktops
- **Local Storage**: Tasks and settings are saved in the browser's local storage
- **Modular Architecture**: Code is organized into separate manager classes for different functionalities
- **Animations**: Smooth transitions and animations for a better user experience
- **No Framework**: Built with vanilla JavaScript without heavy frameworks
- **Chart.js**: Used for statistics visualization
- **GSAP**: Used for advanced animations

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a web browser

No build process or server setup is required as this is a client-side application.

## Usage

- **Adding Tasks**: Click the + button to add a new task
- **Editing Tasks**: Click the edit icon on a task or swipe left on mobile
- **Completing Tasks**: Check the checkbox or swipe right on mobile
- **Viewing Statistics**: Click the chart icon in the header
- **Changing Settings**: Click the gear icon in the header

## Browser Support

Tick To Next works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and commercial use.