//var express   = require('express');
var router = require('express').Router();
var mime = require('mime');
var multer = require('multer');
var emailExistence = require('email-existence');
var shortid = require('shortid');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'sully.s.a.786@googlemail.com',
        pass: 'Sulman_Ali1993!00'
    }
});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype));
    }
});

var upload = multer({
    storage: storage,
    limits: {fileSize: 5000000}
});

var jwt       = require('express-jwt');
var passport  = require('passport');
var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Project   = mongoose.model('Project');
var Page      = mongoose.model('Page');
var Comment = mongoose.model('Comment');
var Invite = mongoose.model('Invite');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

module.exports = router;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* setting up a user */

//prevent multiple identical emails
router.post('/register',function(req,res,next){
    if(!req.body.email || !req.body.password || !req.body.name){
        return res.status(400).json({message: 'Please fill out all fields'});
    }
    var user = new User();
    user.email = req.body.email;
    user.name= req.body.name;
    user.setPassword(req.body.password);

    user.save(function(err){
        if(err){return next(err);}
        return res.json({token:user.generateJWT()});
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.email || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

//get all projects with pages populated
router.get('/upcomingUserEvents', auth, function (req, res, next) {
    User.findById(req.payload._id, 'projects')
        .populate({path: 'projects._id', select: 'title _id endDate pages'})
        .populate({
            path: 'projects._id',
            populate: {path: 'pages', model: Page, select: '_id title endDate reminderDate startDate'}
        })
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }

            var eventList = [];

            user.projects.forEach(function (projectId) {
                var project = projectId._id;
                project.pages.forEach(function (page) {
                    if (page.startDate || page.reminderDate || page.endDate) {
                        var urlString = '/projects/' + project._id + '/pages/' + page._id;
                        if (page.startDate) {
                            eventList.push({
                                urlString: urlString,
                                event: 'Page ' + page.title + ' is Due to Start ',
                                date: page.startDate
                            });
                        }
                        if (page.reminderDate) {
                            eventList.push({
                                urlString: urlString,
                                event: 'Reminder for the page ' + page.title,
                                date: page.reminderDate
                            });
                        }
                        if (page.endDate) {
                            eventList.push({
                                urlString: urlString,
                                event: 'Page ' + page.title + ' is Due to Complete ',
                                date: page.endDate
                            });
                        }
                    }
                });
                if (project.endDate) {
                    eventList.push({
                        urlString: '/projects/' + project._id,
                        event: 'The project ' + project.title + ' is Due',
                        date: project.endDate
                    });
                }
            });
            res.json(eventList);
        });
});



/* GET all projects belonging to a user */
/* CREATE a new project for a users */
router.route('/projects')
    //get all projects belonging to the current user
    .get(auth,function(req,res,next){
        User.findById(req.payload._id,'projects')
            .populate('projects._id')
            .exec(function(err,user){
                if(err) {return next(err);}
                var projects = user.projects.map(function (project) {
                    return project._id;
                });

                res.json(projects);
            });
    })
    //add new project, also updating user
    .post(auth, upload.single('file'), function (req, res, next) {

        var project = new Project(req.body);
        project.createdBy = req.payload._id;
        project.team.push(req.payload._id);
        if (req.file) {
            project.projectIcon = '/images/' + req.file.filename;
        }
        project.updates.push({
            urlString: "/projects/" + project._id,
            updatedBy: req.payload._id,
            update: req.payload.name + " created a new project - " + project.title,
            date: Date.now()
        });

        project.save(function(err,project){
            if (err) {
                return next(err);
            }

            User.findById(req.payload._id).exec(function (err, user) {
                if (err) {
                    return next(err);
                }
                user.projects.push(project._id);
                user.save(function (err) {
                    if(err){ return next(err); }
                    res.json({project: project});
                });
            });
        });
    });
//delete single/multiple projects using one of two methods below either put or delete research which to use
//.delete ---get an array of project ids in req and delete them? for deleting multiple projects at once from the projects page?
//.put to get an array of project ids in req and remove from db?


/* GET    a single project */
/* UPDATE a single project */
/* DELETE s single project*/

//get the current project in the url
router.param('project_id',function(req,res,next,id){
    Project.findById(id)
        .populate({path: 'pages team', select: 'name email'})
        .populate({path: 'pages', populate: {path: 'assignedTo', model: 'User', select: 'name email'}})
        //.populate({path: 'pages', populate: {path: 'comments', model: 'Comment'}})
        .exec(function (err, project) {
            if (err) {
                return next(err);
            }
            if (!project) {
                return next(new Error('can\'t find project'));
            }
            req.project = project;
            return next();
        });
});

// get, update or delete a project
router.route('/projects/:project_id')
    //get a specific project
    .get(auth,function(req,res){
        res.json(req.project);
    })
    //update project details
    .put(auth, upload.single('file'), function (req, res, next) {


        var projectDetails = req.body;
        if (req.file) {
            projectDetails.projectIcon = '/images/' + req.file.filename;
        }
        req.project.updateProjectDetails(projectDetails, function (err, project) {
            if (err) {
                return next(err);
            }
            project.updates.push({
                urlString: "/projects/" + project._id,
                updatedBy: req.payload._id,
                update: req.payload.name + " updated Project Information for - " + project.title,
                date: Date.now()
            });
            project.save(function (err, project) {
                if (err) {
                    return next(err);
                }
                res.json(project);
            });
        });
    })
    //delete a specific project
    .delete(auth, function (req, res, next) {
        console.log("DELETE!!");
        //TODO if last member in project.team then remove project completely
        //also if last member in project.team then remove project invites using the id
        //else remove from the user project list only and project.team -DONE
        User.findOneAndUpdate({_id: req.payload._id},
            {$pull: {projects: {_id: req.project._id}}}, {new: true})
            .exec(function (err, user) {
                if (err) {
                    return next(err);
                }
                var index = req.project.team.findIndex(function (member) {
                    return user._id.toString() == member._id.toString();
                });
                if (index != -1) {
                    req.project.team.splice(index, 1);
                    req.project.save(function (err) {
                            if(err){return next(err);}
                        });
                }
                res.json(req.project);
                //TODO unassign tasks assigned to this user from the project
                //Page.find({project:req.project._id,assignedTo:user._id})
                //    .remove()
                //    .exec(function (err,pages) {
                //console.log("PAGES!!!!",pages);
                //pages.assignedTo = null;
                //pages.save(function (err) {
                //    if(err){return next;}
                Page.aggregate([
                    {
                        $match: {
                            project: req.project._id,
                            assignedTo: user._id,
                            completed: false
                        }
                    },
                    {
                        $group: {
                            _id: '$assignedTo',
                            count: {$sum: 1}
                        }
                    }], function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result.length > 0) {
                        var current = result[0];
                        (function (current) {
                            User.findById(current._id).exec(function (err, user) {
                                if (err) {
                                    return next();
                                }
                                user.decrementNumTasks(current.count, function (err) {
                                    if (err) {
                                        return next();
                                    }
                                });
                            });
                        }(current));
                    }
                });


                //});
                //});


            });
    });
