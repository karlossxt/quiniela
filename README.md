# Quiniela Semanal ⚽

Quiniela web para grupos de amigos: cada participante elige **8 partidos** de la semana y pronostica el marcador. Los resultados reales los captura un admin y la tabla de posiciones se calcula automáticamente.

## Puntuación
- **Marcador exacto:** 3 puntos
- **Acierto de ganador o empate:** 1 punto

## Tecnologías
- HTML + Tailwind CSS + JavaScript (ES Modules)
- **Firebase Firestore** para guardar pronósticos y resultados
- Google Fonts (Inter)

## Estructura
| Archivo | Descripción |
|---------|-------------|
| `index.html` | Interfaz: selección de partidos, formulario, tabla de posiciones y panel admin |
| `script.js` | Lógica completa: render de partidos, validación (máx. 8), Firebase, puntuación y posiciones |
| `style.css` | Estilos personalizados (tema oscuro) |
| `servidor.ps1` + `iniciar.bat` | Mini servidor local sin dependencias para pruebas (Windows) |

## Cómo cambiar los partidos de la semana
Edita el array `PARTIDOS` en `script.js`:

```js
{ id: 1, liga: "Liga MX", fecha: "Vie 23 Oct · 19:00", local: "Necaxa", visitante: "Toluca" },
```

La semana se detecta sola (ID ISO semanal), así que los datos se reinician cada semana sin tocar nada.

## Probar en local
- **Windows:** doble clic en `iniciar.bat` y se abre `http://localhost:8000`
- O sirve la carpeta con cualquier servidor estático (Live Server, `python -m http.server`, etc.)

> ⚠️ Abrir `index.html` directo con doble clic **no funciona**: el navegador bloquea los módulos de Firebase con el protocolo `file://`.

## Despliegue
Este repo está publicado con **GitHub Pages**:
**https://karlossxt.github.io/quiniela/**

Para publicar cambios, sube los archivos a `main` y Pages se actualiza solo.

## Notas
- El `firebaseConfig` es público (normal en apps web). Para una quiniela de amigos basta el modo *test* de Firestore; para uso real activa reglas de seguridad.
- El panel "Modo Admin" (captura de resultados) está abierto para cualquiera que abra la página; si lo necesitas protegido, hay que añadir autenticación.
