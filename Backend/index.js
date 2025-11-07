import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js"; // Para el registro (POST /usuarios)
import authRouter, { authConfig } from "./auth.js"; // Para el login (POST /auth/login)

// --- Líneas de roles eliminadas ---
// import rolesRouter from "./roles.js";
// import usuariosRolesRouter from "./usuarios-roles.js";

// Conectar a la base de datos
conectarDB();

const app = express();
const port = 3000;

// Middlewares
app.use(express.json()); // Para interpretar body como JSON
app.use(cors()); // Habilito CORS

// Configurar Passport (para auth.js)
authConfig();

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("API en funcionamiento!");
});

// Rutas de la API
app.use("/usuarios", usuariosRouter);
app.use("/auth", authRouter);

// --- Líneas de roles eliminadas ---
// app.use("/roles", rolesRouter);
// app.use("/usuarios-roles", usuariosRolesRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});