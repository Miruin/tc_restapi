import { Request, Response} from 'express';
import sql from 'mssql';
import fs from 'fs';
import mimeTypes from 'mime-types';

import config from "../config/config";
import { getcon, getdatosuser } from '../database/connection';

class Controllerspost {


    constructor() {
        
    }

    async crearPost(req: Request, res: Response): Promise<any> { 
        
        try {
            
            let {textPost, archivoUri,  repostId, repostEstado } = req.body;
            
            const pool = await getcon();

            const r1 = await getdatosuser(pool, String(req.user));
            let id = r1.recordset[0].id_usuario
            let f =false 
            
            if((req.file != null || archivoUri != null) ||
            (textPost != null && textPost != '')){     
                let urlarchivo = ''
                if (req.file){

                    let p = (req.file.path).split('/')
                    urlarchivo = 'https://tcrestapi.herokuapp.com/'+p[1]+'/'+p[2]+'/'+p[3]
                    
                }

                if (!req.file) {

                    if(archivoUri){

                        let archivoMetaData = String(archivoUri).split(",")
                        let urldirectorio = "public/post/"+req.user
                        let arr = String(archivoMetaData[0]).split('data:')
                        console.log(arr);
                        
                        let arr2 = String(arr[0]).split(';base64')
                        console.log(arr2);
                        
                        let mimeT = arr2[0]
                        console.log(mimeT);
    
                        let name_archivo = Date.now()+"-"+req.user+"."+mimeTypes.extension(String(mimeT));
                        urlarchivo = "https://tcrestapi.herokuapp.com/post/"+req.user+"/"+name_archivo;
                    
                        if( !fs.existsSync(urldirectorio) ){
    
                            fs.mkdirSync(urldirectorio, { recursive: true });
                
                        }
    
                        fs.writeFile(urldirectorio+'/'+name_archivo, archivoMetaData[1], 'base64', (error) =>{
    
                            if(error){
    
                                console.error(error);
                                
                            }
    
                        });
    
                    }
                    
                }
                await pool.request()
                .input('iduser', sql.VarChar, id)
                .input('url', sql.VarChar, urlarchivo)
                .input('texto', sql.VarChar, textPost)
                .input('repost', sql.TinyInt, 0)
                .query(String(config.q4)); 
                f=true
            }

           
            if (repostId != null && repostEstado != null) {
                await pool.request()
                .input('iduser', sql.VarChar, id)
                .input('repostid', sql.VarChar, repostId)
                .input('repostestado ', sql.VarChar, repostEstado)
                .query(String(config.q5));
                f=true      
            }

            if (f) {
                pool.close();
                return res.status(200).send({msg: 'POST creado'});
            }

            pool.close();
            return res.status(400).send({msg: 'no se ha destectado valores validos'});
                

        } catch (error) {

            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor al guardar el post'});
            
        } 

    }

    async borrarPost(req: Request, res: Response): Promise<any>{

        try {

            const pool = await getcon();

            const r1 = await getdatosuser(pool, String(req.user));
            let iduser = r1.recordset[0].id_usuario
            let idpost = req.params.id

            const result = await pool.request()
            .input('idu', sql.Int, iduser)
            .input('idp', sql.Int, idpost)
            .query(String(config.q6));
            
            
            if (result.recordset[0]) {

                let url = (result.recordset[0].imgurl_post).split('/')
                let p = 'public/post/'+url[4]+'/'+url[5]
                fs.stat(p, (error) =>{
                    if(error) console.error(error);
                    else fs.unlink(p,(error) => {if (error) console.error(error);});   
                });
                await pool.request()
                .input('id', idpost)
                .query(String(config.q7));
                pool.close();
                return res.status(200).send({msg: 'Se ha borrado el post satisfactoriamente'});   
            } else {
                pool.close();
                return res.status(400).send({msg: 'no tienes permitido borrar post de otros usuarios o este post no existe'});     
            }

        } catch (error) {

            console.log(error);
            return res.status(500).send({msg: 'Error en el servidor al borrar'});           

        }

    }

