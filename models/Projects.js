/**
 * Created by sulmanali on 02/02/2016.
 */

var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title:{type:String},
    description:{type:String},
    startDate:{type: Date},
    endDate:{type: Date},
    pages:[{
        title:String,
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page' }
    }]
//    team:{},
//    files:{},
},{timestamps: true}
);

ProjectSchema.methods.updateProjectDetails = function(projectDetails,cb){
    if(projectDetails.title){this.title = projectDetails.title;}
    if(projectDetails.description){this.description = projectDetails.description;}
    if(projectDetails.startDate){this.title = projectDetails.startDate;}
    if(projectDetails.endDate){this.title = projectDetails.endDate;}
    this.save(cb);
};


mongoose.model('Project',ProjectSchema);