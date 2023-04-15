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
    // if (req.query.topic) {
    //   if (req.query.topic !== 'All') {
    //     filter.topic = req.query.topic;
    //   }
    // }
    // if (req.query.title) {
    //   filter.title = req.query.title;
    // }
    if (req.query.user) {
      const userfilter = {username: req.query.user}
      const user = await User.findOne(userfilter).exec();
      if (user !== null) {
        filter.user = user._id;
      }
      else{
        filter.user = null;
      }
    }

    // const posts = await Post.find(filter).sort('-createdAt').populate('user').exec();
    const posts = await Post.find(filter)
      .sort('-createdAt')
      .populate('user') 
      .exec();
    const filteredPosts = posts
      .map(post => ({ // only include relevant post fields
        id: post._id,
        title: post.title,
        topic: post.topic,
        user: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        slug: post.slug,
        body: post.body,
      }))
      .filter(post => { // filter out posts that don't match search query
        if (req.query.title) {
          return post.title.toLowerCase() === req.query.title.toLowerCase();
        }
        return true;
      })
      .filter(post => { // filter out posts that don't match search query
        if (req.query.topic && req.query.topic !== 'All') {
          return post.topic === req.query.topic;
        }
        return true;
      });
    res.render('posts', {user: req.session.user, home: true, posts: filteredPosts});
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
    const title = sanitize(req.body.title);
    const body = sanitize(req.body.body);
    const user = req.session.user._id;
    const topic = sanitize(req.body.topic);
    if (title === '' || body === '') {
        res.render('add', {message: "Can not be blank! Try again!"});
    }
    else{
      const post = new Post({
      title: title,
      body: body,
      user: user,
      topic: topic,
      comments: [],
      });
      post.save().then(() => {
      res.redirect('/');
      });
    }
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
    if (TargetPost.user._id == req.session.user._id) {
      res.render('my-post-slug', {post: TargetPost});
    }
    else{
      res.render('post-slug', {post: TargetPost});
    }}});

// comment route
router.post('/post/:slug/comment', async (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
    }
    else{
      const postSlug = req.params.slug;
    const body = sanitize(req.body.body);
    if (!body) {
      res.redirect('/post/' + postSlug);
    }
    else{
      const user = req.session.user.username;
      const comment = new Comment({
      body: body,
      user: user,
      });
      const TargetPost = await Post.findOne({slug: postSlug}).exec();
      TargetPost.comments.push(comment);
      TargetPost.save().then(() => {
      res.redirect('/post/' + postSlug);
      });
    }
  }
});

// delete post route
router.get('/post/:slug/delete', async (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
    }
    else{
      const postSlug = req.params.slug;
      await Post.findOneAndDelete({slug: postSlug}).exec();
      res.redirect('/');
    }
});

//edit post route
router.get('/post/:slug/edit', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  }
  else{
    const postSlug = req.params.slug;
    const TargetPost = await Post.findOne({slug: postSlug}).exec();
    res.render('edit', {title: TargetPost.title, body: TargetPost.body, topic: TargetPost.topic});
  }
});

router.post('/post/:slug/edit', async (req, res) => {
    const postSlug = req.params.slug;
    const title = sanitize(req.body.title);
    const body = sanitize(req.body.body);
    const topic = sanitize(req.body.topic);
    if (title === '' || body === '') {
      res.render('edit', {title: title,body : body, topic: topic ,message: "Can not be blank! Try again!"});
    }
    else{
      const new_post = await Post.findOneAndUpdate({slug: postSlug},{title:title,body:body,topic:topic},{new: true}).exec();
      const new_slug = new_post.slug;
      res.redirect('/post/' + new_slug);
    }
});


export{router as default}