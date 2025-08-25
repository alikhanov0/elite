"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const lesson_routes_1 = __importDefault(require("./routes/lesson.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const diagnostics_routes_1 = __importDefault(require("./routes/diagnostics.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const news_routes_1 = __importDefault(require("./routes/news.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/lessons', lesson_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/student', student_routes_1.default);
app.use('/api/diagnostics', diagnostics_routes_1.default);
app.use('/api/teacher', teacher_routes_1.default);
app.use('/api/news', news_routes_1.default);
app.use('/api', public_routes_1.default);
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
    res.send('🎓 Edu-Platform API running');
});
