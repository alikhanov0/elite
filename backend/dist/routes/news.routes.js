"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const news_controller_1 = require("../controllers/news.controller");
const router = (0, express_1.Router)();
router.post('/', news_controller_1.createNews);
router.get('/', news_controller_1.getAllNews);
router.delete('/:id', news_controller_1.deleteNews);
exports.default = router;
