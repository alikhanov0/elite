"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const diagnostics_controller_1 = require("../controllers/diagnostics.controller");
const router = (0, express_1.Router)();
router.get('/scores/:studentId', auth_middleware_1.authenticate, diagnostics_controller_1.getStudentDiagnosticScores);
exports.default = router;
