// const startAuthenticatedSession = (req, user, cb) => {
//   return new Promise((resolve, reject) => {
//     req.session.regenerate((err) => {
//       if (err) {
//         reject(err);
//       } else {
//         req.session.user = user; 
//         resolve(user);
//       } 
//     });
//   });
// };

// const endAuthenticatedSession = (req, cb) => {
//   return new Promise((resolve, reject) => {
//     req.session.destroy((err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// };

// export {
//   startAuthenticatedSession,
//   endAuthenticatedSession
// };

import mongoose from 'mongoose'
import passport from 'passport'
import passportlocal from 'passport-local'

const LocalStrategy = passportlocal.Strategy;
const User = mongoose.model('User');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
