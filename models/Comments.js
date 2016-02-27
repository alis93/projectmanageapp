var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    page: {type: mongoose.Schema.Types.ObjectId, ref: 'Page'}
}, {timestamps: true});

mongoose.model('Comment', CommentSchema);