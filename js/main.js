// Cada módulo verifica que su HTML exista antes de inicializarse.
document.addEventListener('DOMContentLoaded', () => {
  iniciarAnio();
  iniciarNavegacion();
  iniciarTerminal();
  iniciarApiTickets();
  iniciarDiagrama();
});

/* 1. ALMACENAMIENTO ===================================================== */

// localStorage falla en modo privado, con cuota llena o dentro de iframes.
// En ese caso las demos siguen funcionando en memoria.
const almacen = {
  leer(clave, porDefecto) {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : porDefecto;
    } catch {
      return porDefecto;
    }
  },
  guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { }
  }
};

/* 2. AÑO DEL PIE ======================================================== */

function iniciarAnio() {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
}

/* 3. NAVEGACIÓN ========================================================= */

// Marca con aria-current la sección visible. El rootMargin limita la detección
// a una franja central de la pantalla.
function iniciarNavegacion() {
  const links = [...document.querySelectorAll('.nav__links a')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const porId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      porId.get(entrada.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  porId.forEach((_, id) => {
    const seccion = document.getElementById(id);
    if (seccion) observador.observe(seccion);
  });
}

/* 4. TERMINAL =========================================================== */

// Cada comando devuelve un arreglo de líneas [texto, claseCss].
// Clases disponibles en style.css: t-resp, t-ok, t-error.
function iniciarTerminal() {
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  const salida = document.getElementById('terminal-salida');
  if (!form || !input || !salida) return;

  const historial = [];
  let posicion = 0;

  const comandos = {
    ayuda: () => [
      ['Comandos disponibles:', 't-ok'],
      ['  whoami     quién soy', 't-resp'],
      ['  stack      tecnologías que uso', 't-resp'],
      ['  estudios   formación', 't-resp'],
      ['  proyectos  lo que he construido', 't-resp'],
      ['  contacto   cómo escribirme', 't-resp'],
      ['  github     dónde está mi código', 't-resp'],
      ['  limpiar    borra la pantalla', 't-resp']
    ],
    whoami: () => [['Alejandro González Veliz. Desarrollador full stack y cloud en formación, Valparaíso.', 't-resp']],
    stack: () => [
      ['backend   Python, Django, Django REST Framework', 't-resp'],
      ['frontend  JavaScript, HTML, CSS', 't-resp'],
      ['cloud     AWS: VPC, EC2, RDS, CloudFormation', 't-resp'],
      ['datos     SQL, SQLite, modelado relacional', 't-resp'],
      ['equipo    Scrum, Git, Docker', 't-resp']
    ],
    estudios: () => [
      ['Ingeniería en Informática, INACAP Valparaíso', 't-resp'],
      ['AWS Academy Cloud Foundations', 't-resp']
    ],
    proyectos: () => [
      ['1. API de tickets de soporte (Django REST)', 't-resp'],
      ['2. Infraestructura en AWS (VPC, EC2, RDS)', 't-resp'],
      ['3. CoWork INACAP, MVP de reservas', 't-resp'],
      ['Detalles en la sección Proyectos.', 't-ok']
    ],
    contacto: () => [['alejandro.aquest@gmail.com', 't-ok']],
    github: () => [['https://github.com/AGAquest', 't-ok']],
    ese: () => [['Ese soy yo. Mira el muro de arriba: el tag se vuelve a pintar cada 10 segundos.', 't-ok']],
    sudo: () => [['Permiso denegado. Pero puedes escribirme y conversamos.', 't-error']],
    limpiar: () => { salida.innerHTML = ''; return []; }
  };
  // Alias en inglés.
  Object.assign(comandos, {
    help: comandos.ayuda, skills: comandos.stack, education: comandos.estudios,
    projects: comandos.proyectos, contact: comandos.contacto, clear: comandos.limpiar
  });

  function imprimir(texto, clase) {
    const p = document.createElement('p');
    p.className = clase;
    p.textContent = texto; // nunca innerHTML: la entrada del usuario no se interpreta como HTML
    salida.appendChild(p);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const crudo = input.value.trim();
    input.value = '';
    if (!crudo) return;

    historial.push(crudo);
    posicion = historial.length;
    imprimir(`➜ ~ ${crudo}`, 't-cmd');

    const nombre = crudo.toLowerCase().split(/\s+/)[0];
    const comando = comandos[nombre];
    if (comando) {
      comando().forEach(([texto, clase]) => imprimir(texto, clase));
    } else {
      imprimir(`comando no encontrado: ${nombre}. Escribe "ayuda" para ver la lista.`, 't-error');
    }
    salida.scrollTop = salida.scrollHeight;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && posicion > 0) {
      posicion--;
      input.value = historial[posicion];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      posicion = Math.min(posicion + 1, historial.length);
      input.value = historial[posicion] ?? '';
      e.preventDefault();
    }
  });

  // Sin autofocus en el input: provocaba scroll hasta esta sección al cargar la página.
  salida.addEventListener('click', () => input.focus());
}

