var express   = require('express');
var router    = express.Router();

var multer = require('multer');
var upload = multer({
    dest: 'public/images',
    limits: {fileSize: 5000000}
});

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
        console.log('projects.get');
        console.log(req.payload);

        User.findById(req.payload._id,'projects')
            .exec(function(err,user){
                if(err) {return next(err);}
                res.json(user.projects);
            });
    })
    //add new project, also updating user
    .post(auth, upload.single('file'), function (req, res, next) {

        var project = new Project(req.body);
        project.createdBy = req.payload._id;
        if (req.file) {
            project.projectIcon = req.file.filename;
        }

        project.save(function(err,project){
            if(err){return next(err);}
            User.findByIdAndUpdate(req.payload._id,{ $push:{projects:{title:project.title,_id:project._id}} },{upsert: true,new:true})
                .exec(function (err) {
                    if(err){ return next(err); }
                    res.json({project: req.body, file: req.file.filename});
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
                , {new: true}).exec(function (err) {
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
            req.project.pages.push({title:req.body.title,_id:page._id});
            req.project.save(function(err){
                if(err){return next(err);}
                res.json(page);
            });
        });
    });


/* GET    a single page in a project */
/* UPDATE a single page in a project*/
/* DELETE a single page in a project*/

//get the current page in the url
router.param('page_id', function (req, res, next) {
    //Page.findById(id).
    //exec(function(err,page){
    //    if (err) { return next(err); }
    //    if (!page) { return next(new Error('can\'t find page')); }
    //    req.page = page;
    //    return next();
    //});
});
router.route('/projects/:project_id/pages/:page_id')
    .get(function (req, res) {
        res.json(req.page);
    })
    .put(function (req, res) {
        res.json('coming soon');
    })
    .delete(function (req, res, next) {
        //req.page.remove(function(err,page){
        //    if(err){return next(err);}
        //    req.project.pages.pull({_id:page._id});
        //    req.project.save(function(err){
        //        if(err){return next(err);}
        //        res.json(page);
        //    });
        //});
    });

