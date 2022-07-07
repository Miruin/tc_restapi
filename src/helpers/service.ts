import multer from 'multer';
import mimeTypes from 'mime-types';
import fs from 'fs';

const storage = multer.diskStorage({

    destination: function(req, file, cb){
        
        let urldirectorio = "public/post/"+req.user;
        
        if( !fs.existsSync(urldirectorio) ){

            fs.mkdirSync(urldirectorio, { recursive: true });

        }
    
        cb(null,urldirectorio);

    },
    filename: function(req, file, cb){

        let urlarchivo = Date.now()+"-"+req.user+"."+mimeTypes.extension(file.mimetype);
        cb(null,urlarchivo);
    }
});
    
export const upload = multer({
    storage: storage
});
