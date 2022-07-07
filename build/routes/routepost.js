"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const controllersPost_1 = __importDefault(require("../controllers/controllersPost"));
const service_1 = require("../helpers/service");
const auth = passport_1.default.authenticate("jwt", { session: false });
const optionalAuth = (req, res, next) => {
    if (req.headers["authorization"]) {
        auth(req, res, next);
    }
    else
        next();
};
class Rutaspost {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/post', optionalAuth, service_1.upload.single('archivo'), controllersPost_1.default.crearPost);
        this.router.get('/posts/:username', optionalAuth, controllersPost_1.default.getPosts);
        this.router.delete('/post/:id', optionalAuth, controllersPost_1.default.borrarPost);
        this.router.get('/like/:id', optionalAuth, controllersPost_1.default.like);
    }
}
const rutapost = new Rutaspost();
exports.default = rutapost.router;
