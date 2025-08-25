"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/diagnostics/:id', auth_middleware_1.authenticate, student_controller_1.getStudentDiagnostics);
router.get('/:id/average-scores', auth_middleware_1.authenticate, student_controller_1.getStudentMonthlyAverages);
exports.default = router;
