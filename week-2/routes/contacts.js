import { Router } from "express";
import { getAllContacts, getContactById } from "../Controllers/contactsController.js";

const router = Router();

router.get("/", getAllContacts);
router.get("/:id", getContactById);

export default router;