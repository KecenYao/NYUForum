import mongoose from 'mongoose'
import passport from 'passport'
import passportlocal from 'passport-local'

const LocalStrategy = passportlocal.Strategy;
const User = mongoose.model('User');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());