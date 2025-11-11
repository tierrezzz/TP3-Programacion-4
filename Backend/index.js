import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js"; 
import authRouter, { authConfig } from "./auth.js"; 
import materiasRouter from "./materias.js";
import alumnosRouter from "./alumnos.js";

// Conectar a la base de datos
conectarDB();

const app = express();
const port = 3000;

// Middlewares
app.use(express.json());
app.use(cors()); 

// Configurar Passport (para auth.js)
authConfig();


app.get("/", (req, res) => {
  res.send("API en funcionamiento!");
});

// Rutas de la API
app.use("/usuarios", usuariosRouter);
app.use("/auth", authRouter);
app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);

// Inicia el servidor
app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});