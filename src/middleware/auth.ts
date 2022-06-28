import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '../config/config';


const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secrettoken,
};

export default new Strategy(options, (id, done) => done(null, id));