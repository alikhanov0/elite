"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route works!' });
});
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/admin-data', auth_middleware_1.authenticate, (0, role_middleware_1.onlyRole)('admin'), (req, res) => {
    res.json({ secret: '🔒 Только для админов' });
});
router.get('/teacher-data', auth_middleware_1.authenticate, (0, role_middleware_1.onlyRole)('teacher'), (req, res) => {
    res.json({ secret: '📚 Только для учителей' });
});
router.get('/student-data', auth_middleware_1.authenticate, (0, role_middleware_1.onlyRole)('student'), (req, res) => {
    res.json({ secret: '🎓 Только для студентов' });
});
router.get('/me', auth_middleware_1.authenticate, (req, res) => {
    const user = req.user;
    res.json({ message: 'Вы авторизованы!', user });
    return;
});
router.get('/notifications/birthdays/today', auth_middleware_1.authenticate, notifications_controller_1.getTodayBirthdays);
exports.default = router;
