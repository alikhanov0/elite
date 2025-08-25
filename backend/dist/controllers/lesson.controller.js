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
exports.gradeStudentLesson = exports.getAllLessons = exports.createLesson = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, date } = req.body;
    const user = req.user;
    if (user.role !== 'teacher' && user.role !== 'admin') {
        res.status(403).json({ error: 'Только учителя могут создавать уроки' });
        return;
    }
    try {
        const lesson = yield prisma.lesson.create({
            data: {
                name,
                date: new Date(date),
                teacherId: user.id
            }
        });
        res.status(201).json({ lesson });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
exports.createLesson = createLesson;
const getAllLessons = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessons = yield prisma.lesson.findMany({
            include: { studentLessons: true }
        });
        res.json({ lessons });
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Ошибка получения уроков' });
    }
});
exports.getAllLessons = getAllLessons;
const gradeStudentLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { lessonId } = req.params;
    const { studentId, score, homeworkScore, status, comment } = req.body;
    if (user.role !== 'teacher' && user.role !== 'admin') {
        res.status(403).json({ error: 'Только учитель может выставлять оценки' });
        return;
    }
    if (!['visited', 'absent_reasoned', 'absent_unreasoned'].includes(status)) {
        res.status(400).json({ error: 'Недопустимый статус посещения' });
        return;
    }
    try {
        // Если уже есть — обновим
        const existing = yield prisma.studentLesson.findFirst({
            where: {
                studentId: +studentId,
                lessonId: +lessonId
            }
        });
        if (existing) {
            const updated = yield prisma.studentLesson.update({
                where: { id: existing.id },
                data: {
                    score,
                    homeworkScore,
                    status,
                    comment
                }
            });
            res.json({ message: 'Оценка обновлена', data: updated });
            return;
        }
        else {
            const created = yield prisma.studentLesson.create({
                data: {
                    studentId: +studentId,
                    lessonId: +lessonId,
                    score,
                    homeworkScore,
                    status,
                    comment
                }
            });
            res.status(201).json({ message: 'Оценка сохранена', data: created });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сохранения оценки' });
    }
});
exports.gradeStudentLesson = gradeStudentLesson;
