import { param, validationResult } from "express-validator";

// Middleware para validar el ID en las rutas 
export const validarId = param("id").isInt({ min: 1 });

// Middleware que verifica los resultados de las validaciones
export const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errores: validacion.array(),
    });
  }
  next();
};