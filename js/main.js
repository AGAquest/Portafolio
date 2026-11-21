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

// Cliente del TicketViewSet de django-api-gestion desplegado en Render.
// Usa la API real (GET, POST 201, PATCH 200, DELETE 204).
function iniciarApiTickets() {
  const form = document.getElementById('ticket-form');
  const input = document.getElementById('ticket-input');
  const lista = document.getElementById('ticket-lista');
  const respuesta = document.getElementById('api-respuesta');
  if (!form || !input || !lista || !respuesta) return;

  const API = 'https://django-api-gestion.onrender.com/api/tickets/';
  const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO'];
  const ETIQUETAS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto' };
  const boton = form.querySelector('button[type="submit"]');

  let tickets = [];
  let ocupado = false;

  function responder(metodo, ruta, codigo, tipo) {
    respuesta.dataset.tipo = tipo;
    respuesta.innerHTML = '';
    const b = document.createElement('b');
    b.textContent = `${metodo} ${ruta}`;
    respuesta.append(b, `  ${codigo}`);
  }

  // El plan gratis de Render duerme el servicio: la primera petición puede tardar ~50 s.
  async function pedir(metodo, ruta, cuerpo) {
    const aviso = setTimeout(() => {
      responder(metodo, ruta, 'despertando el servidor en Render (puede tardar ~50 s)…', 'info');
    }, 2500);
    try {
      const res = await fetch(API + ruta, {
        method: metodo,
        headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
      });
      const datos = res.status === 204 ? null : await res.json().catch(() => null);
      return { res, datos };
    } finally {
      clearTimeout(aviso);
    }
  }

  function setOcupado(valor) {
    ocupado = valor;
    if (boton) boton.disabled = valor;
    lista.querySelectorAll('button').forEach(b => { b.disabled = valor || b.dataset.fijo === 'true'; });
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
      estado.textContent = ETIQUETAS[t.estado] || t.estado;

      const acciones = document.createElement('div');
      acciones.className = 'ticket__acciones';

      const avanzar = document.createElement('button');
      avanzar.type = 'button';
      avanzar.textContent = 'Avanzar';
      avanzar.dataset.fijo = String(t.estado === 'RESUELTO');
      avanzar.disabled = ocupado || t.estado === 'RESUELTO';
      avanzar.setAttribute('aria-label', `Avanzar estado de "${t.titulo}"`);
      avanzar.addEventListener('click', () => avanzarEstado(t.id));

      const borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.textContent = 'Eliminar';
      borrar.disabled = ocupado;
      borrar.setAttribute('aria-label', `Eliminar "${t.titulo}"`);
      borrar.addEventListener('click', () => eliminar(t.id));

      acciones.append(avanzar, borrar);
      li.append(titulo, estado, acciones);
      lista.appendChild(li);
    });
  }

  function error(metodo, ruta, res, datos) {
    const detalle = datos && typeof datos === 'object'
      ? Object.entries(datos).map(([k, v]) => `${k}: ${[].concat(v).join(' ')}`).join(' · ')
      : '';
    responder(metodo, ruta, res ? `${res.status} ${res.statusText} ${detalle}`.trim() : 'sin conexión con el servidor', 'error');
  }

  // GET /api/tickets/
  async function cargar() {
    setOcupado(true);
    try {
      const { res, datos } = await pedir('GET', '');
      if (!res.ok) return error('GET', '/api/tickets/', res, datos);
      tickets = Array.isArray(datos) ? datos : (datos?.results || []);
      responder('GET', '/api/tickets/', `${res.status} OK  ${tickets.length} ticket(s)`, 'ok');
    } catch {
      error('GET', '/api/tickets/');
    } finally {
      setOcupado(false);
      render();
    }
  }

  // POST /api/tickets/
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (ocupado) return;
    const titulo = input.value.trim();
    if (!titulo) {
      input.setAttribute('aria-invalid', 'true');
      responder('POST', '/api/tickets/', '400 Bad Request: el título es obligatorio', 'error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    setOcupado(true);
    try {
      const { res, datos } = await pedir('POST', '', {
        titulo,
        descripcion: 'Creado desde el portafolio',
        estado: 'PENDIENTE'
      });
      if (!res.ok) return error('POST', '/api/tickets/', res, datos);
      tickets.unshift(datos);
      input.value = '';
      responder('POST', '/api/tickets/', `${res.status} Created  id=${datos.id}`, 'ok');
    } catch {
      error('POST', '/api/tickets/');
    } finally {
      setOcupado(false);
      render();
    }
  });

  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));

  // PATCH /api/tickets/:id/  PENDIENTE → EN_PROCESO → RESUELTO
  async function avanzarEstado(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket || ocupado) return;
    const siguiente = ESTADOS[ESTADOS.indexOf(ticket.estado) + 1];
    if (!siguiente) return;
    const ruta = `/api/tickets/${id}/`;
    setOcupado(true);
    try {
      const { res, datos } = await pedir('PATCH', `${id}/`, { estado: siguiente });
      if (!res.ok) return error('PATCH', ruta, res, datos);
      Object.assign(ticket, datos);
      responder('PATCH', ruta, `${res.status} OK  estado=${ticket.estado}`, 'ok');
    } catch {
      error('PATCH', ruta);
    } finally {
      setOcupado(false);
      render();
    }
  }

  // DELETE /api/tickets/:id/
  async function eliminar(id) {
    if (ocupado) return;
    const ruta = `/api/tickets/${id}/`;
    setOcupado(true);
    try {
      const { res, datos } = await pedir('DELETE', `${id}/`);
      if (!res.ok) return error('DELETE', ruta, res, datos);
      tickets = tickets.filter(t => t.id !== id);
      responder('DELETE', ruta, `${res.status} No Content`, 'ok');
    } catch {
      error('DELETE', ruta);
    } finally {
      setOcupado(false);
      render();
    }
  }

  render();
  cargar();
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
