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
exports.removeStudentFromGroup = exports.addStudentToGroup = exports.changeTeacher = exports.updateLesson = exports.getGroupById = exports.getAllGroups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma.group.findMany({
        include: {
            teacher: true,
            students: {
                include: { student: true }
            },
            lessons: true
        }
    });
    res.json({ groups });
    return;
});
exports.getAllGroups = getAllGroups;
const getGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = +req.params.id;
    if (isNaN(groupId)) {
        res.status(400).json({ error: 'Неверный ID группы' });
        return;
    }
    try {
        const group = yield prisma.group.findUnique({
            where: { id: groupId },
            include: {
                teacher: true,
                students: { include: { student: true } },
                lessons: true
            }
        });
        if (!group) {
            res.status(404).json({ error: 'Группа не найдена' });
            return;
        }
        res.json({ group }); // ✅ НЕ возвращай res.json
        return;
    }
    catch (err) {
        console.error('Ошибка получения группы:', err);
        res.status(500).json({ error: 'Ошибка сервера при получении группы' });
    }
});
exports.getGroupById = getGroupById;
const updateLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lessonId } = req.params;
    const { name, date } = req.body;
    try {
        yield prisma.lesson.update({
            where: { id: +lessonId },
            data: {
                name,
                date: new Date(date)
            }
        });
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('Ошибка обновления урока:', err);
        res.status(500).json({ error: 'Ошибка при обновлении урока' });
    }
});
exports.updateLesson = updateLesson;
const changeTeacher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = parseInt(req.params.id);
    const { teacherId } = req.body;
    try {
        yield prisma.group.update({
            where: { id: groupId },
            data: { teacherId: +teacherId }
        });
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('Ошибка смены учителя:', err);
        res.status(500).json({ error: 'Ошибка при обновлении учителя' });
    }
});
exports.changeTeacher = changeTeacher;
const addStudentToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = +req.params.id;
    const { studentId } = req.body;
    try {
        yield prisma.studentGroup.create({
            data: {
                groupId,
                studentId,
            },
        });
        res.json({ success: true });
        return;
    }
    catch (error) {
        console.error('Error adding student to group:', error);
        res.status(500).json({ error: 'Ошибка при добавлении студента' });
    }
});
exports.addStudentToGroup = addStudentToGroup;
const removeStudentFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = +req.params.id;
    const { studentId } = req.body;
    try {
        yield prisma.studentGroup.deleteMany({
            where: {
                groupId,
                studentId,
            },
        });
        res.json({ success: true });
        return;
    }
    catch (error) {
        console.error('Error removing student from group:', error);
        res.status(500).json({ error: 'Ошибка при удалении студента' });
    }
});
exports.removeStudentFromGroup = removeStudentFromGroup;
