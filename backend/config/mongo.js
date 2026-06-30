const mongoose = require("mongoose");

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connecté :", mongoose.connection.name);
}

mongoose.connection.on("error", (err) => {
  console.error("Erreur MongoDB :", err.message);
});

module.exports = connectMongo;