/* 5. API DE TICKETS ===================================================== */

// Simula en el navegador el TicketViewSet de django-api-gestion: mismos campos,
// estados y códigos HTTP (POST 201, PATCH 200, DELETE 204, 400 sin título).
function iniciarApiTickets() {
  const form = document.getElementById('ticket-form');
  const input = document.getElementById('ticket-input');
  const lista = document.getElementById('ticket-lista');
  const respuesta = document.getElementById('api-respuesta');
  if (!form || !input || !lista || !respuesta) return;

  const CLAVE = 'agv_tickets';
  const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO'];
  const ETIQUETAS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto' };

  let tickets = almacen.leer(CLAVE, [
    { id: 2, titulo: 'Migrar base de datos a AWS RDS', estado: 'EN_PROCESO', fecha_creacion: '2026-03-02T10:00:00Z' },
    { id: 1, titulo: 'Refactorizar vistas en Django', estado: 'RESUELTO', fecha_creacion: '2026-03-01T10:00:00Z' }
  ]);

  function responder(metodo, ruta, codigo, tipo) {
    respuesta.dataset.tipo = tipo;
    respuesta.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${metodo} ${ruta}`;
    respuesta.append(b, `  ${codigo}`);
  }

  function guardarYRender() {
    almacen.guardar(CLAVE, tickets);
    render();
  }

  function render() {
    lista.innerHTML = '';
    if (!tickets.length) {
      const vacio = document.createElement('li');
      vacio.className = 'api__vacio';
      vacio.textContent = 'No hay tickets. Crea uno para ver la respuesta de la API.';
      lista.appendChild(vacio);
      return;
    }

    tickets.forEach(t => {
      const li = document.createElement('li');
      li.className = 'ticket';

      const titulo = document.createElement('span');
      titulo.className = 'ticket__titulo';
      titulo.textContent = t.titulo;

      const estado = document.createElement('span');
      estado.className = 'ticket__estado';
      estado.dataset.estado = t.estado;
      estado.textContent = ETIQUETAS[t.estado];

      const acciones = document.createElement('div');
      acciones.className = 'ticket__acciones';

      const avanzar = document.createElement('button');
      avanzar.type = 'button';
      avanzar.textContent = 'Avanzar';
      avanzar.disabled = t.estado === 'RESUELTO';
      avanzar.setAttribute('aria-label', `Avanzar estado de "${t.titulo}"`);
      avanzar.addEventListener('click', () => avanzarEstado(t.id));

      const borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.textContent = 'Eliminar';
      borrar.setAttribute('aria-label', `Eliminar "${t.titulo}"`);
      borrar.addEventListener('click', () => eliminar(t.id));

      acciones.append(avanzar, borrar);
      li.append(titulo, estado, acciones);
      lista.appendChild(li);
    });
  }

  // POST /api/tickets/
  form.addEventListener('submit', e => {
    e.preventDefault();
    const titulo = input.value.trim();
    if (!titulo) {
      input.setAttribute('aria-invalid', 'true');
      responder('POST', '/api/tickets/', '400 Bad Request: el título es obligatorio', 'error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    const id = Math.max(0, ...tickets.map(t => t.id)) + 1;
    tickets.unshift({ id, titulo, estado: 'PENDIENTE', fecha_creacion: new Date().toISOString() });
    input.value = '';
    responder('POST', '/api/tickets/', '201 Created', 'ok');
    guardarYRender();
  });

  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));

  // PATCH /api/tickets/:id/  PENDIENTE → EN_PROCESO → RESUELTO
  function avanzarEstado(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;
    const siguiente = ESTADOS[ESTADOS.indexOf(ticket.estado) + 1];
    if (!siguiente) return;
    ticket.estado = siguiente;
    responder('PATCH', `/api/tickets/${id}/`, `200 OK  estado=${siguiente}`, 'ok');
    guardarYRender();
  }

  // DELETE /api/tickets/:id/
  function eliminar(id) {
    tickets = tickets.filter(t => t.id !== id);
    responder('DELETE', `/api/tickets/${id}/`, '204 No Content', 'ok');
    guardarYRender();
  }

  render();
}

/* 6. DIAGRAMA ============================================================ */

function iniciarDiagrama() {
  const dialogo = document.getElementById('dialogo-diagrama');
  if (!dialogo || typeof dialogo.showModal !== 'function') return;

  document.querySelectorAll('[data-abrir-diagrama]').forEach(boton =>
    boton.addEventListener('click', () => dialogo.showModal())
  );
  dialogo.querySelector('[data-cerrar-dialogo]')?.addEventListener('click', () => dialogo.close());
  // Un clic en el fondo tiene como target el propio <dialog>.
  dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });
}