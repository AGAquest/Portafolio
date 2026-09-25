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
        'clear': '' 
    };

    termInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const command = this.value.trim().toLowerCase();
            this.value = ''; 

            if (command === '') return;

            printToTerminal(`➜ ~ ${command}`, 'text-white');

            if (command === 'clear') {
                termOutput.innerHTML = '';
            } else if (commands[command]) {
                printToTerminal(commands[command], 'text-gray-400');
            } else {
                printToTerminal(`zsh: command not found: ${command}`, 'text-red-400');
            }
            
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
        API REAL (Conectado a Render/Django)
    ========================================= */
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    // La URL de tu API en Render
    const API_URL = 'https://django-api-gestion.onrender.com/api/tickets/';

    // 1. LEER los tickets desde la base de datos (GET)
    async function fetchTasks() {
        try {
            taskList.innerHTML = '<li class="text-gray-500 text-xs font-mono p-2">Cargando datos desde Render...</li>';
            const response = await fetch(API_URL);
            const data = await response.json();
            renderTasks(data);
        } catch (error) {
            taskList.innerHTML = '<li class="text-red-500 text-xs font-mono p-2">Error de conexión con la API en Render.</li>';
        }
    }

    // 2. RENDERIZAR los tickets en la pantalla
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<li class="text-gray-500 text-xs font-mono p-2">No hay tickets en la base de datos.</li>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-urban-dark border border-gray-800 p-2 text-sm';
            
            const span = document.createElement('span');
            span.textContent = task.titulo; // Usamos el campo "titulo" de tu modelo Django
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

    // 3. CREAR un nuevo ticket en la base de datos (POST)
    async function addTask() {
        const titulo = taskInput.value.trim();
        if (titulo !== '') {
            addTaskBtn.textContent = '...'; 
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Estructura requerida por tu modelo TicketSoporte
                    body: JSON.stringify({ 
                        titulo: titulo,
                        descripcion: 'Ticket generado desde el portafolio',
                        estado: 'PENDIENTE'
                    })
                });
                taskInput.value = '';
                fetchTasks(); // Recargar la lista después de crear
            } catch (error) {
                console.error('Error al crear el ticket:', error);
            }
            addTaskBtn.textContent = 'POST';
        }
    }

    // 4. ELIMINAR un ticket de la base de datos (DELETE)
    async function deleteTask(id) {
        try {
            await fetch(`${API_URL}${id}/`, {
                method: 'DELETE'
            });
            fetchTasks(); // Recargar la lista después de borrar
        } catch (error) {
            console.error('Error al borrar el ticket:', error);
        }
    }

    // Event Listeners para los botones
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Iniciar la carga de datos al abrir la página
    fetchTasks();
});
