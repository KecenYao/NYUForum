import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';
import passportLocalMongoose from 'passport-local-mongoose';

// is the environment variable, NODE_ENV, set to PRODUCTION? 
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/NYU_Forum';
}


const mongooseOpts = {
  useNewUrlParser: true,  
  useUnifiedTopology: true
};

mongoose.connect(dbconf, mongooseOpts).then(
  () => {console.log('connected to database');
}).catch(
  err => {console.log(err);}
);

mongoose.plugin(slug);

const User = new mongoose.Schema({
});

const Comment = new mongoose.Schema({
  user: {type: String, required: true},
  body: String,
}, {timestamps: true});

const Post = new mongoose.Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  likes: {type: [String], default: [], required: true, sparse: true},
  comments: [Comment],
  topic: {type: String, required: true},
  slug: {type: String, slug: 'title', unique: true},
}, {timestamps: true});


User.plugin(passportLocalMongoose);

mongoose.model('User', User);
mongoose.model('Post', Post);
mongoose.model('Comment', Comment);