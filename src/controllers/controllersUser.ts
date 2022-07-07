import { Request, Response} from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection';

function creartoken(id: any) {
    if (!config.secrettoken) return "ERROR en token" 
    return "Bearer "+jwt.sign(id, config.secrettoken);
}


async function changePassword(op: string, np: string, req: Request, pool: sql.ConnectionPool) {

    const result = await pool.request()
    .input('username', req.user)
    .query(String(config.q2_1));
    
    if (result.recordset[0]) {
    
        const pwv = await bcrypt.compare(op, result.recordset[0].pw_usuario);
    
        if (pwv) {
                    
            let rondas = 10;
            let pwh = await bcrypt.hash(np, rondas);

            await pool.request()
            .input('nick', sql.VarChar, req.user)
            .input('pw', sql.VarChar, pwh)
            .query(String(config.q3));

            return 'se ha cambiado la password';
                        
        } else {

            return 'no se ha podido cambiar la password';

        }
    
    } else {


    } 

}
class Controllersuser {


    constructor() {
        
    }

    async reguser (req: Request, res: Response): Promise<any>{
       
        try {

            const pool = await getcon();

            let { Username, Password, Name, Lastname } = req.body;
            
            if(!Username || !Password || !Name || !Lastname) {
    
                return res.status(400).json({ msg : 'No se han llenado los valores correctamente'});
    
            } else {

                const result = await getdatosuser(pool, Username);

                if (result.recordset[0]) { 
                        
                    pool.close();
                    return res.status(400).send({msg: 'Ya se esta usando este usuario'});

                } else {


                    let rondas = 10;
                    let pwh = await bcrypt.hash(Password, rondas);
                    await pool.request()
                    .input('nick', sql.VarChar, Username)
                    .input('pw', sql.VarChar, pwh)
                    .input('nombre', sql.VarChar, Name)
                    .input('apellido', sql.VarChar, Lastname)
                    .query(String(config.q1));

                    pool.close();
                    return res.status(200).send({msg: 'Se ha registrado satisfactoriamente'});
                    
                }

            }
    
        } catch(e) {

            console.error(e);
            return res.status(500).send({msg: 'Error en el servidor'});

        }
    }
    
    
    async login(req: Request, res: Response): Promise<any> {
    
        try {
    
            const pool = await getcon();
    
            let { Username, Password} = req.body;
    
            if (!Username || !Password) {
    
                return res.status(400).send({ msg : 'No se han llenado los valores correctamente'});
                
            } else {
                
                const result = await pool.request()
                .input('username', Username)
                .query(String(config.q2_1));
    
                if (result.recordset[0]) {
    
                    const pwv = await bcrypt.compare(Password, result.recordset[0].pw_usuario);
    
                    if (pwv) {
                        
                        pool.close();
                        return res.status(200).send({token: creartoken(Username), msg: 'Se ha iniciado secion satisfactoriamente'});
                        
                    } else {

                        pool.close();
                        return res.status(400).send({msg: 'La contrasena no coincide'});

                    }
    
                } else {

                    pool.close();
                    return res.status(400).send({msg: 'No se ha encontrado el usuario'});

                } 
    
            }
            
        } catch (error) {
            
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
    
        }
    
    }

