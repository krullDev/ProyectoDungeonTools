const list = document.getElementById("initiative-list");
const addRowBtn = document.getElementById("addRow");
const sortBtn = document.getElementById("sortInit");
const nextTurnBtn = document.getElementById("nextTurn");
const roundDisplay = document.getElementById("roundDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const clearBtn = document.getElementById("clearAll");
const modal = document.getElementById("confirmModal");
const yesBtn = document.getElementById("confirmYes");
const noBtn = document.getElementById("confirmNo");

let currentTurn = 0;
let round = 1;
let draggedRow = null;
let timeInSeconds = 0;

/* =========================
   EVENTOS
========================= */

addRowBtn.addEventListener("click", addRow);
sortBtn.addEventListener("click", sortInitiative);
nextTurnBtn.addEventListener("click", nextTurn);

/* =========================
   INICIALIZACIÓN
========================= */

// Crear 4 filas al cargar
for (let i = 0; i < 4; i++) {
    addRow();
}
updateActiveRow();

/* =========================
   FILAS
========================= */

function addRow() {
    const row = document.createElement("div");
    row.className = "initiative-row";

    row.innerHTML = `
        <div class="drag">⋮⋮</div>

        <div class="initiative-cell">
            <button class="roll-btn" title="Roll initiative">
                <img src="../assets/icons/dice-d20.svg" alt="Roll initiative" class="dice-icon">
            </button>

            <input type="number" class="initiative-total" placeholder="—">
            <span class="bonus-text"></span>
        </div>

        <input class="name-input" placeholder="Nombre">
        <input type="text" class="hp-input" placeholder="PG">
        <input type="number" class="ac-input" placeholder="CA">
        <input type="number" class="bonus-input" placeholder="0">
        <button class="delete-btn">🗑</button>
    `;

    addDragEvents(row);
    list.appendChild(row);

    const dragHandle = row.querySelector(".drag");
    dragHandle.draggable = true;
}

list.addEventListener("click", (e) => {
    const row = e.target.closest(".initiative-row");
    if (!row) return;

    if (e.target.closest(".roll-btn")) {
        rollInitiative(row);
    }

    if (e.target.classList.contains("delete-btn")) {
        row.remove();
        currentTurn = Math.max(0, currentTurn - 1);
        updateActiveRow();
    }
});

document.addEventListener("focusin", e => {
    if (!e.target.classList.contains("hp-input")) return;

    const val = parseInt(e.target.value, 10);
    e.target._baseHP = isNaN(val) ? 0 : val;
});

/* =========================
    MODIFICAR PG
========================= */
document.addEventListener("focusin", e => {
    if (!e.target.classList.contains("hp-input")) return;

    const val = parseInt(e.target.value, 10);
    e.target._baseHP = isNaN(val) ? 0 : val;
});

// Procesar al salir
document.addEventListener("blur", e => {
    if (!e.target.classList.contains("hp-input")) return;

    const input = e.target;
    const raw = input.value.trim();
    const base = input._baseHP ?? 0;

    // Inicializar HP máximo si no existe
    if (input._maxHP === undefined && /^\d+$/.test(raw)) {
        input._maxHP = parseInt(raw, 10);
    }

    const maxHP = input._maxHP ?? Infinity;
    let result = base;

    // +N o -N
    if (/^[+-]\d+$/.test(raw)) {
        result = base + parseInt(raw, 10);
    }
    // número directo
    else if (/^\d+$/.test(raw)) {
        result = parseInt(raw, 10);
    }

    // Clamp
    if (result < 0) result = 0;
    if (result > maxHP) result = maxHP;

    input.value = result;
    input.classList.toggle("hp-zero", result === 0);
}, true);

/* =========================
   INICIATIVA
========================= */

function rollInitiative(row) {
    const bonus = parseInt(row.querySelector(".bonus-input").value) || 0;
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;

    row.querySelector(".initiative-total").value = total;
    row.querySelector(".bonus-text").textContent = `(${roll} + ${bonus})`;
}

function sortInitiative() {
    const rows = Array.from(list.children);

    rows.sort((a, b) => {
        const aVal = parseInt(a.querySelector(".initiative-total").value) || 0;
        const bVal = parseInt(b.querySelector(".initiative-total").value) || 0;
        return bVal - aVal;
    });

    rows.forEach(r => list.appendChild(r));
    currentTurn = 0;
    updateActiveRow();
}

/* =========================
   TURNOS / ASALTOS / TIEMPO
========================= */

function updateTimeDisplay() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;

    timeDisplay.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function nextTurn() {
    const rows = list.children;
    if (!rows.length) return;

    timeInSeconds += 6;
    updateTimeDisplay();

    currentTurn++;

    if (currentTurn >= rows.length) {
        currentTurn = 0;
        round++;
        roundDisplay.textContent = `Asalto ${round}`;
    }

    updateActiveRow();
}


function updateActiveRow() {
    Array.from(list.children).forEach((row, index) => {
        row.classList.toggle("active-turn", index === currentTurn);
    });
}

/* =========================
   DRAG & DROP
========================= */

function addDragEvents(row) {
    const handle = row.querySelector(".drag");

    handle.addEventListener("dragstart", (e) => {
        draggedRow = row;
        row.classList.add("dragging");

        // Necesario para Firefox
        e.dataTransfer.setData("text/plain", "");
    });

    handle.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        draggedRow = null;
    });

    row.addEventListener("dragover", (e) => {
        e.preventDefault();

        const after = getDragAfterElement(list, e.clientY);
        if (!draggedRow) return;

        if (after == null) {
            list.appendChild(draggedRow);
        } else {
            list.insertBefore(draggedRow, after);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".initiative-row:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* =========================
   POP-UP LIMPIAR
========================= */

clearBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

noBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

yesBtn.addEventListener("click", () => {
    list.innerHTML = "";
    currentTurn = 0;
    round = 1;
    roundDisplay.textContent = "Asalto 1";

    timeInSeconds = 0;
    updateTimeDisplay();


    for (let i = 0; i < 4; i++) {
        addRow();
    }

    updateActiveRow();
    modal.classList.add("hidden");
});
