// Servidor local: mantiene la credencial fuera del navegador.
import http from "node:http";
import { readFile } from "node:fs/promises";

const files = {
  "/": ["index.html", "text/html"],
  "/css/styles.css": ["css/styles.css", "text/css"],
  "/js/app.js": ["js/app.js", "text/javascript"],
};
const send = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method !== "GET")
      return send(res, 405, { error: "Método no permitido." });
    if (url.pathname === "/api/cars") {
      const params = new URLSearchParams();
      for (const name of ["make", "model", "year"]) {
        const value = url.searchParams.get(name)?.trim();
        if (value) params.set(name, value.slice(0, 80));
      }
      if (!params.get("make") && !params.get("model")) {
        return send(res, 400, { error: "Escribe una marca o un modelo." });
      }
      if (params.has("year") && !/^(19|20)\d{2}$/.test(params.get("year"))) {
        return send(res, 400, {
          error: "El año debe estar entre 1900 y 2099.",
        });
      }
      if (!process.env.API_NINJAS_KEY)
        return send(res, 503, {
          error: "Configura API_NINJAS_KEY en el servidor.",
        });
      try {
        const upstream = await fetch(
          `https://api.api-ninjas.com/v1/cars?${params}`,
          {
            headers: { "X-Api-Key": process.env.API_NINJAS_KEY },
            signal: AbortSignal.timeout(15000),
          },
        );
        const data = await upstream.json();
        return send(res, upstream.status, data);
      } catch (error) {
        return send(res, error.name === "TimeoutError" ? 504 : 502, {
          error: "No se pudo consultar el servicio. Intenta nuevamente.",
        });
      }
    }
    const file = files[url.pathname];
    if (!file) return send(res, 404, { error: "Recurso no encontrado." });
    try {
      const content = await readFile(new URL(file[0], import.meta.url));
      res.writeHead(200, { "Content-Type": `${file[1]}; charset=utf-8` });
      res.end(content);
    } catch {
      send(res, 500, { error: "No se pudo leer el archivo." });
    }
  })
  .listen(process.env.PORT || 3000, "127.0.0.1", () => {
    console.log(
      `MotorLab disponible en http://127.0.0.1:${process.env.PORT || 3000}`,
    );
  });
