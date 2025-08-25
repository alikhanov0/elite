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
exports.getStudentMonthlyAverages = exports.getStudentDiagnostics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getStudentDiagnostics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const studentId = +req.params.id;
    try {
        const results = yield prisma.diagnosticTestResult.findMany({
            where: { studentId: studentId },
        });
        res.json({ results });
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки результатов' });
    }
});
exports.getStudentDiagnostics = getStudentDiagnostics;
const getStudentMonthlyAverages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const studentId = +req.params.id;
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    try {
        const thisAvg = yield prisma.studentLesson.aggregate({
            where: {
                studentId,
                lesson: { date: { gte: thisMonthStart } },
            },
            _avg: { score: true },
        });
        const lastAvg = yield prisma.studentLesson.aggregate({
            where: {
                studentId,
                lesson: { date: { lt: thisMonthStart, gte: lastMonthStart } },
            },
            _avg: { score: true },
        });
        res.json({
            thisMonthAvg: (_a = thisAvg._avg.score) !== null && _a !== void 0 ? _a : 0,
            lastMonthAvg: (_b = lastAvg._avg.score) !== null && _b !== void 0 ? _b : 0,
        });
        return;
    }
    catch (error) {
        console.error('[GET STUDENT MONTHLY AVERAGES ERROR]', error);
        res.status(500).json({ error: 'Ошибка при получении средней оценки' });
    }
});
exports.getStudentMonthlyAverages = getStudentMonthlyAverages;
