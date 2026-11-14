# Portafolio · Alejandro González Veliz (aka Ese)

---

## Verlo en tu computador

Basta con abrir `index.html` en el navegador. Si quieres que se comporte igual que publicado
(fuentes, rutas, el visor del diagrama), levanta un servidor local:

```bash
python -m http.server 8000
# y abre http://localhost:8000
```

## Publicarlo con GitHub Pages

1. En el repo: **Settings → Pages**.
2. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. Guarda y espera un minuto. Queda en `https://agaquest.github.io/Portafolio/`.

Todas las rutas del sitio son relativas (`css/style.css`, `img/...`), así que funciona tanto en
esa URL como en un dominio propio sin tocar nada. Solo hay dos URLs absolutas a propósito:
`og:url` y `og:image`, porque LinkedIn y WhatsApp no entienden rutas relativas al armar la vista previa.
Si algún día cambias de dominio, actualiza esas dos líneas en el `<head>`.

---

## Qué hay en cada archivo

```
.
├── index.html               contenido y estructura de la página
├── css/style.css            todo el diseño
├── js/main.js               la parte interactiva
├── img/arquitectura-aws.png diagrama de la VPC que se muestra en el proyecto AWS
└── README.md                esto
```

Los tres archivos de código están comentados por dentro. Este README es el mapa general;
los detalles finos están junto al código que explican.

---

## La página, de arriba a abajo

El orden está pensado para alguien que revisa muchos perfiles y tiene poco tiempo:
primero quién soy, después qué sé, qué he hecho, y recién ahí las demos para jugar.

| Sección | Ancla | Qué contiene |
|---|---|---|
| Hero | `#inicio` | Muro de planchas de zinc con el nombre, el rol como salida de terminal y el tag "Ese" en spray morado que se pinta solo; debajo, la bajada y los botones |
| Sobre mí | `#sobre-mi` | Presentación y la ficha `_sys.status // fortalezas`: estudios, certificación, liderazgo, perfil, idiomas y stack |
| Proyectos | `#proyectos` | Tres tarjetas, cada una con su color y su repo |
| Laboratorio | `#laboratorio` | Una terminal y un simulador de mi API de tickets |
| Contacto | `#contacto` | Correo destacado, LinkedIn y GitHub |

---

## Todos los enlaces del sitio

Para saber de un vistazo a dónde lleva cada cosa, y qué revisar si algo cambia.

**Externos** (todos abren en otra pestaña con `target="_blank" rel="noopener"`; el `noopener`
impide que la pestaña nueva pueda manipular esta):

| Dónde aparece | Texto | Destino |
|---|---|---|
| Hero, Contacto | LinkedIn | https://www.linkedin.com/in/alejandro-gonzalez-veliz-2647b3326/ |
| Hero, Contacto | GitHub | https://github.com/AGAquest |
| Proyectos (cabecera) | [ Ver todo en GitHub ] | https://github.com/AGAquest?tab=repositories |
| Tarjeta API de tickets | Ícono de GitHub y Ver código | https://github.com/AGAquest/django-api-gestion |
| Tarjeta Infraestructura AWS | Ícono de GitHub y Ver código | https://github.com/AGAquest/aws-infra-demo |
| Tarjeta CoWork INACAP | Ícono de GitHub y Ver código | https://github.com/AGAquest/mvp-cowork |
| Pie de página | Código de este sitio | https://github.com/AGAquest/Portafolio |
| Terminal, comando `github` | (texto) | https://github.com/AGAquest |

**De correo**

| Dónde | Destino |
|---|---|
| Botón "[ Contactar ]" (hero) y correo grande (contacto) | `mailto:alejandro.aquest@gmail.com`, que abre el programa de correo del visitante con la dirección puesta |

**Internos** (anclas a secciones de la misma página)

| Dónde | Destino |
|---|---|
| Menú (`/sobre-mi`, `/proyectos`…) | `#sobre-mi`, `#proyectos`, `#laboratorio`, `#contacto` |
| Logo `AGV_` | `#inicio` |
| "Saltar al contenido" (aparece al apretar Tab) | `#contenido` |
| Tarjeta API de tickets, "Probar la demo" | `#laboratorio` |

**Botones que parecen enlaces:** "Ver diagrama" y la miniatura del diagrama son `<button>`, no `<a>`,
porque no llevan a otra página: abren el diagrama en grande dentro de la misma.

---

## El diseño (`css/style.css`)

La base es la primera versión de este portafolio: fondo casi negro, paneles grises, Fira Code
para la voz de terminal e Inter para leer, y el verde y morado neón de siempre. Encima va lo mío
de la calle: el muro de zinc de Valparaíso con mi tag "Ese" en spray, y una paleta de cuatro
colores para que el sitio tenga más vida sin perder seriedad.

### La voz de terminal

Se mantiene de la versión original y es parte de la identidad del sitio:

- Logo `AGV_` con el cursor parpadeando.
- Menú escrito como rutas: `/sobre-mi`, `/proyectos`, `/laboratorio`, `/contacto`.
- Títulos como comandos: `> /sobre_mi`, `/ proyectos_destacados`, `# el_laboratorio`, `> /contacto`.
- Botones entre corchetes (`[ Contactar ]`), ficha `_sys.status // fortalezas` y la terminal `agv_terminal ~ zsh` con su prompt `➜ ~`.

### Colores

