import mongoose from 'mongoose';


const mongooseOpts = {
  useNewUrlParser: true,  
  useUnifiedTopology: true
};


mongoose.connect('mongodb://localhost/dbName', mongooseOpts).then(
  () => {console.log('connected to database');
}).catch(
  err => {console.log(err);}
);
const User = new mongoose.Schema({
  
    username: {type: String, unique: true},
    netID: {type: String, unique: true, length: 6},
    passwords : {type: String, length: 8},
    posts: [Post],
});

const Post = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  title: String,
  body: String,
  likes: Number,
  comments: [comments],
  date: {type: Date, default: Date.now},
});

const Comment = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  body: String,
  date: Date,
});

mongoose.model('User', User);
mongoose.model('Post', Post);
mongoose.model('Comment', Comment);