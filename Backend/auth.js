import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js"; 
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

// Configuracion de la estrategia JWT para Passport
export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      // El payload es lo que pusimos en el token: { userId: ... }
      // Esto se ejecutara cada vez que usemos verificarAutenticacion
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
  
        // Buscar al usuario por email
        const [usuarios] = await db.execute(
          "SELECT * FROM usuarios WHERE email=?",
          [email]
        );
  
        if (usuarios.length === 0) {
          return res
            .status(400)
            .json({ success: false, error: "Usuario o contraseña inválidos" });
        }
  
        // Verificar la contraseña 
        const usuario = usuarios[0];
        const hashedPassword = usuario.password; 
        const passwordComparada = await bcrypt.compare(password, hashedPassword);
  
        if (!passwordComparada) {
          return res
            .status(400)
            .json({ success: false, error: "Usuario o contraseña inválidos" });
        }
  
        // Generar el token JWT
        const payload = { userId: usuario.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "5M",
        });
  
        // Enviar respuesta
        res.json({
          success: true,
          token,
          username: usuario.username 
        });
  
      } catch (error) {
          console.error("Error en /login:", error);
          res.status(500).json({ success: false, error: "Error interno del servidor" });
      }
    }
  );

export default router;