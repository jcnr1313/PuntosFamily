document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const pointsInput = document.getElementById('points-input');
    const assignedSelect = document.getElementById('assigned-select');
    const taskList = document.getElementById('task-list');
    const totalPointsDisplay = document.getElementById('total-points');

    // Estado de la aplicación
    let tasks = JSON.parse(localStorage.getItem('family_tasks')) || [];
    let totalPoints = parseInt(localStorage.getItem('family_total_points')) || 0;

    // Inicializar la aplicación
    function init() {
        renderTasks();
        updatePointsDisplay();
    }

    // Renderizar la lista de tareas
    function renderTasks() {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="empty-message">No hay tareas pendientes. ¡Agrega una!</li>';
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-info">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                    <span class="task-meta">Asignado a: <strong>${escapeHTML(task.assigned)}</strong> | Puntos: <strong>+${task.points}</strong></span>
                </div>
                <div class="task-actions">
                    <button class="btn-complete" onclick="toggleTask(${index})">
                        ${task.completed ? 'Deshacer' : 'Completar'}
                    </button>
                    <button class="btn-delete" onclick="deleteTask(${index})">Eliminar</button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }

    // Agregar nueva tarea
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = taskInput.value.trim();
        const points = parseInt(pointsInput.value) || 0;
        const assigned = assignedSelect.value;

        if (!title) return;

        const newTask = {
            title,
            points,
            assigned,
            completed: false
        };

        tasks.push(newTask);
        saveAndRender();
        
        taskInput.value = '';
        pointsInput.value = '';
    });

    // Marcar tarea como completada / pendiente
    window.toggleTask = function(index) {
        tasks[index].completed = !tasks[index].completed;
        
        if (tasks[index].completed) {
            totalPoints += tasks[index].points;
        } else {
            totalPoints -= tasks[index].points;
        }

        saveAndRender();
    };

    // Eliminar tarea
    window.deleteTask = function(index) {
        if (tasks[index].completed) {
            totalPoints -= tasks[index].points;
        }
        
        tasks.splice(index, 1);
        saveAndRender();
    };

    // Guardar en LocalStorage y actualizar vista
    function saveAndRender() {
        localStorage.setItem('family_tasks', JSON.stringify(tasks));
        localStorage.setItem('family_total_points', totalPoints);
        renderTasks();
        updatePointsDisplay();
    }

    // Actualizar contador de puntos
    function updatePointsDisplay() {
        if (totalPointsDisplay) {
            totalPointsDisplay.textContent = totalPoints;
        }
    }

    // Función auxiliar para prevenir XSS básico
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    init();
});
