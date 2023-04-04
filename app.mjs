import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import {startAuthenticatedSession, endAuthenticatedSession} from './auth.mjs';
import './db.mjs';
import mongoose from 'mongoose';
import session from 'express-session';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

const app = express();
//server static files
app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

// session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

const authRequired = (req, res, next) => {
  if(!req.session.user) {
    req.session.redirectPath = req.path;
    res.redirect('/login'); 
  } else {
    next();
  }
};

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});



// meain route
app.get('/', async (req, res) => {
    const posts = await Post.find({}).sort('-createdAt').exec();
    res.render('posts', {user: req.session.user, home: true, posts: posts});
});

// register route
app.get('/register', (req, res) => {
    res.render('register');
  });

app.post('/register', async (req, res) => {
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);
  const netID = sanitize(req.body.netID);

  try {
    User.find({username: username}).then((user) => {
      if (user.length > 0) {
        // if user exists, redirect to register page
        res.render('register', {message: 'Username already exists'});
      } else {
        // if user does not exist, create new user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = new User({
          username: username,
          password: hash,
          netID: netID
        });
        user.save().then(() => {
          startAuthenticatedSession(req, user).then(() => {
          res.redirect('/');
          });
        });
      }

    });
  } catch (err) {
    if(err instanceof mongoose.Error.ValidationError) {
      res.render('register', {message: err.message});
    } else {
      throw err;
    }
  }
});
        
app.post('/logout', async (req, res) => {
  await endAuthenticatedSession(req);
  res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// login route
app.post('/login', async (req, res) => {
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);

  try {
    User.find({username: username}).then((user) => {
      if (user.length > 0) {
        // if user exists, login
        const isUser = bcrypt.compareSync(password, user[0].password);
        if (isUser) {
          // succesful login
          startAuthenticatedSession(req, user[0]).then(() => {
          if (req.session.redirectPath) {
            res.redirect(req.session.redirectPath);
          } else {
          res.redirect('/');
          }
        });
        }
        else{
          // incorrect password
          res.render('login', {message: 'Incorrect password'});
        }
      } else {
        // if user does not exist
        res.render('login', {message: 'User does not exist'});
      }
    });
  } catch (err) {
    if(err instanceof mongoose.Error.ValidationError) {
      res.render('login', {message: err.message});
    } else {
      throw err;
    }
  }
});

app.get('/restricted', authRequired, (req, res) => {
  let message = '<span class="error">this page is not 4 u (plz <a href="login">login</a> first)</span>';
  if(req.session.user) {
      message = '<span class="success">you are logged in, so you can see secret stuff</span>';
      res.render('restricted', {message: message});
  } else {
      res.redirect('login'); 
  } 
});

// create post route
app.get('/post/add', authRequired, (req, res) => {
  res.render('add');
  });

app.post('/post/add', authRequired, async (req, res) => {
  console.log(req.body);
  const title = sanitize(req.body.title);
  const body = sanitize(req.body.body);
  const user = req.session.user._id;
  const post = new Post({
    title: title,
    body: body,
    user: user,
    likes: [],
    comments: []
  });
  console.log(post);
  post.save().then(() => {
    res.redirect('/');
  });
});

app.listen(process.env.PORT || 3000);
