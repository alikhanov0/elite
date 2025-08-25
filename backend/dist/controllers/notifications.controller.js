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
exports.getTodayBirthdays = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTodayBirthdays = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const users = yield prisma.user.findMany({
        where: { birthday: { not: null } }
    });
    const todayBirthdays = users.filter(user => {
        if (!user.birthday)
            return false;
        const bday = new Date(user.birthday);
        return bday.getDate() === day && bday.getMonth() + 1 === month;
    });
    res.json({
        todayBirthdays: todayBirthdays.map(u => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            role: u.role
        }))
    });
    return;
});
exports.getTodayBirthdays = getTodayBirthdays;
