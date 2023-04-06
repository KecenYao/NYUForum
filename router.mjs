import passport from 'passport';
import express from 'express'
import sanitize from 'mongo-sanitize';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

const router = express.Router();

// main route
router.get('/', async (req, res) => {
    // if seaching query is not empty, search for posts with matching filiter
    let filter = {};
    if (req.query === undefined) {
      filter = {};
    }
    if (req.query.topic) {
      if (req.query.topic !== 'All') {
        filter.topic = req.query.topic;
      }
    }
    if (req.query.title) {
      filter.title = req.query.title;
    }
    if (req.query.user) {
      const userfilter = {username: req.query.user}
      const user = await User.findOne(userfilter).exec();
      filter.user = user._id;
    }
    const posts = await Post.find(filter).sort('-createdAt').populate('user').exec();
    res.render('posts', {user: req.session.user, home: true, posts: posts});
});

// register route
router.get('/register', (req, res) => {
    res.render('register');
  });

router.post('/register', function(req, res) {
    User.register(new User({username:req.body.username}), 
        req.body.password, function(err, user){
    if (err) {
            res.render('register', {message: "Failed to register! Try again!"});
        
    } else {
        passport.authenticate('local')(req, res, function() {
        req.session.user = user;
        res.redirect('/');
        });
    }
    });   
});
  

// login route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
        req.session.user = user;
        res.redirect('/');
      });
    } else {
        res.render('login', {message: "Failed to login! Try again!"});
    }
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    delete req.session.user;
    res.redirect('/');
  });
});


// create post route
router.get('/post/add', (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
    }
    else{
        res.render('add');
    }
  });

router.post('/post/add', async (req, res) => {
    console.log(req.body);
    const title = sanitize(req.body.title);
    const body = sanitize(req.body.body);
    const user = req.session.user._id;
    const topic = sanitize(req.body.topic);
    const post = new Post({
    title: title,
    body: body,
    user: user,
    topic: topic,
    comments: [],
    likes: []
    });
    console.log(post);
    post.save().then(() => {
    res.redirect('/');
    });
});

// view my post route
router.get('/post/mine', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else{
        const posts = await Post.find({user: req.session.user._id}).sort('-createdAt').populate('user').exec();
        res.render('posts', {user: req.session.user, home: false, posts: posts});
    }
});

// view post detail route
router.get('/post/:slug', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  }
  else{
    const postSlug = req.params.slug;
    const TargetPost = await Post.findOne({slug: postSlug}).populate('user').exec();
    console.log(TargetPost);
    res.render('post-slug', {post: TargetPost});
    }
    });

export{router as default}