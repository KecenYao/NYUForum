import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import './db.mjs';
import './auth.mjs';
import passport from 'passport';
import session from 'express-session';
import rounter from './router.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
//server static files
app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

// session
app.use(session({
  secret: 'secret cookie thang (store this elsewhere!)',
	resave: true,
	saveUninitialized: true
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/', rounter);

app.listen(process.env.PORT ?? 3000);
console.log("Server running on port", process.env.PORT ?? 3000);