Cada sección tiene su color y lo usa en todo lo suyo: el símbolo del título, la franja de las
tarjetas, los enlaces y el subrayado del menú. Se asigna con `data-acento="verde|azul|morado|amarillo"`
en el HTML, y el bloque *Acentos por color* del CSS lo traduce a tres variables
(`--acento`, `--acento-texto`, `--acento-tenue`) que heredan todos los hijos.

| Color | Valor | Dónde manda |
|---|---|---|
| Verde | `#39FF14` | Sobre mí, botón principal, rol del hero, cursor |
| Azul | `#38BDF8` | Proyectos |
| Morado | `#B026FF` | Laboratorio y el tag en spray (en letras chicas se usa `#C77DFF`, más legible) |
| Amarillo | `#FACC15` | Contacto y el foco del teclado |

Los cuatro juntos forman la franja que cierra el muro del hero y subraya el correo de contacto.
Los fondos (`#0F0F11`, `#1A1A1E`) y la barra de scroll morada que pasa a verde son los del original.

### Tipografías

- **Fira Code**: títulos, menú, botones, etiquetas, terminal. La voz de terminal.
- **Inter**: el nombre del hero (en 800, mayúsculas) y todo el texto corrido.

### El muro y el tag "Ese"

**El muro.** El hero es un muro de cuatro planchas de zinc ondulado, como las de los cerros de
Valparaíso, una por cada color del sitio en versión profunda (azul, morado, verde, amarillo) para
que el nombre se lea bien encima. Todo es CSS: cada plancha mezcla el color base, franjas de luz y
sombra cada 14 px (la ondulación), una sombra hacia abajo y ruido de pintura gastada. Lleva remaches
arriba y abajo, una luz morada que cae desde arriba, líneas de escaneo suaves y la franja de cuatro
colores al pie. El orden de las planchas importa: el tag morado cae sobre la verde y la amarilla,
donde más contrasta (en celular se reordenan para que siga así).

**El tag.** "Ese" es mi firma a mano alzada, tirada con spray morado. Está dibujada con trazos SVG
(sin fuentes), definidos una sola vez en el sprite del inicio del `<body>` (`#tag-E`, `#tag-s`,
`#tag-e`, subrayado y chorreados) y reutilizados con `<use>`. Cada trazo se pinta en tres capas
para que parezca spray y no una línea de computador:

- **Niebla:** el trazo grueso, desenfocado y "picado" con motas sueltas (filtro `#spray-niebla`), como el polvillo que deja la lata alrededor.
- **Trazo:** la línea principal, con el borde áspero (filtro `#spray-borde`).
- **Núcleo:** una línea clara al centro, donde la pintura carga más.

**La animación** (10 segundos, se repite): el spray recorre la E, la s y la e, después el subrayado
con flecha, y al final la pintura chorrea en tres puntos. Se queda unos segundos, se desvanece y
vuelve a empezar. El tag va detrás del nombre para no tapar nunca lo que hay que leer.

Para cambiar la velocidad, ajusta los `10s` en `style.css` (bloque *Tag "Ese" en spray morado*);
para el ritmo entre trazos, el `.7s` del `animation-delay`.

### Detalles de calidad

- Se adapta desde 320 px de ancho, sin scroll horizontal.
- Todo se puede usar con teclado y el foco siempre se ve (contorno amarillo).
- Respeta `prefers-reduced-motion`: sin animaciones, el tag aparece ya pintado y el cursor queda fijo.

---

## La parte interactiva (`js/main.js`)

Cada bloque revisa primero que su HTML exista, así se puede quitar una sección sin romper el resto.

1. **Almacenamiento seguro.** `localStorage` envuelto en `try/catch`: si el navegador lo bloquea, las demos siguen funcionando en memoria.
2. **Año del pie.** Se pone solo.
3. **Menú.** Marca la sección que estás viendo, usando `IntersectionObserver` (más liviano que escuchar el scroll).
4. **Terminal.** Comandos `ayuda`, `whoami`, `stack`, `estudios`, `proyectos`, `contacto`, `github`, `ese` y `limpiar`, más los clásicos en inglés (`help`, `skills`, `clear`…). Con ↑/↓ recorres el historial.
   Para agregar un comando, suma una entrada en el objeto `comandos`.
5. **Simulador de la API de tickets.** Una versión de bolsillo de [django-api-gestion](https://github.com/AGAquest/django-api-gestion): mismos campos y estados, y cada acción muestra la petición y el código HTTP que respondería el servidor real (`POST 201`, `PATCH 200`, `DELETE 204`, y `400` si falta el título). Los tickets se guardan en el navegador con la clave `agv_tickets`.
6. **Visor del diagrama.** `<dialog>` nativo: el navegador ya resuelve el fondo oscuro, el cierre con Esc y que el Tab no se escape.

Todo lo que escribe el visitante se inserta con `textContent`, nunca con `innerHTML`, así no puede inyectar HTML.

---

## Ideas para más adelante

- Sumar `calculadora_AIH3` como cuarto proyecto (ya está en GitHub).
- Publicar `mvp-cowork` en GitHub Pages y enlazar la demo en vivo desde su afiche.
- En `mvp-cowork/app.js`, cambiar el `innerHTML` de la lista de reservas por `textContent`: hoy un nombre de proyecto con HTML se ejecutaría.
- En `django-api-gestion`, dejar `DEBUG` en `False` por defecto, limitar `ALLOWED_HOSTS` y sacar la `SECRET_KEY` de respaldo del código antes de desplegar.
