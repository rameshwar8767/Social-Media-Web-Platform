import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

/**
 * @route   GET /api/v1/healthcheck
 * @desc    API health check
 * @access  Public
 */
router.get("/", healthCheck);

export default router;
