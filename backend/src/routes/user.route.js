import { Router } from "express";
import { updateUserRole } from "../controller/user.controller.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
const router = Router();

router.put("/:userId/update-role",ClerkExpressRequireAuth(), updateUserRole);

export default router;