//archive project
router.put('/projects/:project_id/archive', auth, function (req, res) {
    req.project.setProjectArchived(req.body.isArchived, function (err, project) {
        if (err) {
            return next(err);
        }
        if (!req.body.isArchived) {
            User.findById(req.payload._id)
                .exec(function (err, user) {
                    if (err) {
                        return next(err);
                    }
                    user.setPinnedProject(req.project._id, false, function (err) {
                        if (err) {
                            return next(err);
                        }
                    });
                });
        }

        project.updates.push({
            urlString: "/projects/" + project._id,
            updatedBy: req.payload._id,
            update: req.payload.name + " Project was Archived - " + project.title,
            date: Date.now()
        });

        project.save(function (err, project) {
            if (err) {
                return next(err);
            }
            var respStr = 'The project is now';
            respStr = respStr + (project.archived ? 'Archived' : 'Active');
            res.json(respStr);
            Page.aggregate([
                {
                    $match: {
                        project: req.project._id,
                        completed: false
                    }
                },
                {
                    $group: {
                        _id: '$assignedTo',
                        count: {$sum: 1}
                    }
                }], function (err, result) {
                if (err) {
                    console.log(err);
                }
                for (var i = 0; i < result.length; i++) {
                    var current = result[i];
                    if (current._id) {
                        (function (current) {
                            User.findById(current._id).exec(function (err, user) {
                                if (err) {
                                    return next();
                                }
                                if (req.body.isArchived) {
                                    user.decrementNumTasks(current.count, function (err) {
                                        if (err) {
                                            return next();
                                        }
                                    });
                                } else {
                                    user.incrementNumTasks(current.count, function (err) {
                                        if (err) {
                                            return next();
                                        }
                                    });
                                }
                            });
                        }(current));
                    }
                }
            });
        });
    });
});

