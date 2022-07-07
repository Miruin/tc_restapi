import { Router, Request, Response } from 'express';
import passport from 'passport';

import controllerspost from '../controllers/controllersPost';
import { upload } from '../helpers/service';

const auth = passport.authenticate("jwt", { session: false });

const optionalAuth = (req: Request, res: Response, next: () => void) => {
  if (req.headers["authorization"]) {
    
    auth(req, res, next);
  } else next();
};

class Rutaspost{

    router: Router;

    constructor() {

        this.router = Router();
        this.routes();

    }
   
    routes() {
        
        this.router.post('/post', optionalAuth, upload.single('archivo'), controllerspost.crearPost);

        this.router.get('/posts/:username', optionalAuth, controllerspost.getPosts);

        this.router.delete('/post/:id', optionalAuth, controllerspost.borrarPost);

        this.router.get('/like/:id', optionalAuth, controllerspost.like);


    }
 
}

const rutapost = new Rutaspost();

export default rutapost.router