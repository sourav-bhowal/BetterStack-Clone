import { Router } from "express";
import {
  createWebsite,
  getWebsiteStatus,
} from "../controllers/websites.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateUser);

router.post("/", createWebsite);
router.get("/:websiteId", getWebsiteStatus);

export default router;
