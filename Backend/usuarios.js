import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
// Importamos esto para proteger rutas en el futuro, aunque el registro es público
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// GET /usuarios (Listar todos los usuarios)
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    // El middleware 'verificarAutenticacion' ya corrió.
    // Si llegamos aquí, el token es válido.
    
    // Opcional: El payload del token está en req.user
    // console.log("Usuario autenticado:", req.user); // { userId: 1 }

    const [rows] = await db.execute(
      // No enviamos la contraseña, ni encriptada.
      "SELECT id, username, email FROM usuarios"
    );

    res.json({
      success: true,
      usuarios: rows,
    });

  } catch (error) {
    console.error("Error en GET /usuarios:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

// POST /usuarios (Registro de usuario)
// Esta ruta es pública, no necesita 'verificarAutenticacion'
router.post(
  "/",
  // Validaciones ajustadas a tu tabla
  body("email", "Email inválido").isEmail(),
  body("username", "Nombre de usuario inválido").notEmpty().isLength({ max: 50 }), // Cambiado de 'nombre'
  body("password", "Contraseña inválida (mín. 8 caracteres, 1 número)").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { email, username, password } = req.body; // Cambiado de 'nombre'

      // Opcional: Verificar si el email ya existe (esto está bien)
      const [emails] = await db.execute(
        "SELECT * FROM usuarios WHERE email=?",
        [email]
      );
      if (emails.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El email ya está registrado" });
      }

      // Opcional: Verificar si el username ya existe
       const [usernames] = await db.execute(
        "SELECT * FROM usuarios WHERE username=?",
        [username]
      );
      if (usernames.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El nombre de usuario ya está registrado" });
      }
      
      // 1. Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // 2. Guardar en la base de datos (¡LA CONSULTA CORREGIDA!)
      const [result] = await db.execute(
        // Usamos los nombres de columna de tu SQL: 'email', 'username', 'password'
        "INSERT INTO usuarios (email, username, password) VALUES (?,?,?)",
        [email, username, hashedPassword] // El hashedPassword va a la columna 'password'
      );

      // 3. Responder
      res.status(201).json({
        success: true,
        data: { id: result.insertId, email, username }, // Cambiado de 'nombre'
      });

    } catch (error) {
        console.error("Error en POST /usuarios:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }
);

/* Aquí irán las otras rutas de usuarios (GET, PUT, DELETE)
  Esas SÍ usarán 'verificarAutenticacion'
  Ejemplo:
  router.get("/", verificarAutenticacion, async (req, res) => { ... });
*/

export default router;