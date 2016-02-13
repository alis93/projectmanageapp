/**
 * Created by sulmanali on 31/01/2016.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    name : {type:String},
    email: {type:String,lowercase:true,unique:true},
    hash:String,
    salt:String,
    projects:[{
        //title:String,
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Project'
                },
        pinned: {type: Boolean, default: false}
             }]
});

UserSchema.methods.PinProject = function (projectId, cb) {
    ////or pass in project and set true and call save and then whatever
    //var project = some function;
    //project.pinned = true;
    //this.save(cb);
};

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password,this.salt,1000,64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password,this.salt,1000,64).toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function(){
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(exp.getTime() / 1000)
    }, 'SECRET');//use environment variable to store 'SECRET'
};

mongoose.model('User',UserSchema);