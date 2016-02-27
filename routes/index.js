var express   = require('express');
var mime = require('mime');
var router    = express.Router();
var multer = require('multer');

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


/* GET all projects belonging to a user */
/* CREATE a new project for a users */

router.route('/projects')
    //get all projects belonging to the current user
    .get(auth,function(req,res,next){
        User.findById(req.payload._id,'projects')
            .populate('projects._id', '_id createdAt projectIcon title endDate archived')
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
        console.log(req.body);

        var project = new Project(req.body);
        project.createdBy = req.payload._id;
        if (req.file) {
            project.projectIcon = '/images/' + req.file.filename;
        }

        project.save(function(err,project){
            if (err) {
                return next(err);
            }
            User.findByIdAndUpdate(req.payload._id, {$push: {projects: {_id: project._id}}}, {upsert: true, new: true})
                .exec(function (err) {
                    if(err){ return next(err); }
                    res.json({project: project});
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
        .populate({path: 'pages'})
        .populate({path: 'pages', populate: {path: 'comments', model: 'Comment'}})
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
        console.log(req.body);
        var projectDetails = req.body;
        if (req.file) {
            projectDetails.projectIcon = '/images/' + req.file.filename;
        }
        req.project.updateProjectDetails(projectDetails, function (err, project) {
            if(err){return next(err);}
            res.json(project);
        });
    })
    //delete a specific project
    .delete(function(req,res,next){
        req.project.remove(function(err,project){
            if(err){return next(err);}
            User.findOneAndUpdate({_id:project.createdBy},
                {$pull:{projects:{ _id:project._id }} },
                {new: true})
                .exec(function (err) {
                    if(err){return next(err);}
                    //delete all pages related to this project.
                    //simply findandremove pages with a project id matching removed project
                    Page.remove({project:project._id})
                        .exec(function (err) {
                            if(err){return next(err);}
                            //remove all files?? only if they have their own schema
                            //however we will have to remove them from the filesystem anyway using their paths.
                            res.json(project);
                        });
                });
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
        var respStr = 'The project is now';
        respStr = respStr + (project.archived ? 'Archived' : 'Active');
        res.json(respStr);
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
                console.log('a project is now pinneed: ' + req.body.isPinned);
                res.json('bookmark changed successfully!');
            })
        });
});


/* GET all pages in a project */
/* POST a new page in a project */

//get all the current pages in a project or
//post a new page
router.route('/projects/:project_id/pages')
    .get(function(req,res){
        res.json(req.project.pages);
    })
    .post(function(req,res,next){

        var page = new Page(req.body);
        page.project = req.project._id;
        page.createdBy = req.project.createdBy;
        page.save(function(err,page){
            if(err){return next(err);}
            //change this to with id key. like comments in thinkster
            req.project.pages.push({_id: page._id});

            req.project.save(function(err){
                if(err){return next(err);}
                console.log('page', page);
                res.json(page);
            });
        });
    });

/* GET    a single page in a project */
/* UPDATE a single page in a project*/
/* DELETE a single page in a project*/

//GET the current page in the url
router.param('page_id', function (req, res, next, id) {
    Page.findById(id).populate('comments').exec(function (err, page) {
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
    .get(function (req, res) {
        res.json(req.page);
    })
    .delete(function (req, res, next) {
        req.page.remove(function (err, page) {
            if (err) {
                return next(err);
            }
            req.project.pages.pull(page);
            req.project.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.json(page);
            });
        });
    })
    .put(function (req, res) {
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
        });
    });

router.put('/projects/:project_id/pages/:page_id/complete', auth, function (req, res) {
    req.page.completed = req.body.isComplete;
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
router.post('/projects/:project_id/files', auth, upload.single('file'), function (req, res) {

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
router.delete('/projects/:project_id/files/:filename', auth, function () {
    //delete from array in project schema
    req.project.removeFile(req.params.filename, function (err) {
        if (err) {
            return next(err);
        }
        //fs.unlink delete from folder
    });
});
