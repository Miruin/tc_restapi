import sql from 'mssql';
import config from '../config/config';

export async function getcon(){

    const pool = await sql.connect({

        user: config.dbuser,
        password: config.dbpw,
        server: config.dbserver,
        database: config.dbdatabase,
        options: { 

            encrypt: true,
            trustServerCertificate: true,
            cryptoCredentialsDetails: {

                minVersion: 'TLSv1'

            }

        }
        
    });
    return pool;

};

export async function getdatosuser(p: sql.ConnectionPool , nickname: string){

    const result = await p.request()
    .input('nick', nickname)
    .query(String(config.q2));
        
    return result;

}


