document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       AUTH / USUARIO
    ========================= */
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    const headerAuth = document.getElementById("headerAuth");

    if (!userId) {
        alert("Debes iniciar sesión primero");
        window.location.href = "login.html";
        return;
    }

    headerAuth.innerHTML = `
        <span class="header-username">Hola, ${username}</span>
        <a href="#" class="header-link auth" id="logoutLink">Cerrar sesión</a>
    `;

    document.getElementById("logoutLink").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });

    document.getElementById("welcome").innerText = username;

    /* =========================
       ELEMENTOS
    ========================= */
    const charactersList = document.getElementById("charactersList");
    const createCharacterForm = document.getElementById("createCharacterForm");

    const modal = document.getElementById("characterModal");
    const closeModal = modal.querySelector(".close");
    const editBtn = document.getElementById("editCharBtn");
    const editSection = document.getElementById("editSection");
    const saveChangesBtn = document.getElementById("saveChangesBtn");
    const charImage = document.getElementById("charImage");
    const editImage = document.getElementById("editImage");

    let characters = [];
    let currentCharId = null;

    /* =========================
       HELPERS
    ========================= */
    function safeParse(value) {
        try {
            if (Array.isArray(value)) return value;
            if (!value) return [];
            return JSON.parse(value);
        } catch {
            return [];
        }
    }

    function commaArray(value) {
        if (!value) return [];
        return value.split(",").map(v => v.trim()).filter(Boolean);
    }

    /* =========================
       FETCH PERSONAJES
    ========================= */
    async function fetchCharacters() {
        const res = await fetch(`http://localhost:3000/characters/${userId}`);
        characters = await res.json();
        renderCharacters();
    }

    function renderCharacters() {
        charactersList.innerHTML = "";

        if (!characters.length) {
            charactersList.innerHTML = "<p>No tienes personajes creados aún.</p>";
            return;
        }

        characters.forEach(char => {
            const card = document.createElement("div");
            card.className = "character-card";

            card.innerHTML = `
                <h3>${char.name} (Nivel ${char.level})</h3>
                <p>Clase: ${char.class || "-"}</p>
                <p>Especie: ${char.species || "-"}</p>
                <button class="view-char" data-id="${char.id}">Ver</button>
                <button class="delete-char danger" data-id="${char.id}">Borrar</button>
            `;

            charactersList.appendChild(card);
        });
    }

    /* =========================
       EVENTOS LISTA
    ========================= */
    charactersList.addEventListener("click", async (e) => {
        const target = e.target;

        if (target.classList.contains("view-char")) {
            openModal(target.dataset.id);
        }

        if (target.classList.contains("delete-char")) {
            if (!confirm("¿Deseas eliminar este personaje?")) return;
            await fetch(`http://localhost:3000/characters/${target.dataset.id}`, { method: "DELETE" });
            fetchCharacters();
        }
    });

    /* =========================
       CREAR PERSONAJE (CORREGIDO)
    ========================= */
    createCharacterForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const body = {
            user_id: userId,
            name: document.getElementById("charName").value,
            class: document.getElementById("charClass").value,
            species: document.getElementById("charSpecies").value,
            background: document.getElementById("charBackground").value,
            traits: commaArray(document.getElementById("charTraits").value),
            equipment: [],
            spells: [],
            notes: [],
            level: document.getElementById("charLevel").value,
            image: ""
        };

        await fetch("http://localhost:3000/characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        createCharacterForm.reset();
        fetchCharacters();
    });

    /* =========================
       MODAL
    ========================= */
    function openModal(charId) {
        currentCharId = charId;
        editSection.style.display = "none";

        const char = characters.find(c => c.id == charId);
        if (!char) return;

        document.getElementById("charNameModal").innerText = char.name;
        document.getElementById("charClassModal").innerText = char.class || "-";
        document.getElementById("charLevelModal").innerText = char.level;
        document.getElementById("charSpeciesModal").innerText = char.species || "-";
        document.getElementById("charBackgroundModal").innerText = char.background || "-";
        document.getElementById("traitsModal").innerText = safeParse(char.traits).join(", ") || "-";
        document.getElementById("equipmentModal").innerText = safeParse(char.equipment).join(", ") || "-";
        document.getElementById("spellsModal").innerText = safeParse(char.spells).join(", ") || "-";
        document.getElementById("notesModal").innerText = safeParse(char.notes).join(", ") || "-";

        charImage.src = char.image || "../assets/images/placeholder.png";

        fetch(`http://localhost:3000/stats/${charId}`)
            .then(res => res.json())
            .then(stats => {
                document.getElementById("strengthModal").value = stats.strength ?? 0;
                document.getElementById("dexterityModal").value = stats.dexterity ?? 0;
                document.getElementById("constitutionModal").value = stats.constitution ?? 0;
                document.getElementById("intelligenceModal").value = stats.intelligence ?? 0;
                document.getElementById("wisdomModal").value = stats.wisdom ?? 0;
                document.getElementById("charismaModal").value = stats.charisma ?? 0;
            });

        document.getElementById("editName").value = char.name;
        document.getElementById("editClass").value = char.class || "";
        document.getElementById("editLevel").value = char.level;
        document.getElementById("editSpecies").value = char.species || "";
        document.getElementById("editBackground").value = char.background || "";
        document.getElementById("editTraits").value = safeParse(char.traits).join(", ");
        document.getElementById("editEquipment").value = safeParse(char.equipment).join(", ");
        document.getElementById("editSpells").value = safeParse(char.spells).join(", ");
        document.getElementById("editNotes").value = safeParse(char.notes).join(", ");

        document.querySelectorAll(".stats input").forEach(i => i.disabled = true);

        modal.style.display = "block";
    }

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    editBtn.onclick = () => {
        const isEditing = editSection.style.display === "none";

        editSection.style.display = isEditing ? "block" : "none";

        document.querySelectorAll(".stats input").forEach(i => {
            i.disabled = !isEditing;
        });
    };


    editImage.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => charImage.src = reader.result;
        reader.readAsDataURL(file);
    };

    /* =========================
       GUARDAR CAMBIOS
    ========================= */
    saveChangesBtn.onclick = async () => {
        if (!currentCharId) return;

        const body = {
            name: document.getElementById("editName").value,
            class: document.getElementById("editClass").value,
            level: document.getElementById("editLevel").value,
            species: document.getElementById("editSpecies").value,
            background: document.getElementById("editBackground").value,
            traits: commaArray(document.getElementById("editTraits").value),
            equipment: commaArray(document.getElementById("editEquipment").value),
            spells: commaArray(document.getElementById("editSpells").value),
            notes: commaArray(document.getElementById("editNotes").value),
            image: charImage.src
        };

        await fetch(`http://localhost:3000/characters/${currentCharId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        alert("Cambios guardados");
        fetchCharacters();
        editSection.style.display = "none";

        await fetch(`http://localhost:3000/stats/${currentCharId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                strength: Number(document.getElementById("strengthModal").value) || 0,
                dexterity: Number(document.getElementById("dexterityModal").value) || 0,
                constitution: Number(document.getElementById("constitutionModal").value) || 0,
                intelligence: Number(document.getElementById("intelligenceModal").value) || 0,
                wisdom: Number(document.getElementById("wisdomModal").value) || 0,
                charisma: Number(document.getElementById("charismaModal").value) || 0
            })
        });


    };

    /* =========================
       INIT
    ========================= */
    fetchCharacters();

});