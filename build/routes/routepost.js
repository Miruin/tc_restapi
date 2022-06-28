"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_1 = require("../helpers/service");
const controllersPost_1 = __importDefault(require("../controllers/controllersPost"));
const service_2 = require("../helpers/service");
class Rutaspost {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/post', service_1.auth, service_2.upload.single('archivo'), controllersPost_1.default.crearPost);
        this.router.get('/posts', service_1.auth, controllersPost_1.default.getMyPosts);
        this.router.delete('/post/:id', service_1.auth, controllersPost_1.default.borrarPost);
        this.router.get('/posts/:username', service_1.auth, controllersPost_1.default.getDatosPosts);
    }
}
const rutapost = new Rutaspost();
exports.default = rutapost.router;
