/**
 * Created by sulmanali on 02/02/2016.
 */

var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        projectIcon: {type: String, default: 'default_folder.png'},
    title:{type:String},
    description:{type:String},
        //startDate:{type: Date}, should i get rid of this?
    endDate:{type: Date},
        moreInfo: [{
            label: {type: String},
            value: {type: String}
        }],
    pages:[{
        title:String,
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page' }
    }],
        archived: {type: Boolean, default: false}
//projectIcon        //able to set an icon for the project. allows customisability and used for when project is pinned
//    difficultyTags[{}], //used for tags when predicting how long will take to complete
//    team:{},           //other users on the project
//    files:{},          //files in this project---this will hold a reference to the file path
},{timestamps: true}
);

ProjectSchema.methods.updateProjectDetails = function(projectDetails,cb){
    this.title = projectDetails.title;
    this.description = projectDetails.description;
    this.title = projectDetails.endDate;
    this.endDate = projectDetails.endDate;
    this.moreInfo = projectdetails.moreInfo;
    this.save(cb);
};

ProjectSchema.methods.archiveProject = function (cb) {
    this.archived = true;
    this.save(cb);
};



mongoose.model('Project',ProjectSchema);