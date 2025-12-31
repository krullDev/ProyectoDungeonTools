const btnMonstruos = document.getElementById("btnMonstruos");
const btnConjuros = document.getElementById("btnConjuros");
const busqueda = document.getElementById("busqueda");

let datosActuales = [];
let tipoActual = "";

/* -------- FILTROS -------- */

function crearFiltroCR(monstruos) {
    const select = document.createElement("select");
    select.dataset.filtro = "cr"; // ← ESTA LÍNEA FALTABA
    select.innerHTML = `<option value="all">Todos los CR</option>`;

    [...new Set(monstruos.map(m => m.challenge_rating))]
        .sort((a, b) => a - b)
        .forEach(cr => {
            let opt = document.createElement("option");
            opt.value = cr;
            opt.textContent = `CR ${formatearCR(cr)}`;
            select.appendChild(opt);
        });

    select.onchange = aplicarFiltros;
    filtros.append(select);
}

// Función para formatear el CR adecuadamente
function formatearCR(cr) {
    const mapa = {
        0.125: "1/8",
        0.25: "1/4",
        0.5: "1/2"
    };

    return mapa[cr] ?? cr;
}

function crearFiltroType(monstruos) {
    const select = document.createElement("select");
    select.dataset.filtro = "type";
    select.innerHTML = `<option value="all">Todos los tipos</option>`;

    [...new Set(monstruos.map(m => m.type).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            select.appendChild(opt);
        });

    select.onchange = aplicarFiltros;
    filtros.append(select);
}

function crearFiltroNivel(conjuros) {
    const select = document.createElement("select");
    select.dataset.filtro = "level"; 
    select.innerHTML = `<option value="all">Todos los niveles</option>`;

    for (let i = 0; i <= 9; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Nivel ${i}`;
        select.appendChild(opt);
    }

    select.onchange = aplicarFiltros;
    filtros.append(select);
}

/* -------- FILTRADO -------- */

function aplicarFiltros() {
    let texto = busqueda.value.toLowerCase();
    let filtrados = datosActuales.filter(d =>
        d.name.toLowerCase().includes(texto)
    );

    const selects = filtros.querySelectorAll("select");

    selects.forEach(select => {
        if (select.value === "all") return;

        const tipoFiltro = select.dataset.filtro;

        if (tipoFiltro === "cr") {
            filtrados = filtrados.filter(d => d.challenge_rating == select.value);
        }

        if (tipoFiltro === "type") {
            filtrados = filtrados.filter(d => d.type === select.value);
        }

        if (tipoFiltro === "level") {
            filtrados = filtrados.filter(d => d.level == select.value);
        }
    });

    renderLista(filtrados, item => {
        if (tipoActual === "monsters") {
            renderMonstruo(item);
        } else {
            renderConjuro(item);
        }
    });
}

/* -------- EVENTOS -------- */

btnMonstruos.onclick = async () => {
    limpiarUI();
    tipoActual = "monsters";
    datosActuales = await cargarMonstruosCompletos();
    crearFiltroCR(datosActuales);
    crearFiltroType(datosActuales);
    aplicarFiltros();
};

btnConjuros.onclick = async () => {
    limpiarUI();
    tipoActual = "spells";
    datosActuales = await cargarConjurosCompletos();
    crearFiltroNivel(datosActuales);
    aplicarFiltros();
};

busqueda.oninput = aplicarFiltros;
