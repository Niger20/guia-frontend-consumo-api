const $ = (selector) => document.querySelector(selector);
const form = $("#search-form");
const status = $("#status");
const results = $("#results");

// Los dos mecanismos realizan la misma petición al servidor local.
async function consultarAsync(url) {
  const response = await fetch(url);
  $("#http").textContent = response.status;
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || `Error HTTP ${response.status}`);
  return data;
}

function consultarPromesas(url) {
  return fetch(url).then((response) => {
    $("#http").textContent = response.status;
    return response.json().then((data) => {
      if (!response.ok)
        throw new Error(data.error || `Error HTTP ${response.status}`);
      return data;
    });
  });
}

// textContent evita interpretar los valores externos como HTML.
function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderCars(cars) {
  results.replaceChildren();
  for (const car of cars) {
    const card = element("article", "", "car");
    const top = element("div", "", "car-top");
    top.append(
      element("span", car.make || "Marca no disponible"),
      element("span", car.year ?? "Sin año"),
    );
    card.append(top, element("h3", car.model || "Modelo no disponible"));
    const specs = document.createElement("dl");
    const fields = [
      ["Categoría", car.class],
      [
        "Motor",
        typeof car.displacement === "number" ? `${car.displacement} L` : null,
      ],
      ["Cilindros", car.cylinders],
      [
        "Transmisión",
        { a: "Automática", m: "Manual" }[car.transmission] || car.transmission,
      ],
      ["Tracción", car.drive?.toUpperCase()],
      [
        "Combustible",
        { gas: "Gasolina", diesel: "Diésel", electricity: "Eléctrico" }[
          car.fuel_type
        ] || car.fuel_type,
      ],
    ];
    for (const [label, value] of fields) {
      const group = document.createElement("div");
      group.append(
        element("dt", label),
        element("dd", value ?? "No disponible"),
      );
      specs.append(group);
    }
    card.append(
      specs,
      element(
        "p",
        "Fuente: Cars API · El consumo MPG puede requerir un plan premium.",
        "car-note",
      ),
    );
    results.append(card);
  }
}

function updateCode() {
  $("#code").textContent =
    $("#method").value === "async"
      ? consultarAsync.toString()
      : consultarPromesas.toString();
}
$("#method").addEventListener("change", updateCode);
updateCode();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const params = new URLSearchParams();
  for (const field of ["make", "model", "year"]) {
    const value = $(`#${field}`).value.trim();
    if (value) params.set(field, value);
  }
  results.replaceChildren();
  $("#count").textContent = "0";
  $("#http").textContent = "—";
  $("#latency").textContent = "—";
  $("#json").textContent = "Sin respuesta.";
  status.className = "";
  if (!params.has("make") && !params.has("model")) {
    status.textContent = "Escribe al menos una marca o un modelo.";
    status.className = "error";
    return;
  }
  const url = `/api/cars?${params}`;
  $("#query-label").textContent = params.toString();
  $("#search").disabled = true;
  results.setAttribute("aria-busy", "true");
  status.textContent = "Consultando API Ninjas…";
  const start = performance.now();
  const query =
    $("#method").value === "async" ? consultarAsync : consultarPromesas;
  query(url)
    .then((data) => {
      if (!Array.isArray(data))
        throw new Error("El servicio no devolvió una lista válida.");
      $("#json").textContent = JSON.stringify(data, null, 2);
      $("#count").textContent = data.length;
      renderCars(data);
      status.textContent = data.length
        ? `Consulta completada: ${data.length} resultado(s) recibido(s) del servicio.`
        : "Sin resultados. Prueba con otra marca, modelo o año.";
    })
    .catch((error) => {
      status.textContent = error.message;
      status.className = "error";
      $("#json").textContent = JSON.stringify(
        { error: error.message },
        null,
        2,
      );
    })
    .finally(() => {
      $("#latency").textContent = `${Math.round(performance.now() - start)} ms`;
      $("#search").disabled = false;
      results.setAttribute("aria-busy", "false");
    });
});
