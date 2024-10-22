"use strict";

const taskList = document.getElementById('task-list');
const newTaskText = document.getElementById('new-task-text');
const newTaskDate = document.getElementById('new-task-date');
const addTaskButton = document.getElementById('add-task');
const searchInput = document.getElementById('search-bar');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentEditingIndex = null;

const closeEditingTask = (saveChanges = false) => {
    if (currentEditingIndex !== null) {
        const taskItem = taskList.children[currentEditingIndex];
        if (taskItem) {
            if (saveChanges) {
                const inputName = taskItem.querySelector('.edit-name');
                const inputDate = taskItem.querySelector('.edit-date');

                if (inputName.value.length < 3 || inputName.value.length > 255) {
                    alert('Zadanie musi mieć od 3 do 255 znaków.');
                    return;
                }

                const today = new Date().toISOString().split('T')[0];
                if (inputDate.value && inputDate.value < today) {
                    alert('Błędna data.');
                    return;
                }

                tasks[currentEditingIndex].name = inputName.value;
                tasks[currentEditingIndex].date = inputDate.value;
                saveTasks();
            }
            taskItem.classList.remove('edit-mode');
        }
        currentEditingIndex = null;
        renderTasks();
    }
};

const openEditingTask = (taskItem, task, index) => {
    if (currentEditingIndex === index) {
        return;
    }

    closeEditingTask();

    currentEditingIndex = index;

    const spanName = taskItem.querySelector('.task-name');
    const spanDate = taskItem.querySelector('.task-date');

    taskItem.classList.add('edit-mode');

    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.value = task.name;
    inputName.classList.add('edit-name');

    const inputDate = document.createElement('input');
    inputDate.type = 'date';
    inputDate.value = task.date || '';
    inputDate.classList.add('edit-date');

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Zapisz';
    saveButton.classList.add('save-task');

    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.style.display = 'none';

    spanName.replaceWith(inputName);
    spanDate.replaceWith(inputDate);
    taskItem.querySelector('.delete-task').before(saveButton);

    document.addEventListener('click', function saveOnClickOutside(event) {
        const taskItem = taskList.children[currentEditingIndex];

        if (currentEditingIndex !== null && taskItem && !taskItem.contains(event.target)) {
            closeEditingTask(true);
            document.removeEventListener('click', saveOnClickOutside);
        }
    }, { capture: true });

    saveButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (inputName.value.length < 3 || inputName.value.length > 255) {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            return;
        }
    
        const today = new Date().toISOString().split('T')[0];
        if (inputDate.value && inputDate.value < today) {
            alert('Błędna data.');
            return;
        }

        task.name = inputName.value;
        task.date = inputDate.value;
        saveTasks();
        closeEditingTask();
    });
};

const renderTasks = (filteredTasks = tasks) => {
    taskList.innerHTML = '';

    filteredTasks.forEach((task, index) => {

        if (index === currentEditingIndex) {
            return;
        }

        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-name">${highlight(task.name, searchInput.value)}</span> 
            <span class="task-date">${task.date ? task.date : ''}</span>
            <button class="delete-task"></button>
        `;
        taskList.appendChild(taskItem);

        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
        });

        taskItem.querySelector('.delete-task').addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        taskItem.addEventListener('click', (e) => {
            if (e.target === checkbox || e.target.classList.contains('delete-task')) {
                return;
            }
        
            openEditingTask(taskItem, task, index);
        });
    });
};

const addTask = () => {
    const taskName = newTaskText.value.trim();
    const taskDate = newTaskDate.value;

    if (taskName.length < 3 || taskName.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (taskDate && taskDate < today) {
        alert('Błędna data.');
        return;
    }

    const task = {
        name: taskName,
        date: taskDate,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    newTaskText.value = '';
    newTaskDate.value = '';
}

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addTaskButton.addEventListener('click', addTask);

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm.length >= 2) {
        const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchTerm));
        renderTasks(filteredTasks);
    } else {
        renderTasks(tasks);
    }
});

const highlight = (text, term) => {
    if (!term || term.length < 2) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

renderTasks();
