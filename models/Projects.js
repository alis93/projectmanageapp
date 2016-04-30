/**
 * Created by sulmanali on 02/02/2016.
 */

var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        projectIcon: {type: String, default: '/images/default_folder.svg'},
    title:{type:String},
    description:{type:String},
    endDate:{type: Date},
        moreInfo: [{
            "label": {type: String},
            "value": {type: String}
    }],
        pages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Page'}],
        archived: {type: Boolean, default: false},
        team: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}], //other users on the project
        pendingEmails: [{type: String}], //other users on the project
        files: [{
            fileId: {type: String},
            filename: {type: String},
            path: {type: String},
            uploadedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            uploadDate: {type: Date}
        }],
        updates: [{
            urlString: {type: String},
            updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            update: {type: String},
            date: {type: Date, default: Date.now()}
        }]
},{timestamps: true}
);


ProjectSchema.methods.updateProjectDetails = function(projectDetails,cb){
    this.title = projectDetails.title;
    this.description = projectDetails.description;
    this.endDate = Date.parse(projectDetails.endDate) || null;
    this.moreInfo = projectDetails.moreInfo;
    this.projectIcon = projectDetails.projectIcon;
    this.save(cb);
};

ProjectSchema.methods.setProjectArchived = function (archive, cb) {
    this.archived = archive;
    this.save(cb);
};

ProjectSchema.methods.removeFile = function (filename, cb) {
    //remove file from array code
    //look at pinned projects?
    this.save(cb);
};

mongoose.model('Project',ProjectSchema);