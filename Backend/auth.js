import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js"; 
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

// Configuración de la estrategia JWT para Passport
export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      // El payload es lo que pusimos en el token: { userId: ... }
      // Esto se ejecutará cada vez que usemos verificarAutenticacion
      next(null, payload); 
    })
  );
}

// Middleware para proteger rutas
export const verificarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Ruta de Login
router.post(
    "/login",
    body("email", "Email inválido").isEmail(),
    body("password", "Contraseña inválida").notEmpty(),
    verificarValidaciones,
    async (req, res) => {
      try {
        const { email, password } = req.body;
  
        // 1. Buscar al usuario por email
        const [usuarios] = await db.execute(
          "SELECT * FROM usuarios WHERE email=?",
          [email]
        );
  
        if (usuarios.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: "Usuario o contraseña inválidos" });
        }
  
        // 2. Verificar la contraseña (¡LA LÍNEA CORREGIDA!)
        const usuario = usuarios[0];
        // Tu columna se llama 'password', no 'password_hash'
        const hashedPassword = usuario.password; 
        const passwordComparada = await bcrypt.compare(password, hashedPassword);
  
        if (!passwordComparada) {
          return res
            .status(400)
            .json({ success: false, error: "Usuario o contraseña inválidos" });
        }
  
        // 3. Generar el token JWT
        const payload = { userId: usuario.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "4h",
        });
  
        // 4. Enviar respuesta
        res.json({
          success: true,
          token,
          username: usuario.username // Devolvemos 'username'
        });
  
      } catch (error) {
          console.error("Error en /login:", error);
          res.status(500).json({ success: false, error: "Error interno del servidor" });
      }
    }
  );

export default router;