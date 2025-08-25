"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const analytics_controller_1 = require("../controllers/analytics.controller");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get('/radar', auth_middleware_1.authenticate, analytics_controller_1.getRadarData);
router.get('/lesson', auth_middleware_1.authenticate, analytics_controller_1.getLessonAnalytics);
router.get('/my-lessons', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const records = yield prisma.studentLesson.findMany({
            where: { studentId: userId },
            include: { lesson: true },
            orderBy: { lesson: { date: 'asc' } }
        });
        const attendance = { visited: 0, absent_reasoned: 0, absent_unreasoned: 0 };
        const scores = records.map(r => ({
            date: r.lesson.date,
            score: r.score,
            homework: r.homeworkScore,
        }));
        records.forEach(r => {
            attendance[r.status]++;
        });
        res.json({ attendance, scores });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при получении аналитики' });
    }
}));
router.get('/group-avg', auth_middleware_1.authenticate, analytics_controller_1.getGroupAvgByDate);
exports.default = router;
