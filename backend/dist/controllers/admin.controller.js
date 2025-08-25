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
exports.renameGroup = exports.updateBirthday = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                surname: true,
                role: true,
                email: true,
                password: true,
                birthday: true
            }
        });
        res.json({ users });
        return;
    }
    catch (err) {
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
});
exports.getAllUsers = getAllUsers;
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = +req.params.id;
    const { role } = req.body;
    if (!['admin', 'teacher', 'student'].includes(role)) {
        res.status(400).json({ error: 'Недопустимая роль' });
        return;
    }
    yield prisma.user.update({
        where: { id: userId },
        data: { role }
    });
    res.json({ success: true });
    return;
});
exports.updateUserRole = updateUserRole;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = +req.params.id;
    try {
        yield prisma.user.delete({ where: { id: userId } });
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('Ошибка при удалении:', err);
        res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
});
exports.deleteUser = deleteUser;
const updateBirthday = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = +req.params.userId;
    const { birthday } = req.body;
    try {
        yield prisma.user.update({
            where: { id: userId },
            data: { birthday: new Date(birthday) },
        });
        res.json({ success: true });
        return;
    }
    catch (err) {
        console.error('[UPDATE BIRTHDAY ERROR]', err);
        res.status(500).json({ error: 'Ошибка при обновлении дня рождения' });
    }
});
exports.updateBirthday = updateBirthday;
const renameGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groupId = +req.params.id;
    const { name } = req.body;
    yield prisma.group.update({
        where: { id: groupId },
        data: { name }
    });
    res.json({ ok: true });
    return;
});
exports.renameGroup = renameGroup;
