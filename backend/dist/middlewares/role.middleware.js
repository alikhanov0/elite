"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyRole = void 0;
const onlyRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || user.role !== role) {
            res.status(403).json({ error: `Доступ только для ${role}` });
            return;
        }
        next();
    };
};
exports.onlyRole = onlyRole;
