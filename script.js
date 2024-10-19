"use strict";

// Pobieranie elementów z DOM
const taskList = document.getElementById('task-list');
const newTaskText = document.getElementById('new-task-text');
const newTaskDate = document.getElementById('new-task-date');
const addTaskButton = document.getElementById('add-task');
const searchInput = document.getElementById('search-bar');

// Wczytanie zadań z Local Storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Śledzenie aktualnie edytowanego zadania
let currentEditingIndex = null;

// Funkcja zamykająca wszystkie otwarte edycje
const closeEditingTask = () => {
    if (currentEditingIndex !== null) {
        // Zapisujemy bieżący stan
        renderTasks();  // Renderujemy ponownie, przywracając widok
        currentEditingIndex = null; // Resetowanie stanu
    }
};

// Funkcja otwierająca edycję nowego zadania
const openEditingTask = (taskItem, task, index) => {
    const spanName = taskItem.querySelector('.task-name');
    const spanDate = taskItem.querySelector('.task-date');

    // Tworzymy elementy formularza edycji
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

    // Ukryj checkbox podczas edycji
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    checkbox.style.display = 'none';

    // Zamiana istniejących elementów na pola edycji i zmiana układu
    spanName.replaceWith(inputName);
    spanDate.replaceWith(inputDate);
    taskItem.querySelector('.delete-task').before(saveButton);

    // Ustawiamy indeks aktualnie edytowanego zadania
    currentEditingIndex = index;

    // Obsługa przycisku "Zapisz"
    saveButton.addEventListener('click', () => {
        task.name = inputName.value;
        task.date = inputDate.value;
        saveTasks();
        renderTasks();  // Odświeżenie widoku po zapisaniu
        currentEditingIndex = null; // Reset stanu po zapisaniu
    });
};

// Funkcja renderowania zadań
const renderTasks = (filteredTasks = tasks) => {
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-name">${highlight(task.name, searchInput.value)}</span> 
            <span class="task-date">${task.date ? task.date : ''}</span>
            <button class="delete-task"></button>
        `;
        taskList.appendChild(taskItem);

        // Zmiana stanu checkboxa i zapis do Local Storage
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
        });

        // Usuwanie zadania
        taskItem.querySelector('.delete-task').addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        // Tryb edycji zadania (nazwa + data + przycisk "Zapisz")
        taskItem.addEventListener('click', (e) => {
            // Sprawdzamy, czy kliknięto w checkbox lub przycisk usuń - wtedy ignorujemy
            if (e.target === checkbox || e.target.classList.contains('delete-task')) {
                return;
            }

            // Zamknięcie poprzedniej edycji
            closeEditingTask();

            // Otwórz edycję klikniętego zadania
            openEditingTask(taskItem, task, index);
        });
    });
};

// Funkcja dodawania zadania
const addTask = () => {
    const taskName = newTaskText.value.trim();
    const taskDate = newTaskDate.value;

    // Walidacja
    if (taskName.length < 3 || taskName.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (taskDate && taskDate <= today) {
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

// Funkcja zapisywania zadań do Local Storage
const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Dodawanie zadania po kliknięciu na przycisk
addTaskButton.addEventListener('click', addTask);

const highlight = (text, term) => {
    if (!term || term.length < 2) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

searchInput.addEventListener('input', () => {
    renderTasks();
});

// Renderowanie zadań po załadowaniu strony
renderTasks();
