import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// GET /usuarios Listar todos los usuarios
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute(
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

// POST /usuarios Registro de usuario
router.post(
  "/",
  body("email", "Email inválido").isEmail(),
  body("username", "Nombre de usuario invalido").notEmpty().isLength({ max: 50 }), 
  body("password", "Contraseña invalida (mín. 8 caracteres, 1 numero)").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    try {
      const { email, username, password } = req.body; 

      // Verificar si el email ya existe
      const [emails] = await db.execute(
        "SELECT * FROM usuarios WHERE email=?",
        [email]
      );
      if (emails.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El email ya está registrado" });
      }

      // Verificar si el username ya existe
       const [usernames] = await db.execute(
        "SELECT * FROM usuarios WHERE username=?",
        [username]
      );
      if (usernames.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El nombre de usuario ya está registrado" });
      }
      
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Guardar en la base de datos (¡LA CONSULTA CORREGIDA!)
      const [result] = await db.execute(
        "INSERT INTO usuarios (email, username, password) VALUES (?,?,?)",
        [email, username, hashedPassword]
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, email, username }, 
      });

    } catch (error) {
        console.error("Error en POST /usuarios:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }
);

router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const [result] = await db.execute("DELETE FROM usuarios WHERE id=?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }
      res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      console.error("Error en DELETE /usuarios/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);


export default router;