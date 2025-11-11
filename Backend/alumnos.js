import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";

const router = express.Router();

// --- Validaciones para el body ---
const validacionesAlumno = [
  body("nombre", "El nombre es obligatorio").notEmpty().isLength({ max: 100 }),
  body("apellido", "El apellido es obligatorio").notEmpty().isLength({ max: 100 }),
  body("dni", "El DNI es obligatorio").notEmpty().isLength({ max: 20 }),
];

// POST /alumnos Crear un alumno
router.post(
  "/",
  verificarAutenticacion,
  validacionesAlumno,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, apellido, dni } = req.body;

    try {
      // Verificamos que el DNI no este en uso
      const [alumnos] = await db.execute(
        "SELECT * FROM alumnos WHERE dni=?",
        [dni]
      );
      if (alumnos.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El DNI ya esta registrado" });
      }

      // Insertamos
      const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, apellido, dni) VALUES (?,?,?)",
        [nombre, apellido, dni]
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, apellido, dni },
      });
    } catch (error) {
      console.error("Error en POST /alumnos:", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// GET /alumnos Listar todos
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM alumnos ORDER BY apellido, nombre");
    res.json({ success: true, alumnos: rows });
  } catch (error) {
    console.error("Error en GET /alumnos:", error);
    res.status(500).json({ success: false, error: "Error interno" });
  }
});

// GET /alumnos/:id Ver un alumno
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({ success: true, alumno: rows[0] });
    } catch (error) {
      console.error("Error en GET /alumnos/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// PUT /alumnos/:id Actualizar un alumno
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  validacionesAlumno,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, apellido, dni } = req.body;

    try {
      // Verificar que el DNI nuevo no choque con otro alumno
      const [alumnos] = await db.execute(
        "SELECT * FROM alumnos WHERE dni=? AND id!=?",
        [dni, id]
      );
      if (alumnos.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "El DNI ya esta en uso por otro alumno" });
      }

      // Actualizamos
      const [result] = await db.execute(
        "UPDATE alumnos SET nombre=?, apellido=?, dni=? WHERE id=?",
        [nombre, apellido, dni, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({
        success: true,
        data: { id, nombre, apellido, dni },
      });
    } catch (error) {
      console.error("Error en PUT /alumnos/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// DELETE /alumnos/:id Eliminar un alumno
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      // Al borrar un alumno, las notas se borran solas gracias a "ON DELETE CASCADE"
      const [result] = await db.execute("DELETE FROM alumnos WHERE id=?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado" });
      }
      res.json({ success: true, message: "Alumno eliminado" });
    } catch (error)
    {
      console.error("Error en DELETE /alumnos/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

export default router;