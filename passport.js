const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  { User } = require('./models.js'),
  passportJWT = require('passport-jwt');

let JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password, callback) => {
  User.findOne({ Username: username }, (error, user) => {
    if (error) {
      return callback(error);
    }
    if (!user) {
      return callback(null, false, {message: 'Incorrect username.'});
    }
    if (!user.validatePassword(password)) {
      return callback(null, false, {message: 'Incorrect password.'});
    }
    return callback(null, user);
  });
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
  return User.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));