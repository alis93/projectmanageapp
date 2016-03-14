/**
 * Created by sulmanali on 10/03/2016.
 */
var mongoose = require('mongoose');
var shortid = require('shortid');

var InviteSchema = new mongoose.Schema({
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    email: {type: String},
    code: {
        type: String,
        unique: true,
        'default': shortid.generate
    }
}, {timestamps: true});

mongoose.model('Invite', InviteSchema);