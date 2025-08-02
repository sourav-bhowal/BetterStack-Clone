import { Router } from "express";
import { createWebsite, getWebsiteStatus } from "../controllers/websites.controller.js";

const router = Router();

router.post("/", createWebsite);
router.get("/:websiteId", getWebsiteStatus);

export default router;
