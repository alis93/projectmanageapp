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
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        },
        pinned: {type: Boolean, default: false}
    }],
    tasksAssigned: [{
        date: {type: Date},
        numTasks: {type: Number}
    }]
});

UserSchema.methods.setPinnedProject = function (projectId, isPinned, cb) {
    for (var i = 0, len = this.projects.length; i < len; i++) {
        if (this.projects[i]._id === projectId) {
            this.projects[i].pinned = isPinned;
            break;
        }
    }
    this.save(cb);
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

UserSchema.methods.incrementNumTasks = function (numTasksToAdd, cb) {
    var today = new Date();
    var index = this.tasksAssigned.length - 1;

    console.log("num tasks to add", numTasksToAdd);

    if (index == -1) {
        this.tasksAssigned.push({date: today, numTasks: numTasksToAdd});
    } else {
        var lastEntry = this.tasksAssigned[index];
        if (lastEntry.date.getUTCDate() == today.getUTCDate()
            && lastEntry.date.getUTCMonth() == today.getUTCMonth()
            && lastEntry.date.getUTCFullYear() == today.getUTCFullYear()
        ) {
            lastEntry.numTasks += numTasksToAdd;
        } else {
            var numTasks = (lastEntry.numTasks || 0) + numTasksToAdd;
            this.tasksAssigned.push({date: today, numTasks: numTasks});
        }
    }
    console.log("tasksAssigned", this.tasksAssigned);
    this.save(cb);
};


UserSchema.methods.decrementNumTasks = function (numTasksTosubtract, cb) {
    var today = new Date();
    var index = this.tasksAssigned.length - 1;
    var lastEntry = this.tasksAssigned[index];

    console.log("num tasks to subtract", numTasksTosubtract);

    console.log(lastEntry);

    if (lastEntry.date.getUTCDate() == today.getUTCDate()
        && lastEntry.date.getUTCMonth() == today.getUTCMonth()
        && lastEntry.date.getUTCFullYear() == today.getUTCFullYear()
    ) {
        lastEntry.numTasks -= numTasksTosubtract;
        if (lastEntry.numTasks < 0) {
            lastEntry.numTasks = 0;
        }
    } else {

        var numTasks = (lastEntry.numTasks || 0) - numTasksTosubtract;
        if (lastEntry.numTasks < 0) {
            lastEntry.numTasks = 0;
        }

        this.tasksAssigned.push({date: today, numTasks: numTasks});
    }

    console.log("tasksAssigned", this.tasksAssigned);
    this.save(cb);
};



mongoose.model('User',UserSchema);