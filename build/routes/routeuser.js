"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const controllersUser_1 = __importDefault(require("../controllers/controllersUser"));
const auth = passport_1.default.authenticate("jwt", { session: false });
const optionalAuth = (req, res, next) => {
    if (req.headers["authorization"]) {
        auth(req, res, next);
    }
    else
        next();
};
class Rutasuser {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/registro', controllersUser_1.default.reguser);
        this.router.post('/log', controllersUser_1.default.login);
        this.router.get('/log', optionalAuth, controllersUser_1.default.logout);
        this.router.get('/perfil', optionalAuth, controllersUser_1.default.datosuser);
        this.router.get('/perfil/:username', optionalAuth, controllersUser_1.default.getuser);
        this.router.put('/perfil', optionalAuth, controllersUser_1.default.moduser);
    }
}
const rutauser = new Rutasuser();
exports.default = rutauser.router;