//bookmark project
router.put('/projects/:project_id/bookmark', auth, function (req, res) {
    User.findById(req.payload._id)
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            user.setPinnedProject(req.project._id, req.body.isPinned, function (err) {
                if (err) {
                    return next(err);
                }
                res.json('bookmark changed successfully!');
            })
        });
});

//get project updates
router.get('/projects/:project_id/updates', auth, function (req, res) {
    res.json(req.project.updates);
});

/* GET all pages in a project */
/* POST a new page in a project */

//get all the current pages in a project or
//post a new page
router.route('/projects/:project_id/pages')
    .get(auth, function (req, res) {
        res.json(req.project.pages);
    })
    .post(auth, function (req, res, next) {
        var page = new Page(req.body);
        page.project = req.project._id;
        page.createdBy = req.project.createdBy;
        page.save(function(err,page){
            if(err){return next(err);}
            //change this to with id key. like comments in thinkster
            req.project.pages.push({_id: page._id});

            req.project.updates.push({
                urlString: "/projects/" + req.project._id + "/pages/" + page._id,
                updatedBy: req.payload._id,
                update: req.payload.name + " added a new page in - " + req.project.title,
                date: Date.now()
            });

            req.project.save(function(err){
                if(err){return next(err);}
                res.json(page);
            });
        });
    });

/* GET    a single page in a project */
/* UPDATE a single page in a project*/
/* DELETE a single page in a project*/

//GET the current page in the url
router.param('page_id', function (req, res, next, id) {
    Page.findById(id).populate('comments')
        .populate('comments')
        .exec(function (err, page) {
        if (err) {
            return next(err);
        }
        if (!page) {
            return next(new Error('can\'t find page'));
        }
        req.page = page;
        return next();
    });
});
router.route('/projects/:project_id/pages/:page_id')
    .get(auth, function (req, res) {
        res.json(req.page);
    })
    .delete(auth, function (req, res, next) {
        req.page.remove(function (err, page) {
            if (err) {
                return next(err);
            }

            req.project.updates.push({
                urlString: "/projects/" + req.project._id + "/pages",
                updatedBy: req.payload._id,
                update: req.payload.name + " Deleted the page " + page.title + " in - " + req.project.title,
                date: Date.now()
            });
            req.project.pages.pull(page);

            req.project.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.json(page);
            });
        });
    })

    //add update here
    .put(auth, function (req, res, next) {
        var previouslyAssigned = req.page.assignedTo || '';
        var nowAssigned = '';
        if (req.body.assignedTo) {
            nowAssigned = req.body.assignedTo._id;
        }

        req.page.title = req.body.title;
        req.page.description = req.body.description;
        req.page.assignedTo = req.body.assignedTo;
        req.page.startDate = req.body.startDate;
        req.page.endDate = req.body.endDate;
        req.page.reminderDate = req.body.reminderDate;

        req.page.save(function (err, page) {
            if (err) {
                return next(err);
            }
            res.json(page);
            if (previouslyAssigned.toString() !== nowAssigned.toString()
                && !req.page.completed) {
                User.findById(req.body.assignedTo).exec(function (err, user) {
                    if (err) {
                        return next();
                    }
                    user.incrementNumTasks(1, function (err) {
                        if (err) {
                            return next();
                        }
                        console.log(user);
                    });
                });
            }
        });
    });

router.put('/projects/:project_id/pages/:page_id/complete', auth, function (req, res) {
    req.page.completed = req.body.isComplete;
    req.page.save(function (err, page) {
        if (err) {
            return next();
        }
        req.project.updates.push({
            urlString: "/projects/" + req.project._id + "/pages",
            updatedBy: req.payload._id,
            update: req.payload.name + " Completed the page " + page.title + " in - " + req.project.title,
            date: Date.now()
        });

        req.project.save(function (err) {
            if (err) {
                return next();
            }
            res.json(page);
            if (req.page.assignedTo) {
                User.findById(req.page.assignedTo).exec(function (err, user) {
                    if (err) {
                        return next();
                    }
                    if (req.page.completed) {
                        user.decrementNumTasks(1, function (err) {
                            if (err) {
                                return next();
                            }
                            console.log(user);
                        });
                    } else {
                        user.incrementNumTasks(1, function (err) {
                            if (err) {
                                return next();
                            }
                            console.log(user);
                        });
                    }
                });

            }





        });
    });
});


