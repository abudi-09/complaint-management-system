import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js"; // Adjust the path as necessary
//import { protectRoute } from "../middleware/protectRoute.js"; // Adjust the path as necessary
const router = express.Router();
//router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
export default router;
