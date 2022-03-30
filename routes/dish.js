import express from "express";
import { getDishes , suggest } from "../controllers/dish.js";

const router = express.Router();

router.get("/cooktime", getDishes);
router.get("/suggest" , suggest);

export default router;
