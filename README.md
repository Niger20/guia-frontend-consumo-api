# MotorLab · Portal de carros

Práctica de Diseño de Sistemas en Internet, UNI. HTML, CSS y JavaScript sin frameworks, con un servidor Node.js pequeño para proteger la clave de API Ninjas.

## Ejecutar

1. Instalar Node.js 22 o posterior.
2. Copiar `.env.example` a `.env` y colocar la clave en `API_NINJAS_KEY`.
3. Ejecutar `npm start` en la carpeta del proyecto.
4. Abrir http://127.0.0.1:3000.

No requiere `npm install`. Live Server no ejecuta el proxy: usar `npm start`.

## Uso

Escribir una marca o modelo, añadir opcionalmente un año y elegir async/await o then/catch. Consultar muestra la ficha, el estado HTTP, el tiempo total y la respuesta JSON. Ejemplo probado: toyota / corolla, sin año.

## Archivos

- `index.html`: formulario, resultados y explicación del flujo.
- `css/styles.css`: diseño crema, naranja y marco oscuro; adaptación móvil.
- `js/app.js`: fetch, promesas, eventos, validación y renderizado seguro con textContent.
- `server.mjs`: archivos estáticos y GET /api/cars, credencial solo en el servidor.
- `docs/capturas/`: capturas originales de las ventanas reales del equipo.
- `output/pdf/`: informe documental.

## API y limitaciones verificadas

El proyecto utiliza `https://api.api-ninjas.com/v1/cars`. La cuenta usada devolvió HTTP 200 con una ficha de Toyota Corolla de 1993. Los campos MPG vinieron restringidos al plan premium; no se inventan valores ni se presentan como cero. `/v2/cars` devolvió HTTP 400 indicando que requiere plan premium.

El servidor se limita a 127.0.0.1 para esta práctica local. No publicar la clave ni el archivo `.env`. La clave proporcionada durante el trabajo se utilizó en memoria para la sesión y no quedó guardada en el repositorio.

## Referencias

- Ejemplo de clase: https://github.com/CristopherLarios/Pokemondemo
- Documentación del proveedor: https://api-ninjas.com/api/cars

Se conserva el enfoque didáctico del ejemplo: fetch, async/await, then/catch, response.ok, JSON, DOM y métricas. La interfaz y el código se adaptaron al dominio de carros; se añade un proxy porque este servicio exige autenticación.

