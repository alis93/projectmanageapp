var express   = require('express');
var router    = express.Router();

var jwt       = require('express-jwt');
var passport  = require('passport');
var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Project   = mongoose.model('Project');
var Page      = mongoose.model('Page');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

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
    .get(function(req,res,next){
        Project.find(function(err,projects){
            if(err) {return next(err);}
            res.json(projects);
        });
    })
    .post(function(req,res,next){
        project.save(function(err,project){
            if(err){return next(err);}
            res.json(project);
        });
    });


router.param('project_id',function(req,res,next,id){
    Project.findById(id).
    exec(function(err,project){
        if (err) { return next(err); }
        if (!project) { return next(new Error('can\'t find project')); }

        req.project = project;
        return next();
    });
});


router.route('/projects/:project_id')
    .get(function(req,res){
        res.json(req.project);
    })
    .put(function(req,res,next){

        req.project.updateProjectDetails(req.projectDetails,function(err,project){
            if(err){return next(err);}
            res.json(project);
        });


        //Project.findByIdAndUpdate(req.params.project_id,req.body)
        //    .exec(function(err,project){
        //        if(err){return next(err);}
        //        if(!project){return next(new Error('Can\'t find Project'));}
        //        res.json(project);
        //    });
    })
    .delete(function(req,res,next){
        Project.findByIdAndRemove(req.params.project_id)
            .exec(function(err,project){
                if(err){return next(err);}
                if(!project){return next(new Error('Can\'t find Project'));}
                res.json(project);
            });
    });

router.route('/projects/:project_id/pages')
    .all()
    .post(function(req,res,next){

    })
    .get(function(req,res,next){

    });



module.exports = router;



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