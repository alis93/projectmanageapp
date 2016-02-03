/**
 * Created by sulmanali on 02/02/2016.
 */

var mongoose = require('mongoose');

var PageSchema = new mongoose.Schema({
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Project:{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    title:{type:String},
    description:{type:String},
    startDate:{type: Date},
    endDate:{type: Date},
    reminderDate:{type: Date}
},{timestamps: true});

mongoose.model('Page',PageSchema);