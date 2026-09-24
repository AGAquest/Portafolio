document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
        TERMINAL INTERACTIVA
    ========================================= */
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');

    const commands = {
        'help': 'Comandos disponibles: skills, education, clear',
        'skills': '=> Python, Django, AWS Cloud, Bases de Datos, Metodologías Ágiles.',
        'education': '=> Estudiante Ingeniería en Informática (INACAP Valparaíso).',
        'clear': '' // Lógica especial abajo
    };

    termInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const command = this.value.trim().toLowerCase();
            this.value = ''; // Limpiar input

            if (command === '') return;

            // Mostrar el comando ingresado
            printToTerminal(`➜ ~ ${command}`, 'text-white');

            // Lógica de comandos
            if (command === 'clear') {
                termOutput.innerHTML = '';
            } else if (commands[command]) {
                printToTerminal(commands[command], 'text-gray-400');
            } else {
                printToTerminal(`zsh: command not found: ${command}`, 'text-red-400');
            }
            
            // Auto-scroll hacia abajo
            termOutput.scrollTop = termOutput.scrollHeight;
        }
    });

    function printToTerminal(text, colorClass) {
        const p = document.createElement('p');
        p.className = colorClass;
        p.textContent = text;
        termOutput.appendChild(p);
    }

    /* =========================================
       SIMULADOR CRUD (Memoria Local)
    ========================================= */
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // Tareas iniciales de ejemplo demostrando conocimientos
    let tasks = [
        { id: 1, text: 'Migrar base de datos a AWS RDS' },
        { id: 2, text: 'Refactorizar vistas en Django' }
    ];

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-urban-dark border border-gray-800 p-2 text-sm';
            
            const span = document.createElement('span');
            span.textContent = task.text;
            span.className = 'text-gray-300';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'DEL';
            deleteBtn.className = 'text-xs font-mono text-red-500 hover:text-red-400 ml-2';
            deleteBtn.onclick = () => deleteTask(task.id);

            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text !== '') {
            const newTask = {
                id: Date.now(),
                text: text
            };
            tasks.push(newTask);
            taskInput.value = '';
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Render inicial
    renderTasks();
});