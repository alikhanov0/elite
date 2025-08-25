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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, role, name, surname, email } = req.body;
    if (!username || !password || !role || !name || !surname || !email) {
        res.status(400).json({ error: 'Все поля обязательны' });
    }
    try {
        const existing = yield prisma.user.findUnique({ where: { username } });
        if (existing)
            res.status(409).json({ error: 'Пользователь уже существует' });
        const hashed = yield (0, hash_1.hashPassword)(password);
        const user = yield prisma.user.create({
            data: {
                username,
                password: hashed,
                role,
                name,
                surname,
                email,
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Введите логин и пароль' });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Неверный логин' });
            return;
        }
        const valid = yield (0, hash_1.comparePasswords)(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Неверный пароль' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
exports.login = login;
