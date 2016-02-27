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
    pages:[{
            type: mongoose.Schema.Types.ObjectId,
        ref: 'Page'
    }],
        archived: {type: Boolean, default: false},
//    difficultyTags[{}], //used for tags when predicting how long will take to complete
//    team:{},           //other users on the project
        files: [{
            fileId: {type: String},
            filename: {type: String},
            path: {type: String},
            uploadedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            uploadDate: {type: Date}
        }]
},{timestamps: true}
);


ProjectSchema.methods.updateProjectDetails = function(projectDetails,cb){
    this.title = projectDetails.title;
    this.description = projectDetails.description;
    this.endDate = projectDetails.endDate;
    this.moreInfo = projectDetails.moreInfo;
    this.projectIcon = projectDetails.projectIcon || '/images/default_folder.svg';
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
}

mongoose.model('Project',ProjectSchema);