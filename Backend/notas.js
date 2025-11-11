import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";

const router = express.Router();

// --- Validaciones para el body (al crear) ---
const validacionesCrearNota = [
  body("alumno_id", "El ID de alumno es obligatorio").isInt({ min: 1 }),
  body("materia_id", "El ID de materia es obligatorio").isInt({ min: 1 }),
  // Hacemos las notas opcionales y nulas, con un rango de 1 a 10
  body("nota1")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 1 debe estar entre 1 y 10"),
  body("nota2")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 2 debe estar entre 1 y 10"),
  body("nota3")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 3 debe estar entre 1 y 10"),
];

// --- Validaciones para el body (al actualizar) ---
// Al actualizar, no permitimos cambiar el alumno o la materia, solo las notas.
const validacionesActualizarNota = [
  body("nota1")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 1 debe estar entre 1 y 10"),
  body("nota2")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 2 debe estar entre 1 y 10"),
  body("nota3")
    .optional({ nullable: true })
    .isFloat({ min: 1, max: 10 })
    .withMessage("La nota 3 debe estar entre 1 y 10"),
];

// POST /notas (Asignar/Cargar notas)
router.post(
  "/",
  verificarAutenticacion,
  validacionesCrearNota,
  verificarValidaciones,
  async (req, res) => {
    // Si no se envian notas, se guardan como NULL
    const { alumno_id, materia_id, nota1 = null, nota2 = null, nota3 = null } =
      req.body;

    try {
      // Verificamos que esta combinacion de alumno/materia no exista
      const [existentes] = await db.execute(
        "SELECT * FROM notas WHERE alumno_id = ? AND materia_id = ?",
        [alumno_id, materia_id]
      );
      if (existentes.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Este alumno ya tiene notas cargadas para esta materia",
        });
      }

      // Insertamos
      const [result] = await db.execute(
        "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
        [alumno_id, materia_id, nota1, nota2, nota3]
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, alumno_id, materia_id, nota1, nota2, nota3 },
      });
    } catch (error) {
      console.error("Error en POST /notas:", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// GET /notas (Listar todas las notas con info de alumno y materia)
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    // Usamos JOINs para traer la informacion util
    const sql = `
      SELECT 
        n.id, 
        n.alumno_id,
        a.nombre AS alumno_nombre, 
        a.apellido AS alumno_apellido, 
        n.materia_id,
        m.nombre AS materia_nombre, 
        n.nota1, 
        n.nota2, 
        n.nota3 
      FROM notas n
      JOIN alumnos a ON n.alumno_id = a.id
      JOIN materias m ON n.materia_id = m.id
      ORDER BY a.apellido, m.nombre
    `;
    const [rows] = await db.execute(sql);
    res.json({ success: true, notas: rows });
  } catch (error) {
    console.error("Error en GET /notas:", error);
    res.status(500).json({ success: false, error: "Error interno" });
  }
});

// GET /notas/:id (Ver una entrada de nota especifica)
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    try {
      const [rows] = await db.execute(
        "SELECT * FROM notas WHERE id=?",
        [id]
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Registro de nota no encontrado" });
      }
      res.json({ success: true, nota: rows[0] });
    } catch (error) {
      console.error("Error en GET /notas/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// PUT /notas/:id (Actualizar solo las notas de un registro)
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  validacionesActualizarNota,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    // Aseguramos que si no vienen, se pongan null
    const { nota1 = null, nota2 = null, nota3 = null } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE notas SET nota1=?, nota2=?, nota3=? WHERE id=?",
        [nota1, nota2, nota3, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Registro de nota no encontrado" });
      }
      res.json({
        success: true,
        data: { id, nota1, nota2, nota3 },
      });
    } catch (error) {
      console.error("Error en PUT /notas/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// DELETE /notas/:id (Eliminar un registro de nota)
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    try {
      const [result] = await db.execute("DELETE FROM notas WHERE id=?", [id]);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Registro de nota no encontrado" });
      }
      res.json({ success: true, message: "Registro de nota eliminado" });
    } catch (error) {
      console.error("Error en DELETE /notas/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

export default router;