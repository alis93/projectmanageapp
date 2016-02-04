var express   = require('express');
var router    = express.Router();

var jwt       = require('express-jwt');
var passport  = require('passport');
var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Project   = mongoose.model('Project');
var Page      = mongoose.model('Page');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

module.exports = router;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

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

router.route('/projects')
    //get all projects belonging to the current user
    .get(auth,function(req,res,next){

        User.findById(req.payload._id)
            .exec(function(err,user){
                if(err) {return next(err);}
                res.json(user.projects);
            });
    })
    //add new project, also updating user
    .post(auth,function(req,res,next){

        var project = new Project(req.body);
        project.createdBy = req.payload._id;

        project.save(function(err,project){
            if(err){return next(err);}
            User.findByIdAndUpdate(req.payload._id,{ $push:{projects:{title:project.title,_id:project._id}} },{upsert: true,new:true})
                .exec(function(err,user){
                    if(err){ return next(err); }
                    res.json(project);
            });
        });
    });
//delete single/multiple projects using one of two methods below either put or delete research which to use
//.delete ---get an array of project ids in req and delete them? for deleting multiple projects at once from the projects page?
//.put to get an array of project ids in req and remove from db?


//get the current project in the url
router.param('project_id',function(req,res,next,id){
    Project.findById(id).
    exec(function(err,project){
        if (err) { return next(err); }
        if (!project) { return next(new Error('can\'t find project')); }
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
    .put(auth,function(req,res,next){
        req.project.updateProjectDetails(req.body,function(err,project){
            if(err){return next(err);}
            User.findOneAndUpdate({
                _id:project.createdBy,"projects._id":project._id}
                ,{'projects.$.title' : project.title}
                ,{new: true}).exec(function(err,user){
                    if(err){return next(err);}
                    res.json(project);
            });
        });
    })
    //delete a specific project
    .delete(function(req,res,next){
        req.project.remove(function(err,project){
            if(err){return next(err);}
            User.findOneAndUpdate({_id:project.createdBy},
                {$pull:{projects:{ _id:project._id }} },
                {new: true})
                .exec(function(err,user){
                    if(err){return next(err);}
                    res.json(project);
                });
        });
    });



//get all the current pages in a project or
//post a new page
router.route('/projects/:project_id/pages')
    .post(function(req,res,next){

    })
    .get(function(req,res,next){

    });


//get the current page in the url
router.param('page_id',function(req,res,next){});





//router.get('/projects',function(req,res,next){
//
//    console.log("/projects");
//
//    Project.find(function(err,projects){
//        if(err) {return next(err);}
//        res.json(projects);
//    });
//});

//router.post('/projects',function(req,res,next){
//    var project = new Project(req.body);
//
//    project.save(function(err,project){
//        if(err){return next(err);}
//        res.json(project);
//
//    });
//});


//router.param('project',function(req,res,next,id){
//    console.log("project param");
//    console.log(id);
//
//    var query = Project.findById(id);
//
//    query.exec(function(err,project){
//        if(err){return next(err);}
//
//        if(!project){return next(new Error('Can\'t find Project'));}
//        req.project = project;
//        return next();
//    });
//});
//
//router.get('/projects/:project',function(req,res){
//    console.log("projects/project");
//    res.json(req.project);
//});
//
//router.put('projects/:project',function(req,res){
//
//});