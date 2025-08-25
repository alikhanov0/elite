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
exports.getMonthlyRatingByGrade = exports.getMonthlyRating = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getMonthlyRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const data = yield prisma.studentLesson.findMany({
        where: {
            lesson: {
                date: {
                    gte: start,
                    lte: end
                }
            }
        },
        include: {
            student: true
        }
    });
    const map = new Map();
    for (const record of data) {
        const student = record.student;
        if (!map.has(student.id)) {
            map.set(student.id, {
                id: student.id,
                name: student.name,
                surname: student.surname,
                totalScore: 0
            });
        }
        const entry = map.get(student.id);
        entry.totalScore += ((_a = record.score) !== null && _a !== void 0 ? _a : 0) + ((_b = record.homeworkScore) !== null && _b !== void 0 ? _b : 0);
    }
    const ratings = Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore);
    res.json({ ratings });
    return;
});
exports.getMonthlyRating = getMonthlyRating;
const getMonthlyRatingByGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const grade = req.params.grade; // например: "3"
    if (!grade || !/^\d+$/.test(grade)) {
        res.status(400).json({ error: 'Grade must be provided as a number in the URL, e.g. /rating/group/3' });
        return;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    try {
        const data = yield prisma.studentLesson.findMany({
            where: {
                lesson: {
                    date: {
                        gte: start,
                        lte: end
                    },
                    group: {
                        name: {
                            startsWith: grade // Например, "3" → "3A", "3B"
                        }
                    }
                }
            },
            include: {
                student: true
            }
        });
        const map = new Map();
        for (const record of data) {
            const student = record.student;
            if (!map.has(student.id)) {
                map.set(student.id, {
                    id: student.id,
                    name: student.name,
                    surname: student.surname,
                    totalScore: 0
                });
            }
            const entry = map.get(student.id);
            entry.totalScore += ((_a = record.score) !== null && _a !== void 0 ? _a : 0) + ((_b = record.homeworkScore) !== null && _b !== void 0 ? _b : 0);
        }
        const ratings = Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore);
        res.json({ grade, ratings });
        return;
    }
    catch (error) {
        console.error('Ошибка при получении рейтинга:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
exports.getMonthlyRatingByGrade = getMonthlyRatingByGrade;
