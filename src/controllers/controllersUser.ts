import { Request, Response} from 'express';
import sql from 'mssql';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection';

function creartoken(id: any) {
    if (!config.secrettoken) return "ERROR en token" 
    return "Bearer "+jwt.sign(id, config.secrettoken);
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
                    let pwh = await bcryptjs.hash(Password, rondas);
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
    
                    const pwv = await bcryptjs.compare(Password, result.recordset[0].pw_usuario);
    
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
    
            let { Email, Name, Lastname, Description } = req.body;
    
            const pool = await getcon();

            const result = await getdatosuser(pool, String(req.user));
    
            if (Email == result.recordset[0].email_usuario &&
                Name == result.recordset[0].nombre_usuario &&
                Lastname == result.recordset[0].apellido_usuario && 
                Description == result.recordset[0].descripcion_usuario) {
    
                pool.close();
                return res.status(400).send({msg: 'No se ha cambiado ningun valor...'});
                
            } 
    
        
            if(Name && Lastname && Email){

            

                await pool.request()
                .input('email', sql.VarChar, Email)
                .input('nombre', sql.VarChar, Name)
                .input('apellido', sql.VarChar, Lastname)
                .input('nickname', req.user)
                .query(String(config.q5_1));
                    
                pool.close();
                return res.status(200).send({msg: 'Se ha actualizado satisfactoriamente'});
            }
            
            
        } catch (error) {
    
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor'});
            
        }
    }

    async datosuser(req: Request, res: Response): Promise<any> {

        let usuario = req.user
    
        try {
    
            const pool = await getcon();

            const result = await getdatosuser(pool, String(usuario));
    
            let {nick_usuario, followers_usuario, nombre_usuario, apellido_usuario} = result.recordset[0];
    
            const Usuario = {

                username: nick_usuario,
                nombre: nombre_usuario,
                apellido: apellido_usuario,
                seguidores: followers_usuario

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
    
            let {nick_usuario, followers_usuario, nombre_usuario, apellido_usuario} = result.recordset[0];
    
            const Usuario = {

                username: nick_usuario,
                nombre: nombre_usuario,
                apellido: apellido_usuario,
                seguidores: followers_usuario

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