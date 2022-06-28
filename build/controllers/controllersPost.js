"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const mssql_1 = __importDefault(require("mssql"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
class Controllerspost {
    constructor() {
    }
    crearPost(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let { descripcionpost, archivoUri, archivoName, archivoType } = req.body;
            let nick = req.user;
            let autor = req.user;
            try {
                const pool = yield (0, connection_1.getcon)();
                if (!req.file) {
                    if (archivoUri && archivoName && archivoType) {
                        console.log('a trabajar la imagen malditasea...');
                        let archivoMetaData = archivoUri.split(",");
                        let urldirectorio = "public/post/" + req.user;
                        let mimeT = archivoName.split('.');
                        if (archivoType == 'image/jpg') {
                            archivoType = 'image/jpeg';
                        }
                        let name_archivo = Date.now() + "-" + req.user + "." + mime_types_1.default.extension(archivoType);
                        let urlarchivo = "https://restapi-twitterclone1.herokuapp.com/post/" + req.user + "/" + name_archivo;
                        if (!fs_1.default.existsSync(urldirectorio)) {
                            fs_1.default.mkdirSync(urldirectorio, { recursive: true });
                        }
                        fs_1.default.writeFile(urldirectorio + '/' + name_archivo, archivoMetaData[1], 'base64', (error) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, nick)
                            .input('autor', mssql_1.default.VarChar, autor)
                            .input('descripcionpost', mssql_1.default.VarChar, descripcionpost)
                            .input('archivourlpost', mssql_1.default.VarChar, urlarchivo)
                            .query(String(config_1.default.q4));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha guardado el post satisfactoriamente' });
                    }
                    if (descripcionpost) {
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, nick)
                            .input('autor', mssql_1.default.VarChar, autor)
                            .input('descripcionpost', mssql_1.default.VarChar, descripcionpost)
                            .query(String(config_1.default.q3));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha guardado el post satisfactoriamente' });
                    }
                    pool.close();
                    return res.status(400).send({ msg: 'No se han llenado los campos' });
                }
                else {
                    let urlarchivo = "https://restapi-twitterclone1.herokuapp.com/post/" + req.user + "/" + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename);
                    yield pool.request()
                        .input('nick', mssql_1.default.VarChar, nick)
                        .input('autor', mssql_1.default.VarChar, autor)
                        .input('descripcionpost', mssql_1.default.VarChar, descripcionpost)
                        .input('archivourlpost', mssql_1.default.VarChar, urlarchivo)
                        .query(String(config_1.default.q4));
                    pool.close();
                    return res.status(200).send({ msg: 'Se ha guardado el post satisfactoriamente' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor al guardar el post' });
            }
        });
    }
    borrarPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let nick = req.user;
            try {
                let e = null;
                const pool = yield (0, connection_1.getcon)();
                const result = yield pool.request()
                    .input('id', id)
                    .query(String(config_1.default.q5));
                if (result.recordset[0]) {
                    if (!(result.recordset[0].nick_usuario == nick))
                        return res.status(400).send({ msg: 'no tienes permitido borrar post de otros usuarios' });
                    if (result.recordset[0].archivourl_post) {
                        let urlarchivo = 'public/post/' + nick + '/' + path_1.default.basename(result.recordset[0].archivourl_post);
                        fs_1.default.stat(urlarchivo, (error, stats) => {
                            if (error) {
                                console.error(error);
                                e = error;
                            }
                            else {
                                fs_1.default.unlink(urlarchivo, (error) => {
                                    if (error) {
                                        e = error;
                                        console.error(error);
                                    }
                                });
                            }
                        });
                    }
                    yield pool.request()
                        .input('id', id)
                        .query(String(config_1.default.q6));
                    pool.close();
                    return res.status(200).send({ msg: 'Se ha borrado el post satisfactoriamente', msgErr: e });
                }
                else {
                    pool.close();
                    return res.status(400).send({ msg: 'Error no se ha encontrado el post' });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).send({ msg: 'Error en el servidor al borrar' });
            }
        });
    }
    getMyPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = req.user;
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield pool.request()
                    .input('username', username)
                    .query(String(config_1.default.q7));
                if (result.recordset[0]) {
                    pool.close();
                    return res.status(200).send(result.recordset);
                }
                pool.close();
                return res.status(400).send({ msg: 'No has creado ningun post' });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getDatosPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = req.params.username;
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield pool.request()
                    .input('username', username)
                    .query(String(config_1.default.q7));
                if (result.recordset) {
                    pool.close();
                    return res.status(200).send(result.recordset);
                }
                const result1 = yield (0, connection_1.getdatosuser)(pool, username);
                if (!result1.recordset[0])
                    return res.status(400).send({ msg: 'Error  no se encuentra el usuario' });
                pool.close();
                return res.status(200).send({ msg: 'Este usuario no tiene creado ningun post o los ha eliminado' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor al pedir datos' });
            }
        });
    }
}
const controllerspost = new Controllerspost();
exports.default = controllerspost;
