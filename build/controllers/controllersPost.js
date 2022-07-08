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
const mssql_1 = __importDefault(require("mssql"));
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
class Controllerspost {
    constructor() {
    }
    crearPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { textPost, archivoUri, repostId, repostEstado } = req.body;
                const pool = yield (0, connection_1.getcon)();
                const r1 = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let id = r1.recordset[0].id_usuario;
                let f = false;
                if ((req.file != null || archivoUri != null) ||
                    (textPost != null && textPost != '')) {
                    let urlarchivo = '';
                    if (req.file) {
                        let p = (req.file.path).split('/');
                        urlarchivo = 'https://tcrestapi.herokuapp.com/' + p[1] + '/' + p[2] + '/' + p[3];
                    }
                    if (!req.file) {
                        if (archivoUri) {
                            let archivoMetaData = String(archivoUri).split(",");
                            let urldirectorio = "public/post/" + req.user;
                            let arr = String(archivoMetaData[0]).split('data:');
                            let data = arr[1];
                            let arr2 = String(data).split(';base64');
                            let mimeT = arr2[0];
                            let name_archivo = Date.now() + "-" + req.user + "." + mime_types_1.default.extension(String(mimeT));
                            urlarchivo = "https://tcrestapi.herokuapp.com/post/" + req.user + "/" + name_archivo;
                            if (!fs_1.default.existsSync(urldirectorio)) {
                                fs_1.default.mkdirSync(urldirectorio, { recursive: true });
                            }
                            fs_1.default.writeFile(urldirectorio + '/' + name_archivo, archivoMetaData[1], 'base64', (error) => {
                                if (error) {
                                    console.error(error);
                                }
                            });
                        }
                    }
                    yield pool.request()
                        .input('iduser', mssql_1.default.VarChar, id)
                        .input('url', mssql_1.default.VarChar, urlarchivo)
                        .input('texto', mssql_1.default.VarChar, textPost)
                        .input('repost', mssql_1.default.TinyInt, 0)
                        .query(String(config_1.default.q4));
                    f = true;
                }
                if (repostId != null && repostEstado != null) {
                    yield pool.request()
                        .input('iduser', mssql_1.default.VarChar, id)
                        .input('repostid', mssql_1.default.VarChar, repostId)
                        .input('repostestado ', mssql_1.default.VarChar, repostEstado)
                        .query(String(config_1.default.q5));
                    f = true;
                }
                if (f) {
                    pool.close();
                    return res.status(200).send({ msg: 'POST creado' });
                }
                pool.close();
                return res.status(400).send({ msg: 'no se ha destectado valores validos' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor al guardar el post' });
            }
        });
    }
    borrarPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                const r1 = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let iduser = r1.recordset[0].id_usuario;
                let idpost = req.params.id;
                const result = yield pool.request()
                    .input('idu', mssql_1.default.Int, iduser)
                    .input('idp', mssql_1.default.Int, idpost)
                    .query(String(config_1.default.q6));
                if (result.recordset[0]) {
                    let url = (result.recordset[0].imgurl_post).split('/');
                    let p = 'public/post/' + url[4] + '/' + url[5];
                    fs_1.default.stat(p, (error) => {
                        if (error)
                            console.error(error);
                        else
                            fs_1.default.unlink(p, (error) => { if (error)
                                console.error(error); });
                    });
                    yield pool.request()
                        .input('id', idpost)
                        .query(String(config_1.default.q7));
                    pool.close();
                    return res.status(200).send({ msg: 'Se ha borrado el post satisfactoriamente' });
                }
                else {
                    pool.close();
                    return res.status(400).send({ msg: 'no tienes permitido borrar post de otros usuarios o este post no existe' });
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).send({ msg: 'Error en el servidor al borrar' });
            }
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let username = req.params.username;
                console.log(username);
                if (username == '0') {
                    if (!req.user)
                        return res.status(400).send({ msg: 'no estas logeado' });
                    username = String(req.user);
                }
                console.log(username);
                const pool = yield (0, connection_1.getcon)();
                const r1 = yield (0, connection_1.getdatosuser)(pool, String(username));
                let iduser = r1.recordset[0].id_usuario;
                const arrUser = [];
                arrUser.push(iduser);
                const rFollow = yield pool.request()
                    .input('iduser', iduser)
                    .query(String(config_1.default.q6_3));
                for (const key in rFollow.recordset) {
                    const r2 = yield (0, connection_1.getdatosuser)(pool, String(rFollow.recordset[key].usuario_follow));
                    let iduser = r2.recordset[0].id_usuario;
                    arrUser.push(iduser);
                }
                if (iduser) {
                    const datos = [];
                    for (const key in arrUser) {
                        const rUser = yield pool.request()
                            .input('iduser', arrUser[key])
                            .query(String(config_1.default.q6_1));
                        for (const i in rUser.recordset) {
                            if (rUser.recordset[i].re_post == 0) {
                                const dato = {
                                    nick: rUser.recordset[i].nick_usuario,
                                    img: rUser.recordset[i].imgurl_post,
                                    texto: rUser.recordset[i].texto_post,
                                    idpost: rUser.recordset[i].id_post,
                                    likes: rUser.recordset[i].likes_post
                                };
                                datos.push(dato);
                            }
                            else {
                                const datop = yield pool.request()
                                    .input('idpost', rUser.recordset[i].id_re_post)
                                    .query(String(config_1.default.q6_2));
                                const dato = {
                                    nick: rUser.recordset[i].nick_usuario,
                                    idpost: rUser.recordset[i].id_post,
                                    img: datop.recordset[0].imgurl_post,
                                    texto: datop.recordset[0].texto_post,
                                    idrepost: datop.recordset[0].id_post,
                                    repost: 1,
                                    likes: datop.recordset[0].likes_post
                                };
                                datos.push(dato);
                            }
                        }
                    }
                    pool.close();
                    return res.status(200).send(datos);
                }
                pool.close();
                return res.status(400).send({ msg: 'No se ha creado ningun post de este usuario o no esta siguiendo a nadie' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor ' });
            }
        });
    }
    like(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.user) {
                    let idpost = req.params.id;
                    const pool = yield (0, connection_1.getcon)();
                    const r2 = yield pool.request()
                        .input('nick', mssql_1.default.VarChar, req.user)
                        .input('idpost', mssql_1.default.Int, idpost)
                        .query(String(config_1.default.q10));
                    if (r2.recordset[0] != undefined) {
                        let estado = r2.recordset[0].estado_like;
                        if (estado == 1) {
                            yield pool.request()
                                .input('username', mssql_1.default.VarChar, req.user)
                                .input('estado', mssql_1.default.TinyInt, 0)
                                .input('idpost', mssql_1.default.Int, idpost)
                                .query(String(config_1.default.q10_2));
                        }
                        else {
                            yield pool.request()
                                .input('username', mssql_1.default.VarChar, req.user)
                                .input('estado', mssql_1.default.TinyInt, 1)
                                .input('idpost', mssql_1.default.Int, idpost)
                                .query(String(config_1.default.q10_2));
                        }
                    }
                    else {
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, req.user)
                            .input('estado', mssql_1.default.TinyInt, 1)
                            .input('idpost', mssql_1.default.Int, idpost)
                            .query(String(config_1.default.q10_1));
                    }
                    pool.close();
                    return res.status(200).send({ msg: 'like HECHO' });
                }
                else {
                    return res.status(400).send({ msg: 'no autorizado' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'ERROR error like' });
            }
        });
    }
}
const controllerspost = new Controllerspost();
exports.default = controllerspost;
