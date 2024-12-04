const NeDB = require("nedb-promises");

if (process.env.IN_MEMORY === "true")
  db = NeDB.create({ inMemoryOnly: true, autoload: true });
else {
  db = NeDB.create({ filename: "events.db", autoload: true });
}

module.exports = db;