router.put('/projects/:project_id/pages/:page_id/completionDetails', auth, function (req, res) {
    req.page.dateCompleted = req.body.date;
    req.page.hoursToComplete = req.body.hours;
    req.page.completedBy = req.payload._id;

    req.page.save(function (err, page) {
        if (err) {
            return next();
        }
        res.json(page);
    });
});

/* Post a comment to a page*/
router.post('/projects/:project_id/pages/:page_id/comments', auth, function (req, res, next) {
    var newComment = new Comment(req.body);
    newComment.author = req.payload.name;
    newComment.page = req.page._id;

    newComment.save(function (err, comment) {
        if (err) {
            return next(err);
        }

        req.page.comments.push(comment);
        req.page.save(function (err) {
            if (err) {
                return next(err);
            }
            res.json(comment);
        });
    });
});


/*GET all files*/
//gets all files when getting a project
/*POST a new file*/
router.post('/projects/:project_id/files', auth, upload.single('file'), function (req, res, next) {

    console.log(req.file);

    var file = {
        fileId: req.file.filename,
        filename: req.file.originalname,
        path: req.file.path,
        uploadedBy: req.payload._id,
        uploadDate: new Date()
    };
    req.project.files.push(file);
    req.project.save(function (err) {
        if (err) {
            return next(err);
        }
        console.log(file);
        res.json(file);
    });
});

/*GET single file*/
//can we just use the filename in front end like image?
/*DELETE single file*/
router.delete('/projects/:project_id/files/:filename', auth, function (req, res, next) {
    //delete from array in project schema
    req.project.removeFile(req.params.filename, function (err) {
        if (err) {
            return next(err);
        }
        //fs.unlink delete from folder
    });
});

router.get('/invites', auth, function (req, res, next) {
    //get project invites
    Invite.find({email: req.payload.email})
        .populate({path: 'project', select: 'projectIcon title'})
        .exec(function (err, invites) {
            if (err) {
                return next(err);
            }
            res.json(invites);
        });
});

//Team features in project
router.put('/projects/:project_id/invite', auth, function (req, res, next) {

    var resp = {newInvite: false, msg: ""};
    emailExistence.check(req.body.email, function (err, isEmail) {
        isEmail = true;//TODO should I check this or not
        if (!isEmail) {
            resp.msg = "This is not a real email address!";
            res.json(resp);
        } //valid email
        else {
            var existingInvite = req.project.pendingEmails.find(function (invite) {
                return req.body.email === invite.toString();
            });
            var existingMember = req.project.team.find(function (member) {
                return req.body.email === member.email.toString();
            });
            if (existingMember) { //already in project
                resp.newInvite = false;
                resp.msg = "This email is already part of the project";
                res.json(resp);
            } else if (existingInvite) { //already invited
                resp.newInvite = false;
                resp.msg = "This email has already been sent an invite, but we have sent a reminder";
                res.json(resp);
                sendInvite(req.project._id, req.body.email); //send new invite
            } else {
                resp.newInvite = true;
                resp.msg = "We have sent an invite to this email address";
                req.project.pendingEmails.push(req.body.email);//add to pending
                req.project.updates.push({
                    urlString: "/projects/" + req.project._id + "/team",
                    updatedBy: req.payload._id,
                    update: req.body.email + " was invited to the project - " + req.project.title,
                    date: Date.now()
                });
                req.project.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.json(resp);
                    sendInvite(req.project._id, req.body.email);
                });
            }
        }
    });
});


router.put('/inviteResponse', auth, function (req, res, next) {
    Invite.findById(req.body.invite._id)
        .exec(function (err, invite) {
            if (err) {
                next(err);
            }
            if (!invite) {
                res.json({msg: "Something went wrong!, ask for another invite for the project!"});
            } else {
                if (req.body.invite.project._id === invite.project.toString()
                    && req.body.invite.code === invite.code
                    && req.body.invite.email === invite.email
                    && req.payload.email === invite.email) {
                    invite.remove(function (err) {
                        if (err) {
                            next(err);
                        }
                        Project.findById(invite.project)
                            .exec(function (err, project) {
                                if (err) {
                                    next(err);
                                }
                                project.pendingEmails.pull(invite.email);
                                if (req.body.response) {
                                    project.team.push(req.payload._id);
                                }
                                project.save(function (err) {
                                    if (err) {
                                        next(err);
                                    }
                                    if (req.body.response) {
                                        User.findById(req.payload._id).exec(function (err, user) {
                                            if (err) {
                                                next(err);
                                            }
                                            user.projects.push(invite.project);
                                            user.save(function (err) {
                                                if (err) {
                                                    next(err);
                                                }
                                                res.json({
                                                    project: project,
                                                    msg: "You sucessfully accepted the invite!"
                                                });
                                            });
                                        })
                                    } else {
                                        res.json({msg: "you declined the project Invite"});
                                }
                            });
                            });
                    });
                } else {
                    res.json({msg: "Something went wrong!, ask for another invite for the project!"});
                }
            }
        });
});

