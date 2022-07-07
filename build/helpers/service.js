"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        let urldirectorio = "public/post/" + req.user;
        if (!fs_1.default.existsSync(urldirectorio)) {
            fs_1.default.mkdirSync(urldirectorio, { recursive: true });
        }
        cb(null, urldirectorio);
    },
    filename: function (req, file, cb) {
        let urlarchivo = Date.now() + "-" + req.user + "." + mime_types_1.default.extension(file.mimetype);
        cb(null, urlarchivo);
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage
});
