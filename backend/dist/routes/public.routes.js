"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const router = (0, express_1.Router)();
router.get('/rating/group/:grade', public_controller_1.getMonthlyRatingByGrade);
router.get('/rating/all', public_controller_1.getMonthlyRating);
exports.default = router;