//sends unique url using email and code
//checks InviteSchema for existing invite for the project and email
function sendInvite(projectID, inviteEmail) {
    console.log(inviteEmail + "kldsfjlskdjklfjsdklfjdsklfj");
    Invite.findOne({project: projectID, email: inviteEmail})
        .exec(function (err, invite) {
            if (err) {
                return next(err);
            }
            if (!invite) {
                invite = new Invite({
                    project: projectID,
                    email: inviteEmail,
                    code: shortid.generate()
                });
                invite.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    sendEmail(inviteEmail, '<p>You have been sent an invite to join a project on Project Manager.</p>' +
                        '<p> To join the project, login or sign up and accept the invite</p>');
                });
            } else {
                sendEmail(inviteEmail, '<p>You have been sent an invite to join a project on Project Manager.</p>' +
                    '<p> To join the project, login or sign up and accept the invite</p>');
            }
        });
}

//sends email
function sendEmail(email, emailBody) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'sully.s.a.786@googlemail.com', // sender address
        to: email,
        subject: 'Project Invite', // Subject line
        html: emailBody// html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
    });
}

//get user's details, either this user or using supplied userid
router.param('userID', function (req, res, next, id) {
    console.log('user ');
    User.findById(id)
        .populate({
            path: 'projects._id',
            populate: {
                path: 'pages',
                model: Page,
                populate: {
                    path: 'assignedTo completedBy',
                    model: User,
                    select: 'name email'
                }
            }
        })
        .exec(function (err, user) {
            if (err) {
                return next(err);
            }
            req.user = user;
            return next();
        });
});

router.get('/user/:userID', auth, function (req, res) {
    res.json(req.user);
});

router.get('/user/:userID/aggregate/completedTasksByDate', auth, function (req, res) {
    Page.aggregate([
        {
            $match: {
                assignedTo: req.user._id,
                completed: true
            }
        },
        {
            $group: {
                _id: {
                    month: {$month: "$dateCompleted"},
                    day: {$dayOfMonth: "$dateCompleted"},
                    year: {$year: "$dateCompleted"}
                },
                count: {$sum: 1}
            }
        }, {$sort: {_id: 1}}], function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("completedStuff", result);
        res.json(result);
    });
});

router.get('/user/:userID/aggregate/AssignedTasksByDate', auth, function (req, res) {

    User.aggregate([
        {
            $match: {
                _id: req.user._id
                //completed: false
            }
        },
        {$unwind: {path: '$tasksAssigned'}},
        {
            $group: {
                _id: {
                    month: {$month: "$tasksAssigned.date"},
                    day: {$dayOfMonth: "$tasksAssigned.date"},
                    year: {$year: "$tasksAssigned.date"}
                },
                count: {$first: '$tasksAssigned.numTasks'}
            }
        }, {$sort: {_id: 1}}], function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("assignedStuff", result);
        res.json(result);
    });
});


router.get('/project/:project_id/aggregate/totalHoursByUser', auth, function (req, res) {

    Page.aggregate([
        {
            $match: {
                project: req.project._id,
                completed: true,
                hoursToComplete: {$exists: true},
                dateCompleted: {$exists: true}
            }
        },
        {
            $project: {
                completedBy: {$ifNull: ["$completedBy", 'unknown']},
                hoursToComplete: '$hoursToComplete',
                dateCompleted: '$dateCompleted'
            }
        },
        {
            $group: {
                _id: "$completedBy",
                count: {$sum: "$hoursToComplete"},
                date: {
                    $addToSet: {
                        month: {$month: "$dateCompleted"},
                        day: {$dayOfMonth: "$dateCompleted"},
                        year: {$year: "$dateCompleted"}
                    }
                }


            }
        }], function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log("completedStuff", result);
        res.json(result);
    });
});

//
//{
//    month: {$month: "$dateCompleted"},
//    day: {$dayOfMonth: "$dateCompleted"},
//    year: {$year: "$dateCompleted"}
//}