    async moduser(req: Request, res: Response): Promise<any> {
    
        try {
    
            let { Username, Name, Lastname, oldPassword, newPassword} = req.body;
    
            const pool = await getcon();

            const result = await getdatosuser(pool, String(req.user));
            console.log(req.user);
            
            
            let { name_usuario, lastname_usuario, nick_usuario} = result.recordset[0]

            if ((Username == nick_usuario || Username =='') &&
                (Name == name_usuario || Name == '') &&
                (Lastname == lastname_usuario || Lastname == '') &&
                ((oldPassword == null || oldPassword =='') ||
                (newPassword == null || newPassword == ''))) {
    
                pool.close();
                return res.status(400).send({msg: 'No se ha cambiado ningun valor...'});
                
            } 
    
            if(Name != null && Name != name_usuario && Name != ''){

                await pool.request()
                .input('nombre', sql.VarChar, Name)
                .input('nickname', req.user)
                .query(String(config.q3_1));
            }
            
            if(Lastname != null && Lastname != lastname_usuario && Lastname != ''){

                await pool.request()
                .input('apellido', sql.VarChar, Lastname)
                .input('nickname', req.user)
                .query(String(config.q3_2));
            }

            let f = 'no se ha intentado cambiar el nick de usuario'

            let token = ''

            if(Username != null && Username != nick_usuario && Username != ''){
                
                const r1 = await getdatosuser(pool, String(Username));

                if (r1.recordset[0]) {

                    f = 'el usuario ya existe'
                    
                } else {

                    await pool.request()
                    .input('nick', sql.VarChar, Username)
                    .input('nickname', req.user)
                    .query(String(config.q3_3));

                    await pool.request()
                    .input('nick', sql.VarChar, Username)
                    .input('nickname', req.user)
                    .query(String(config.q3_4));

                    token = creartoken(Username)
                    f = 'el nick de usuario ha cambiado'
                    
                }
                
            }
            
            let cp = 'no se ha intentado cambiar la password'

            if(oldPassword != null &&
                oldPassword != '' &&
                newPassword != null &&
                newPassword != ''){

                let r = await changePassword(oldPassword, newPassword, req, pool)

                cp = String(r)
            }

            return res.status(200).send({msg: 'Los datos de usuario han sido actualizados, '+f+', '+cp, newToken: token})

            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
            
        }
    }

    async follow(req: Request, res: Response): Promise<any> {

        try {
            
            if (req.user) {

                let username = req.params.username
                
                const pool = await getcon();

                const r1 = await getdatosuser(pool, String(req.user));

                let id = r1.recordset[0].id_usuario

                const r2 = await pool.request()
                .input('id', sql.Int, id)
                .input('username', sql.VarChar, username)
                .query(String(config.q9))
                
                if (r2.recordset[0] != undefined) {

                    let estado = r2.recordset[0].estado_follow

                    if (estado == 1) {

                        await pool.request()
                       .input('username', sql.VarChar, username)
                       .input('estado', sql.TinyInt, 0)
                       .input('id', sql.Int, id)
                       .query(String(config.q8_1));
                        
                    } else {

                        await pool.request()
                       .input('username', sql.VarChar, username)
                       .input('estado', sql.TinyInt, 1)
                       .input('id', sql.Int, id)
                       .query(String(config.q8_1));
                    
                    }
                    
                } else {

                    await pool.request()
                   .input('username', sql.VarChar, username)
                   .input('estado', sql.TinyInt, 1)
                   .input('id', sql.Int, id)
                   .query(String(config.q8));

                }

                pool.close();
                return res.status(200).send({msg: 'FOLLOW HECHO'});
                
            } else {
                
                return res.status(400).send({msg: 'no autorizado'});
            }
            
        } catch (error) {

            console.error(error);

            return res.status(500).send({msg: 'ERROR FOLLOW'});
            
            
        }
    }

    async datosuser(req: Request, res: Response): Promise<any> {

        let usuario = req.user
    
        try {
    
            const pool = await getcon();

            const result = await getdatosuser(pool, String(usuario));
    
            let {nick_usuario, followers_usuario, name_usuario, lastname_usuario} = result.recordset[0];

            const Usuario = {

                username: nick_usuario,
                nombre: name_usuario,
                apellido: lastname_usuario,
                followers: followers_usuario

            }
            
            pool.close();
            
            return res.status(200).send({usuario: Usuario});
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
            
        }
    }

    async getuser(req: Request, res: Response): Promise<any> {

        let username = req.params.username
    
        try {
    
            const pool = await getcon();

            const result = await getdatosuser(pool, username);
    
            let {nick_usuario, followers_usuario, name_usuario, lastname_usuario} = result.recordset[0];
    
            const Usuario = {

                username: nick_usuario,
                nombre: name_usuario,
                apellido: lastname_usuario,
                followers: followers_usuario

            }
            pool.close();
            
            return res.status(200).send({usuario: Usuario});
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
            
        }
    }
    
    async logout(req: Request, res: Response): Promise<any> {

        try {

            const pool = await getcon();

            const result = await getdatosuser(pool, String(req.user));
        
            if (result.recordset[0]) {

                pool.close();
                return res.status(200).send({msg: 'Tienes permiso para deslogearte'});
        
            } else {
        
                pool.close();
                return res.status(500).send({msg: 'No se encuentra este usuario en la DB'});
        
            }
            
        } catch (error) {

            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
            
        }
        
    }
    
}


const controllersuser = new Controllersuser();

export default controllersuser;