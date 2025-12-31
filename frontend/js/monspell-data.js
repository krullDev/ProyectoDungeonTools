const API = "https://www.dnd5eapi.co/api";

function guardarCache(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function leerCache(key) {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : null;
}

async function cargarMonstruosCompletos() {
    let cache = leerCache("monsters_full");
    if (cache) return cache;

    const base = await fetch(`${API}/monsters`).then(r => r.json());
    const completos = [];

    for (let m of base.results) {
        let det = await fetch(`${API}/monsters/${m.index}`).then(r => r.json());
        completos.push(det);
    }

    guardarCache("monsters_full", completos);
    return completos;
}

async function cargarConjurosCompletos() {
    let cache = leerCache("spells_full");
    if (cache) return cache;

    const base = await fetch(`${API}/spells`).then(r => r.json());
    const completos = [];

    for (let s of base.results) {
        let det = await fetch(`${API}/spells/${s.index}`).then(r => r.json());
        completos.push(det);
    }

    guardarCache("spells_full", completos);
    return completos;
}
