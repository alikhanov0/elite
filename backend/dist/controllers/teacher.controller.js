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
exports.updateLessons = exports.deleteLesson = exports.createLesson = exports.saveLessonGrades = exports.getLessonStudents = exports.getGroupLessons = exports.getTeacherGroups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTeacherGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const typedReq = req;
    const teacherId = typedReq.user.id;
    const groups = yield prisma.group.findMany({
        where: { teacherId },
        select: { id: true, name: true }
    });
    res.json({ groups });
    return;
});
exports.getTeacherGroups = getTeacherGroups;
const getGroupLessons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const lessons = yield prisma.lesson.findMany({
        where: { groupId: +groupId },
        orderBy: { date: 'asc' }
    });
    res.json({ lessons });
    return;
});
exports.getGroupLessons = getGroupLessons;
const getLessonStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lessonId = +req.params.lessonId;
    const lesson = yield prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            group: {
                include: {
                    students: { include: { student: true } }
                }
            }
        }
    });
    if (!lesson || !lesson.group) {
        res.status(404).json({ error: 'Урок или группа не найдены' });
        return;
    }
    const studentLessonData = yield prisma.studentLesson.findMany({
        where: { lessonId },
    });
    const result = lesson.group.students.map(s => {
        const record = studentLessonData.find(r => r.studentId === s.studentId);
        return {
            id: s.studentId,
            name: s.student.name,
            surname: s.student.surname,
            status: (record === null || record === void 0 ? void 0 : record.status) || 'absent_unreasoned',
            score: (record === null || record === void 0 ? void 0 : record.score) || 0,
            homeworkScore: (record === null || record === void 0 ? void 0 : record.homeworkScore) || 0
        };
    });
    res.json({ students: result });
    return;
});
exports.getLessonStudents = getLessonStudents;
const saveLessonGrades = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lessonId = +req.params.lessonId;
    const grades = req.body;
    try {
        const lesson = yield prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { groupId: true }
        });
        if (!lesson || lesson.groupId === null) {
            res.status(404).json({ error: 'Урок или группа не найдены' });
            return;
        }
        const groupId = lesson.groupId;
        const toDecrement = [];
        for (const { studentId, status, score, homeworkScore } of grades) {
            yield prisma.studentLesson.upsert({
                where: { studentId_lessonId: { studentId, lessonId } },
                create: { studentId, lessonId, status, score, homeworkScore },
                update: { status, score, homeworkScore }
            });
            if (status === 'visited' || status === 'absent_unreasoned') {
                toDecrement.push(studentId);
            }
        }
        if (toDecrement.length > 0) {
            const eligible = yield prisma.studentGroup.findMany({
                where: {
                    studentId: { in: toDecrement },
                    groupId: groupId,
                    lessonsLeft: { gt: 0 }
                },
                select: { studentId: true }
            });
            const eligibleIds = eligible.map(s => s.studentId);
            if (eligibleIds.length > 0) {
                yield prisma.studentGroup.updateMany({
                    where: {
                        studentId: { in: eligibleIds },
                        groupId: groupId
                    },
                    data: {
                        lessonsLeft: { decrement: 1 }
                    }
                });
            }
            // после обновления абонемента
            if (eligibleIds.length < toDecrement.length) {
                const notUpdated = toDecrement.filter(id => !eligibleIds.includes(id));
                const missingStudents = yield prisma.user.findMany({
                    where: { id: { in: notUpdated } },
                    select: { name: true, surname: true }
                });
                const msg = `У следующих студентов недостаточно уроков: ${missingStudents
                    .map(s => `${s.name} ${s.surname}`)
                    .join(', ')}`;
                res.json({ success: true, warning: msg });
                return;
            }
        }
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('[SAVE GRADES ERROR]', err);
        res.status(500).json({ error: 'Ошибка при сохранении оценок' });
        return;
    }
});
exports.saveLessonGrades = saveLessonGrades;
const createLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const groupId = +req.params.groupId;
    const { name, date, repeat = 1 } = req.body;
    if (!name || !date || !groupId) {
        res.status(400).json({ error: 'Missing fields' });
        return;
    }
    const parsedDate = new Date(date);
    const now = new Date();
    const hundredYearsFromNow = new Date();
    hundredYearsFromNow.setFullYear(now.getFullYear() + 100);
    if (isNaN(parsedDate.getTime()) ||
        parsedDate < new Date('2000-01-01') ||
        parsedDate > hundredYearsFromNow) {
        res.status(400).json({ error: 'Некорректная дата урока' });
        return;
    }
    try {
        const group = yield prisma.group.findUnique({
            where: { id: groupId }
        });
        if (!group) {
            res.status(404).json({ error: 'Группа не найдена' });
            return;
        }
        // ⛔ Только учитель своей группы или админ может добавлять
        if (user.role === 'teacher' && group.teacherId !== user.id) {
            res.status(403).json({ error: 'Access denied to this group' });
            return;
        }
        const lessons = Array.from({ length: repeat }, (_, i) => ({
            name,
            date: new Date(parsedDate.getTime() + i * 7 * 24 * 60 * 60 * 1000), // + i недель
            groupId,
            teacherId: group.teacherId
        }));
        yield prisma.lesson.createMany({ data: lessons });
        res.status(201).json({ success: true, count: lessons.length });
        return;
    }
    catch (err) {
        console.error('[CREATE LESSON ERROR]', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});
exports.createLesson = createLesson;
const deleteLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lessonId } = req.params;
    try {
        // Удаление зависимостей
        yield prisma.studentLesson.deleteMany({
            where: { lessonId: +lessonId }
        });
        // Удаление самого урока
        yield prisma.lesson.delete({
            where: { id: +lessonId }
        });
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('[DELETE LESSON ERROR]', err);
        res.status(500).json({ error: 'Ошибка при удалении урока' });
    }
});
exports.deleteLesson = deleteLesson;
const updateLessons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, lessonsLeft } = req.body;
    try {
        yield prisma.studentGroup.updateMany({
            where: {
                studentId: +studentId,
                groupId: +req.params.groupId
            },
            data: { lessonsLeft }
        });
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при обновлении абонемента' });
    }
});
exports.updateLessons = updateLessons;
