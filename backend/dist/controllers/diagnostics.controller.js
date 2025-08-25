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
exports.getStudentDiagnosticScores = exports.getStudentLessonsInRange = exports.getStudentLessonAnalytics = exports.updateDiagnosticScore = exports.getAllComponents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllComponents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const components = yield prisma.testComponent.findMany();
        res.json({ components });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при получении компонентов' });
    }
});
exports.getAllComponents = getAllComponents;
const updateDiagnosticScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Array.isArray(req.body) ? req.body : [req.body];
    try {
        for (const { studentId, componentId, score } of updates) {
            if (!studentId || !componentId || typeof score !== 'number') {
                continue;
            }
            const existing = yield prisma.diagnosticTestResult.findFirst({
                where: { studentId: +studentId, componentId: +componentId },
            });
            if (existing) {
                yield prisma.diagnosticTestResult.update({
                    where: { id: existing.id },
                    data: { score },
                });
            }
            else {
                yield prisma.diagnosticTestResult.create({
                    data: {
                        studentId: +studentId,
                        componentId: +componentId,
                        score,
                        date: new Date(),
                    },
                });
            }
        }
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сохранения' });
    }
});
exports.updateDiagnosticScore = updateDiagnosticScore;
const getStudentLessonAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = +req.params.studentId;
    try {
        const records = yield prisma.studentLesson.findMany({
            where: { studentId },
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
});
exports.getStudentLessonAnalytics = getStudentLessonAnalytics;
const getStudentLessonsInRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { from, to } = req.query;
    const lessons = yield prisma.studentLesson.findMany({
        where: {
            studentId: +id,
            lesson: {
                date: {
                    gte: new Date(from),
                    lte: new Date(to)
                }
            }
        },
        include: {
            lesson: true
        },
        orderBy: {
            lesson: {
                date: 'asc'
            }
        }
    });
    res.json({ lessons });
    return;
});
exports.getStudentLessonsInRange = getStudentLessonsInRange;
const getStudentDiagnosticScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = +req.params.studentId;
    try {
        const results = yield prisma.diagnosticTestResult.findMany({
            where: { studentId },
            include: {
                component: true
            }
        });
        const scores = {};
        results.forEach(r => {
            scores[r.componentId] = r.score;
        });
        res.json({ scores });
        return;
    }
    catch (err) {
        console.error('❌ Ошибка при получении оценок:', err);
        res.status(500).json({ error: 'Ошибка при загрузке оценок' });
    }
});
exports.getStudentDiagnosticScores = getStudentDiagnosticScores;
