const express = require("express");
const db = require("./db/database.js");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors());

// ==========================
// RUTAS DE PRUEBA
// ==========================
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend funcionando" });
});

// ==========================
// USUARIOS
// ==========================
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Faltan datos" });

  try {
    const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    const info = stmt.run(username, email, password);
    res.status(201).json({ id: info.lastInsertRowid, username, email });
  } catch (err) {
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);

  if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

  res.json({ message: "Login correcto", userId: user.id, username: user.username });
});

// ==========================
// PERSONAJES
// ==========================
app.get("/characters/:userId", (req, res) => {
  const { userId } = req.params;
  const characters = db.prepare("SELECT * FROM characters WHERE user_id = ?").all(userId);
  res.json(characters);
});

app.post("/characters", (req, res) => {
  const {
    user_id, name, class: charClass, level = 1, image = null, species = null, background = null,
    alignment = null, experience = 0, hp_max = 10, hp_current = 10, ac = 10,
    initiative = 0, speed = 30, traits = "{}", equipment = "{}", spells = "{}", notes = "{}"
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO characters (
      user_id, name, class, level, image, species, background, alignment,
      experience, hp_max, hp_current, ac, initiative, speed,
      traits, equipment, spells, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    user_id, name, charClass, level, image, species, background, alignment,
    experience, hp_max, hp_current, ac, initiative, speed,
    JSON.stringify(traits), JSON.stringify(equipment), JSON.stringify(spells), JSON.stringify(notes)
  );

  // Crear stats por defecto
  db.prepare("INSERT INTO stats (character_id) VALUES (?)").run(info.lastInsertRowid);

  res.json({ id: info.lastInsertRowid, name, class: charClass, level });
});

app.put("/characters/:id", (req, res) => {
  const { id } = req.params;
  const {
    name, class: charClass, level, image, species, background,
    alignment, experience, hp_max, hp_current, ac, initiative, speed,
    traits, equipment, spells, notes
  } = req.body;

  const stmt = db.prepare(`
    UPDATE characters SET
      name = ?, class = ?, level = ?, image = ?, species = ?, background = ?, alignment = ?,
      experience = ?, hp_max = ?, hp_current = ?, ac = ?, initiative = ?, speed = ?,
      traits = ?, equipment = ?, spells = ?, notes = ?
    WHERE id = ?
  `);

  stmt.run(
    name, charClass, level, image, species, background, alignment,
    experience, hp_max, hp_current, ac, initiative, speed,
    JSON.stringify(traits), JSON.stringify(equipment), JSON.stringify(spells), JSON.stringify(notes),
    id
  );

  res.json({ message: "Personaje actualizado" });
});

app.delete("/characters/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM characters WHERE id = ?").run(id);
  res.json({ message: "Personaje borrado" });
});

// ==========================
// STATS
// ==========================
app.get("/stats/:characterId", (req, res) => {
  const { characterId } = req.params;
  let stats = db.prepare("SELECT * FROM stats WHERE character_id = ?").get(characterId);

  if (!stats) {
    db.prepare("INSERT INTO stats (character_id) VALUES (?)").run(characterId);
    stats = db.prepare("SELECT * FROM stats WHERE character_id = ?").get(characterId);
  }

  res.json(stats);
});

app.put("/stats/:characterId", (req, res) => {
  const { characterId } = req.params;
  const { strength, dexterity, constitution, intelligence, wisdom, charisma } = req.body;

  const stmt = db.prepare(`
    UPDATE stats SET
      strength = ?, dexterity = ?, constitution = ?, intelligence = ?, wisdom = ?, charisma = ?
    WHERE character_id = ?
  `);

  stmt.run(strength, dexterity, constitution, intelligence, wisdom, charisma, characterId);

  const updatedStats = db.prepare("SELECT * FROM stats WHERE character_id = ?").get(characterId);
  res.json(updatedStats);
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});