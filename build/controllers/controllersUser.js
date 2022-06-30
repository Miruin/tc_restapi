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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const connection_1 = require("../database/connection");
function creartoken(id) {
    if (!config_1.default.secrettoken)
        return "ERROR en token";
    return "Bearer " + jsonwebtoken_1.default.sign(id, config_1.default.secrettoken);
}
function changePassword(op, np, req, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield pool.request()
            .input('username', req.user)
            .query(String(config_1.default.q2_1));
        if (result.recordset[0]) {
            const pwv = yield bcryptjs_1.default.compare(op, result.recordset[0].pw_usuario);
            if (pwv) {
                let rondas = 10;
                let pwh = yield bcryptjs_1.default.hash(np, rondas);
                yield pool.request()
                    .input('nick', mssql_1.default.VarChar, req.user)
                    .input('pw', mssql_1.default.VarChar, pwh)
                    .query(String(config_1.default.q1_1));
                return 'se ha cambiado la password';
            }
            else {
                return 'no se ha podido cambiar la password';
            }
        }
        else {
        }
    });
}
class Controllersuser {
    constructor() {
    }
    reguser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                let { Username, Password, Name, Lastname } = req.body;
                if (!Username || !Password || !Name || !Lastname) {
                    return res.status(400).json({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const result = yield (0, connection_1.getdatosuser)(pool, Username);
                    if (result.recordset[0]) {
                        pool.close();
                        return res.status(400).send({ msg: 'Ya se esta usando este usuario' });
                    }
                    else {
                        let rondas = 10;
                        let pwh = yield bcryptjs_1.default.hash(Password, rondas);
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, Username)
                            .input('pw', mssql_1.default.VarChar, pwh)
                            .input('nombre', mssql_1.default.VarChar, Name)
                            .input('apellido', mssql_1.default.VarChar, Lastname)
                            .query(String(config_1.default.q1));
                        pool.close();
                        return res.status(200).send({ msg: 'Se ha registrado satisfactoriamente' });
                    }
                }
            }
            catch (e) {
                console.error(e);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                let { Username, Password } = req.body;
                if (!Username || !Password) {
                    return res.status(400).send({ msg: 'No se han llenado los valores correctamente' });
                }
                else {
                    const result = yield pool.request()
                        .input('username', Username)
                        .query(String(config_1.default.q2_1));
                    if (result.recordset[0]) {
                        const pwv = yield bcryptjs_1.default.compare(Password, result.recordset[0].pw_usuario);
                        if (pwv) {
                            pool.close();
                            return res.status(200).send({ token: creartoken(Username), msg: 'Se ha iniciado secion satisfactoriamente' });
                        }
                        else {
                            pool.close();
                            return res.status(400).send({ msg: 'La contrasena no coincide' });
                        }
                    }
                    else {
                        pool.close();
                        return res.status(400).send({ msg: 'No se ha encontrado el usuario' });
                    }
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    moduser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { Username, Name, Lastname, oldPassword, newPassword } = req.body;
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                let { nombre_usuario, apellido_usuario, nick_usuario } = result.recordset[0];
                if (Username == nick_usuario &&
                    Name == nombre_usuario &&
                    Lastname == apellido_usuario &&
                    oldPassword == null &&
                    newPassword == null) {
                    pool.close();
                    return res.status(400).send({ msg: 'No se ha cambiado ningun valor...' });
                }
                if (Name != null && Name != nombre_usuario) {
                    yield pool.request()
                        .input('nombre', mssql_1.default.VarChar, Name)
                        .input('nickname', req.user)
                        .query(String(config_1.default.q5_1));
                }
                if (Lastname != null && Lastname != apellido_usuario) {
                    yield pool.request()
                        .input('apellido', mssql_1.default.VarChar, Lastname)
                        .input('nickname', req.user)
                        .query(String(config_1.default.q5_2));
                }
                let f = 'no se ha intentado cambiar el nick de usuario';
                if (Username != null && Username != nick_usuario) {
                    const r1 = yield (0, connection_1.getdatosuser)(pool, String(Username));
                    if (r1.recordset[0]) {
                        f = 'el usuario ya existe';
                    }
                    else {
                        yield pool.request()
                            .input('nick', mssql_1.default.VarChar, Username)
                            .input('nickname', req.user)
                            .query(String(config_1.default.q5_3));
                        f = 'el nick de usuario ha cambiado';
                    }
                }
                let cp = 'no se ha intentado cambiar la password';
                if (oldPassword != null &&
                    oldPassword != '' &&
                    newPassword != null &&
                    newPassword != '') {
                    cp = String(changePassword(oldPassword, newPassword, req, pool));
                }
                return res.status(200).send({ msg: 'Los datos de usuario han sido actualizados, ' + f + ', ' + cp });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    follow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.user) {
                    let username = req.params.username;
                    const pool = yield (0, connection_1.getcon)();
                    const r1 = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                    let id = r1.recordset[0].id_usuario;
                    const r2 = yield pool.request()
                        .input('id', mssql_1.default.Int, id)
                        .input('username', mssql_1.default.VarChar, username)
                        .query(String(config_1.default.q9));
                    let estado = r2.recordset[0].estado_usuario;
                    if (estado != null) {
                        if (estado == 1) {
                            yield pool.request()
                                .input('username', mssql_1.default.VarChar, username)
                                .input('estado', mssql_1.default.TinyInt, 0)
                                .input('id', mssql_1.default.Int, id)
                                .query(String(config_1.default.q9_1));
                        }
                        else {
                            yield pool.request()
                                .input('username', mssql_1.default.VarChar, username)
                                .input('estado', mssql_1.default.TinyInt, 1)
                                .input('id', mssql_1.default.Int, id)
                                .query(String(config_1.default.q9_1));
                        }
                    }
                    else {
                        yield pool.request()
                            .input('username', mssql_1.default.VarChar, username)
                            .input('estado', mssql_1.default.TinyInt, 1)
                            .input('id', mssql_1.default.Int, id)
                            .query(String(config_1.default.q8));
                    }
                    pool.close();
                    return res.status(200).send({ msg: 'FOLLOW HECHO' });
                }
                else {
                }
            }
            catch (error) {
            }
        });
    }
    datosuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let usuario = req.user;
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, String(usuario));
                let { nick_usuario, followers_usuario, nombre_usuario, apellido_usuario } = result.recordset[0];
                const Usuario = {
                    username: nick_usuario,
                    nombre: nombre_usuario,
                    apellido: apellido_usuario,
                    followers: followers_usuario
                };
                pool.close();
                return res.status(200).send({ usuario: Usuario });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    getuser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = req.params.username;
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, username);
                let { nick_usuario, followers_usuario, nombre_usuario, apellido_usuario } = result.recordset[0];
                const Usuario = {
                    username: nick_usuario,
                    nombre: nombre_usuario,
                    apellido: apellido_usuario,
                    followers: followers_usuario
                };
                pool.close();
                return res.status(200).send({ usuario: Usuario });
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pool = yield (0, connection_1.getcon)();
                const result = yield (0, connection_1.getdatosuser)(pool, String(req.user));
                if (result.recordset[0]) {
                    pool.close();
                    return res.status(200).send({ msg: 'Tienes permiso para deslogearte' });
                }
                else {
                    pool.close();
                    return res.status(500).send({ msg: 'No se encuentra este usuario en la DB' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).send({ msg: 'Error en el servidor' });
            }
        });
    }
}
const controllersuser = new Controllersuser();
exports.default = controllersuser;
