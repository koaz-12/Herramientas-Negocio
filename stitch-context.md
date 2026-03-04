# Contexto Maestro para Stitch (Business Hub Pro)

> **Instrucciones de Uso:** Copia y pega las siguientes tres secciones al inicio de CUALQUIER prompt cuando le pidas a Stitch que te construya una página, componente o sección nueva para nuestra aplicación.

---

Hola Stitch. Necesito tu ayuda para diseñar y maquetar un componente/página para mi aplicación. Antes de empezar, por favor lee, comprende y aplica estrictamente todas las reglas de este contexto arquitectónico y visual. Si no sigues estas directrices, tu código romperá mi aplicación.

### 1. Stack Tecnológico (Estricto)
- **Framework:** React (Vite). Código funcional moderno con Hooks.
- **Estilos:** Tailwind CSS. **PROHIBIDO** crear hojas de estilo CSS externas o usar estilos en línea `style={{}}`. Usa exclusivamente utilidades de Tailwind.
- **Animaciones:** Framer Motion. Toda interacción, entrada o salida de componentes debe estar sutilmente animada (ej. `motion.div`).
- **Iconografía:** Lucide React (ej. `import { Package, User } from 'lucide-react';`). **PROHIBIDO** usar Material Icons, FontAwesome o SVGs crudos a menos que sea estrictamente necesario.
- **Navegación:** React Router DOM (usar `<Link>` y `useNavigate`).
- **Estado Global:** Zustand (`useInventoryStore`).

### 2. Estructura de Datos (Zustand)
Para que tus diseños funcionen con mis datos reales, asume que el objeto principal `Product` que consumo desde Zustand o paso por Props tiene siempre esta estructura JSON exacta:

```json
{
  "id": "A4BF-9921",
  "name": "Nombre Comercial del Producto",
  "brand": "Marca (ej. DJI, KZ)",
  "price": 250.50,
  "original_price": 300.00,
  "condition": "Nuevo | Usado | Reacondicionado",
  "category": "Drones | Audio | General",
  "stock": 15,
  "tags": "etiqueta1, etiqueta2",
  "media": ["https://imagen1.jpg", "https://imagen2.png"],
  "titles": ["Color: Negro", "Versión: Pro"],
  "descriptions": ["Negro", "Pro"]
}
```
Usa siempre estas variables para nombrar tus propiedades en las tarjetas y componentes visuales.

### 3. Sistema de Diseño y Estética "Premium" (UX/UI)
La aplicación entera está construida bajo un sistema estético muy específico. Si no aplicas estas clases de Tailwind, tu diseño se verá como de otra aplicación:

1. **Topografía de Capas (Glassmorphism):** Los contenedores elevados deben usar fondos translúcidos y desenfoque. *(Ej. `bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl shadow-blue-500/10`)*.
2. **Bordes:** Somos extremos con los bordes redondeados. Los contenedores pricipales (tarjetas, modales) usan `rounded-[2rem]` o `rounded-3xl`. Los botones internos usan `rounded-xl`.
3. **Colores de Base:** El fondo principal de la App es `bg-slate-50`. Los textos jamás son negros puros; usa `text-slate-800` o `text-slate-900` para títulos, y `text-slate-500` para subtítulos.
4. **Colores de Acento:** Nuestro botón principal e iconos clave utilizan degradados índigo o azules sólidos: `bg-blue-600` o `bg-gradient-to-r from-blue-600 to-indigo-500`. El hover debe usar animaciones sutiles (`hover:bg-blue-700 transition-all active:scale-95`).
5. **Modales 100% Móviles (Bottom Sheets):** Nunca usamos modales cuadrados flotantes en el centro para la versión móvil. Todo panel emergente **debe ser un Bottom Sheet** usando `<motion.div>` desde abajo (`y: '100%'` to `y: 0`) con capacidad de `drag="y"` para cerrarse deslizando hacia abajo.
6. **Efectos de Tarjetas:** Usa sombras difusas de colores brillantes debajo de tarjetas fuertes (Ej. `shadow-[0_8px_30px_rgb(59,130,246,0.2)]`).

---

**MI PETICIÓN PARA TI (STITCH):**
[Escribe aquí lo que quieres que diseñe. Ejemplo: "Sabiendo todo lo anterior, constrúyeme la página completa de "Mi Perfil de Vendedor" donde pueda ver mis datos personales, una foto circular y 3 tarjetas con mis ventas del mes. Que ocupe toda la pantalla."]
