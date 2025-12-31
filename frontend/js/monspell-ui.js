const lista = document.getElementById("lista");
const detalle = document.getElementById("detalle");
const filtros = document.getElementById("filtros");

function formatearCR(cr) {
  const mapa = {
    0.125: "1/8",
    0.25: "1/4",
    0.5: "1/2"
  };
  return mapa[cr] ?? cr;
}

function limpiarUI() {
    lista.innerHTML = "";
    detalle.innerHTML = "";
    filtros.innerHTML = "";
}

function renderLista(items, onClick) {
  lista.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <div class="initiative-row">
        <div class="initiative-cell">
          <strong>${item.name}</strong>
          ${item.challenge_rating !== undefined
            ? `<span class="bonus-text">CR ${formatearCR(item.challenge_rating)}</span>`
            : item.level !== undefined
            ? `<span class="bonus-text">Nivel ${item.level}</span>`
            : ""
          }
        </div>
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll(".item-card")
        .forEach(c => c.classList.remove("active"));

      card.classList.add("active");
      onClick(item);
    };

    lista.appendChild(card);
  });
}

/* -------- DETALLES -------- */

function renderSeccion(titulo, items) {
    if (!items || items.length === 0) return "";

    return `
        <h3>${titulo}</h3>
        ${items.map(i => {
            const desc = Array.isArray(i.desc)
                ? i.desc.join("<br>")
                : i.desc;

            return `
                <p>
                    <strong>${i.name}</strong><br>
                    ${desc}
                </p>
            `;
        }).join("")}
    `;
}

function obtenerAC(monstruo) {
    if (typeof monstruo.armor_class === "number") {
        return monstruo.armor_class;
    }

    if (Array.isArray(monstruo.armor_class)) {
        return monstruo.armor_class
            .map(ac => ac.value)
            .join(", ");
    }

    return "Desconocido";
}

function renderMonstruo(m) {
    detalle.innerHTML = `
        <h2>${m.name}</h2>

        <p><strong>Tipo:</strong> ${m.type}</p>
        <p><strong>CR:</strong> ${m.challenge_rating}</p>
        <p><strong>HP:</strong> ${m.hit_points}</p>
        <p><strong>AC:</strong> ${obtenerAC(m)}</p>

        <h3>Estadísticas</h3>
        <p>
            STR ${m.strength} |
            DEX ${m.dexterity} |
            CON ${m.constitution} |
            INT ${m.intelligence} |
            WIS ${m.wisdom} |
            CHA ${m.charisma}
        </p>

        ${renderSeccion("Habilidades Especiales", m.special_abilities)}
        ${renderSeccion("Acciones", m.actions)}
        ${renderSeccion("Reacciones", m.reactions)}
        ${renderSeccion("Acciones Legendarias", m.legendary_actions)}
    `;
}

function renderConjuro(c) {
    detalle.innerHTML = `
        <h2>${c.name}</h2>
        <p><strong>Nivel:</strong> ${c.level}</p>
        <p><strong>Escuela:</strong> ${c.school.name}</p>
        <p><strong>Tiempo de lanzamiento:</strong> ${c.casting_time}</p>
        <p><strong>Duración:</strong> ${c.duration}</p>

        <h3>Descripción</h3>
        <p>${c.desc.join("<br><br>")}</p>
    `;
}

const btnVolver = document.getElementById("btnVolver");

function entrarModoDetalle() {
  lista.classList.add("hidden");
  filtros.classList.add("hidden");
  detalleControls.classList.remove("hidden");
}

function salirModoDetalle() {
  lista.classList.remove("hidden");
  filtros.classList.remove("hidden");
  detalleControls.classList.add("hidden");
  detalle.innerHTML = "";
}