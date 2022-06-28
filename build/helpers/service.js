"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.creartoken = exports.upload = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const moment_1 = __importDefault(require("moment"));
const config_1 = __importDefault(require("../config/config"));
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        let urldirectorio = "public/post/" + req.user;
        console.log(file);
        if (!fs_1.default.existsSync(urldirectorio)) {
            fs_1.default.mkdirSync(urldirectorio, { recursive: true });
        }
        cb(null, urldirectorio);
    },
    filename: function (req, file, cb) {
        let urlarchivo = Date.now() + "-" + req.user + "." + mime_types_1.default.extension(file.mimetype);
        console.log(urlarchivo);
        cb(null, urlarchivo);
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage
});
const creartoken = (usuario) => {
    const payload = {
        sub: usuario,
        iat: (0, moment_1.default)().unix(),
        exp: (0, moment_1.default)().add(1, 'days').unix()
    };
    return jwt_simple_1.default.encode(payload, String(config_1.default.secrettoken));
};
exports.creartoken = creartoken;
//middleware
const auth = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(403).send({ msg: 'No tienes autorizacion' });
        }
        const token = req.headers.authorization.split(" ")[1];
        const payload = jwt_simple_1.default.decode(token, String(config_1.default.secrettoken));
        if (payload.exp <= (0, moment_1.default)().unix()) {
            return res.status(401).send({ msg: 'El token ha expirado' });
        }
        req.user = payload.sub;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ msg: 'Error en el servidor' });
    }
};
exports.auth = auth;
