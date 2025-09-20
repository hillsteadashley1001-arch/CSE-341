import { Router } from "express";
import { getName } from "../controllers/nameController.js";

const router = Router();

// Home route: must visibly show data in the browser
router.get("/", (_req, res) => {
  res.send("Ashley Hillstead");
});

// JSON API route (optional but nice for grading)
router.get("/api/name", getName);

export default router;