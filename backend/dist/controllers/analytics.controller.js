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
exports.getGroupAvgByDate = exports.getLessonAnalytics = exports.getRadarData = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRadarData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const results = yield prisma.diagnosticTestResult.findMany({
            where: { studentId: user.id },
            include: { component: true }
        });
        const grouped = {};
        results.forEach((r) => {
            const name = r.component.name;
            if (!grouped[name]) {
                grouped[name] = [];
            }
            grouped[name].push(r.score);
        });
        const radarData = Object.entries(grouped).map(([name, scores]) => {
            const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            return { name, score: parseFloat(average.toFixed(2)) };
        });
        res.json({ radarData });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка построения паутины' });
    }
});
exports.getRadarData = getRadarData;
const getLessonAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentId = parseInt(req.query.studentId);
        const from = req.query.from ? new Date(req.query.from) : new Date('2000-01-01');
        const to = req.query.to ? new Date(req.query.to) : new Date();
        if (isNaN(studentId)) {
            res.status(400).json({ error: 'Invalid studentId' });
            return;
        }
        const studentGroup = yield prisma.studentGroup.findFirst({
            where: { studentId },
            select: { groupId: true }
        });
        if (!studentGroup) {
            res.status(404).json({ error: 'Группа студента не найдена' });
            return;
        }
        const lessons = yield prisma.studentLesson.findMany({
            where: {
                studentId,
                lesson: {
                    date: {
                        gte: from,
                        lte: to,
                    },
                },
            },
            include: {
                lesson: {
                    select: {
                        date: true,
                    },
                },
            },
            orderBy: {
                lesson: {
                    date: 'asc',
                },
            },
        });
        const formatted = lessons.map((l) => ({
            date: l.lesson.date,
            score: l.score,
            homeworkScore: l.homeworkScore,
            status: l.status
        }));
        res.json({ lessons: formatted, groupId: studentGroup.groupId });
        return;
    }
    catch (err) {
        console.error('❌ Lesson analytics error:', err);
        res.status(500).json({ error: 'Server error while fetching lesson analytics' });
    }
});
exports.getLessonAnalytics = getLessonAnalytics;
const getGroupAvgByDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = Number(req.query.groupId);
        const fromStr = req.query.from;
        const toStr = req.query.to;
        if (isNaN(groupId) || !fromStr || !toStr) {
            res.status(400).json({ error: 'groupId, from и to обязательны' });
            return;
        }
        const from = new Date(fromStr);
        const to = new Date(toStr);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            res.status(400).json({ error: 'Неверный формат даты' });
            return;
        }
        const lessons = yield prisma.lesson.findMany({
            where: {
                groupId,
                date: { gte: from, lte: to }
            },
            include: {
                studentLessons: true
            }
        });
        const map = new Map();
        lessons.forEach(lesson => {
            const dateKey = lesson.date.toISOString().slice(0, 10);
            lesson.studentLessons.forEach(sl => {
                if (typeof sl.score === 'number') {
                    const scores = map.get(dateKey) || [];
                    scores.push(sl.score);
                    map.set(dateKey, scores);
                }
            });
        });
        const data = Array.from(map.entries()).map(([day, scores]) => ({
            date: day,
            avg: scores.reduce((a, b) => a + b, 0) / scores.length
        })).sort((a, b) => a.date.localeCompare(b.date));
        res.json({ groupAvgByDate: data });
        return;
    }
    catch (err) {
        next(err);
    }
});
exports.getGroupAvgByDate = getGroupAvgByDate;
