import express from 'express'
import cors from 'cors'
import passport from 'passport'

import middleware from './middleware/auth'
import config from './config/config';
import rutauser from './routes/routeuser';
import rutapost from './routes/routepost'


class server {

    app: express.Application;

    constructor(){

        this.app = express();
        this.config();
        this.routes();

    }

    config() {

        this.app.set('port', config.port);

        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(cors());
        this.app.use(passport.initialize());
        passport.use(middleware); 
    }

    routes() {

        this.app.use(rutauser);
        this.app.use(rutapost)
    }
    
    start() {

        this.app.listen(this.app.get('port'), () => {

            console.log('El servidor esta corriendo en el puerto: ', this.app.get('port'));
            
        });
    }

}

const serv = new server();
serv.start();
