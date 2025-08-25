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
exports.deleteNews = exports.getAllNews = exports.createNews = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, text } = req.body;
        if (!title || !text) {
            res.status(400).json({ error: 'Title and text are required' });
            return;
        }
        const news = yield prisma.news.create({
            data: { title, text },
        });
        res.json(news);
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create news' });
    }
});
exports.createNews = createNews;
const getAllNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(news);
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});
exports.getAllNews = getAllNews;
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    try {
        yield prisma.news.delete({ where: { id } });
        res.json({ message: 'Объявление удалено' });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении' });
    }
});
exports.deleteNews = deleteNews;