    async getPosts(req: Request, res: Response): Promise<any>{

        try {

            let username = req.params.username;

            console.log(username);
                
            if (username == ' ') {
                if (!req.user) return res.status(400).send({msg: 'no estas logeado'})
                username = String(req.user)
                
            }
            

            const pool = await getcon();

            const r1 = await getdatosuser(pool, String(username));
            let iduser = r1.recordset[0].id_usuario
            const arrUser = [] 
            arrUser.push(iduser)

            const rFollow = await pool.request()
            .input('iduser', iduser)
            .query(String(config.q6_3))
        

            for (const key in rFollow.recordset) {
                const r2 = await getdatosuser(pool, String(rFollow.recordset[key].usuario_follow));
                let iduser = r2.recordset[0].id_usuario;
                arrUser.push(iduser);
            }

            if (iduser == arrUser[0]) {

                type posts = {
                    nick: string;
                    img: string;
                    texto: string;
                    idpost: number;
                    likes: number;
                    repost?: number;
                    idrepost?: number;

                }
                const datos: posts[] = [];

                for (const key in arrUser) {
                    
                    const rUser = await pool.request()
                    .input('iduser', arrUser[key])
                    .query(String(config.q6_1));

                    for (const i in rUser.recordset) {

                        if (rUser.recordset[i].re_post == 0) {
                            const dato: posts = {
    
                                nick: rUser.recordset[i].nick_usuario,
                                img: rUser.recordset[i].imgurl_post,
                                texto: rUser.recordset[i].texto_post,
                                idpost: rUser.recordset[i].id_post,
                                likes: rUser.recordset[i].likes_post
            
                            }
                            datos.push(dato);
                        } else {
    
                            const datop = await pool.request()
                            .input('idpost', rUser.recordset[i].id_re_post)
                            .query(String(config.q6_2));
                            const dato: posts = {
    
                                nick: rUser.recordset[i].nick_usuario,
                                idpost: rUser.recordset[i].id_post,
                                img: datop.recordset[0].imgurl_post,
                                texto: datop.recordset[0].texto_post,
                                idrepost: datop.recordset[0].id_post,
                                repost: 1,
                                likes: datop.recordset[0].likes_post
            
                            }
                            datos.push(dato);
                            
                        }
                        
                    }

                }


                pool.close();
                return res.status(200).send(datos);
            }

            pool.close();
            return res.status(400).send({msg: 'No se ha creado ningun post de este usuario o no esta siguiendo a nadie'});
            
        } catch (error) {
            
            console.error(error);
            return res.status(500).send({msg: 'Error en el servidor '});
            
        }
        
    }

    async like(req: Request, res: Response): Promise<any> {

        try {
            
            if (req.user) {

                let idpost = req.params.id
                
                const pool = await getcon();

                const r2 = await pool.request()
                .input('nick', sql.VarChar, req.user)
                .input('idpost', sql.Int, idpost)
                .query(String(config.q10))
                
                if (r2.recordset[0] != undefined) {

                    let estado = r2.recordset[0].estado_like

                    if (estado == 1) {

                        await pool.request()
                       .input('username', sql.VarChar, req.user)
                       .input('estado', sql.TinyInt, 0)
                       .input('idpost', sql.Int, idpost)
                       .query(String(config.q10_2));
                        
                    } else {

                        await pool.request()
                       .input('username', sql.VarChar, req.user)
                       .input('estado', sql.TinyInt, 1)
                       .input('idpost', sql.Int, idpost)
                       .query(String(config.q10_2));
                    
                    }
                    
                } else {

                    await pool.request()
                   .input('nick', sql.VarChar, req.user)
                   .input('estado', sql.TinyInt, 1)
                   .input('idpost', sql.Int, idpost)
                   .query(String(config.q10_1));

                }

                pool.close();
                return res.status(200).send({msg: 'like HECHO'});
                
            } else {
                
                return res.status(400).send({msg: 'no autorizado'});
            }
            
        } catch (error) {

            console.error(error);

            return res.status(500).send({msg: 'ERROR error like'});
            
            
        }
    }
    
}

const controllerspost = new Controllerspost();
export default controllerspost;