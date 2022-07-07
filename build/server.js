"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const auth_1 = __importDefault(require("./middleware/auth"));
const config_1 = __importDefault(require("./config/config"));
const routeuser_1 = __importDefault(require("./routes/routeuser"));
const routepost_1 = __importDefault(require("./routes/routepost"));
class server {
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        this.app.set('port', config_1.default.port);
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(express_1.default.json());
        this.app.use((0, cors_1.default)());
        this.app.use(passport_1.default.initialize());
        passport_1.default.use(auth_1.default);
    }
    routes() {
        this.app.use(routeuser_1.default);
        this.app.use(routepost_1.default);
    }
    start() {
        this.app.listen(this.app.get('port'), () => {
            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));
        });
    }
}
const serv = new server();
serv.start();
