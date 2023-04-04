import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';


const mongooseOpts = {
  useNewUrlParser: true,  
  useUnifiedTopology: true
};


mongoose.connect('mongodb://localhost/NYU_Forum', mongooseOpts).then(
  () => {console.log('connected to database');
}).catch(
  err => {console.log(err);}
);

mongoose.plugin(slug);

const User = new mongoose.Schema({
  username: {type: String, required: true},
  netID: {type: String,required: true, unique: true, length: 6},
  password : {type: String, required: true, minlength: 8},
});

const Comment = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  body: String,
  date: Date,
});

const Post = new mongoose.Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  likes: [User],
  comments: [Comment],
  slug: {type: String, slug: 'title', unique: true},
  date: {type: Date, default: Date.now},
}, {timestamps: true});

mongoose.model('User', User);
mongoose.model('Post', Post);
mongoose.model('Comment', Comment);