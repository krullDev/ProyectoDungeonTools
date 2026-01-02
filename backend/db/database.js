const Database = require("better-sqlite3");
const path = require("path");

// Crear archivo de DB
const db = new Database(path.resolve(__dirname, "krdmtools.db"));

// Activar claves foráneas para cascadas
db.pragma("foreign_keys = ON");

// ==========================
// TABLA USUARIOS
// ==========================
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)
`).run();

// ==========================
// TABLA PERSONAJES
// ==========================
db.prepare(`
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  class TEXT,
  level INTEGER DEFAULT 1,
  image TEXT,
  species TEXT,
  background TEXT,
  alignment TEXT,
  experience INTEGER DEFAULT 0,
  hp_max INTEGER DEFAULT 10,
  hp_current INTEGER DEFAULT 10,
  ac INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  traits TEXT,       -- JSON string
  equipment TEXT,    -- JSON string
  spells TEXT,       -- JSON string
  notes TEXT,        -- JSON string
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`).run();

// ==========================
// TABLA STATS
// ==========================
db.prepare(`
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER UNIQUE NOT NULL,
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,
  charisma INTEGER DEFAULT 10,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
)
`).run();

console.log("Base de datos lista");

// Exportar con CommonJS
module.exports = db;