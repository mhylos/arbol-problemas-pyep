# Árbol de Problemas PYEP

Diagramador para construir el **árbol de problemas** y obtener el **árbol de objetivos** del curso de Preparación y Evaluación de Proyectos (PYEP) del Sistema Nacional de Inversiones (Unidad 3: Identificación y caracterización del problema).

**Úsalo en línea:** https://mhylos.github.io/arbol-problemas-pyep/

No necesita instalación ni cuenta. También funciona descargando `index.html` y abriéndolo con doble clic.

## Qué hace

- **Lienzo tipo draw.io:** cuadros que se arrastran y se conectan con flechas. El botón *Ordenar* acomoda todo como árbol: efectos arriba, problema central al medio y causas abajo.
- **Árbol de objetivos automático:** cada enunciado se convierte en su contrario positivo (alta → baja, insuficiente → suficiente, mal → buen, «no hay» → «hay», «sin señalizar» → «señalizadas»…), cuidando el género, el número y la concordancia de «y/e» y «o/u». Lo que no se puede convertir con seguridad queda marcado en amarillo para revisarlo.
- **Transformar con IA, sin claves:** copia un pedido con el árbol y las reglas del curso, lo pegan en ChatGPT, Claude o Gemini, y pegan la respuesta (JSON) de vuelta. La app reemplaza los objetivos y muestra las observaciones de la IA. Se puede deshacer.
- **Acciones:** en la pestaña *Objetivos*, el ⊕ de abajo de un medio agrega acciones (en naranjo).
- **Exportar:** imágenes PNG de cada árbol, presentación PowerPoint editable (formas y flechas, más una tabla problema → objetivo) y proyecto `.json`.
- **Google Slides editable:** *Archivo → Copiar para Google Slides* copia los dos árboles. Con el script `src/slides.gs` instalado una vez en la presentación (Extensiones → Apps Script), el menú *Árbol PYEP → Pegar árbol…* los dibuja con rectángulos y conectores nativos de Slides, que se pueden mover y editar. Sin instalar nada: descarguen el PowerPoint y usen *Archivo → Importar diapositivas* en Slides.
- **Compartir:** *Archivo → Copiar código para compartir* genera un texto que se pega en el chat del grupo; quien lo recibe lo abre con *Archivo → Abrir proyecto*.

El trabajo se guarda solo en el navegador (almacenamiento local). Guarden un `.json` de respaldo de vez en cuando.

## Atajos

| Acción | Cómo |
| --- | --- |
| Escribir en un cuadro | Doble clic o `Enter` |
| Agregar efecto / causa | ⊕ arriba / ⊕ abajo del cuadro seleccionado |
| Conectar dos cuadros | Arrastrar un ⊕ hasta el otro cuadro |
| Seleccionar varios | `Shift` + arrastrar en el fondo |
| Eliminar | `Supr` |
| Deshacer | `Ctrl+Z` |
| Zoom | `Ctrl` + rueda, o los botones de abajo a la derecha |

## Desarrollo

El código está en `src/`:

- `src/engine.js`: conversor de enunciados negativos a positivos.
- `src/diagrama.js`: el diagramador.
- `src/shell.html`: estilos y estructura de la página.

```bash
node build.js            # genera index.html
node tests/antonimos.test.js   # prueba el conversor con frases del curso
```
