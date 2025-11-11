import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";

const router = express.Router();

// --- Validaciones para el body ---
const validacionesMateria = [
  body("nombre", "El nombre es obligatorio").notEmpty().isLength({ max: 100 }),
  body("año", "El año debe ser un número entero").isInt({ min: 1, max: 9 }),
];

// POST /materias Crear una materia
router.post(
  "/",
  verificarAutenticacion,
  validacionesMateria,
  verificarValidaciones,
  async (req, res) => {
    const { nombre, año } = req.body;

    try {
      //Verificar si ya existe una materia con ese nombre y año
      const [materias] = await db.execute(
        "SELECT * FROM materias WHERE nombre=? AND año=?",
        [nombre, año]
      );
      if (materias.length > 0) {
        return res
          .status(400)
          .json({ success: false, error: "Esa materia ya esta registrada" });
      }

      const [result] = await db.execute(
        "INSERT INTO materias (nombre, año) VALUES (?,?)",
        [nombre, año]
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, año },
      });
    } catch (error) {
      console.error("Error en POST /materias:", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// GET /materias Listar todas
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM materias ORDER BY año, nombre");
    res.json({ success: true, materias: rows });
  } catch (error) {
    console.error("Error en GET /materias:", error);
    res.status(500).json({ success: false, error: "Error interno" });
  }
});

// GET /materias/:id Ver una materia
router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const [rows] = await db.execute(
        "SELECT * FROM materias WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({ success: true, materia: rows[0] });
    } catch (error) {
      console.error("Error en GET /materias/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// PUT /materias/:id Actualizar una materia
router.put(
  "/:id",
  verificarAutenticacion,
  validarId,
  validacionesMateria,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, año } = req.body;

    try {
      const [result] = await db.execute(
        "UPDATE materias SET nombre=?, año=? WHERE id=?",
        [nombre, año, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({
        success: true,
        data: { id, nombre, año },
      });
    } catch (error) {
      console.error("Error en PUT /materias/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

// DELETE /materias/:id Eliminar una materia
router.delete(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      // Las notas asociadas se borran por "ON DELETE CASCADE"
      const [result] = await db.execute("DELETE FROM materias WHERE id=?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Materia no encontrada" });
      }
      res.json({ success: true, message: "Materia eliminada" });
    } catch (error) {
      console.error("Error en DELETE /materias/:id :", error);
      res.status(500).json({ success: false, error: "Error interno" });
    }
  }
);

export default router;