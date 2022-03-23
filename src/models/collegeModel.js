const mongoose = require('mongoose');


const collegeModel = new mongoose.Schema( {

name : {
    type : String,
    required : true,
    unique : true,
    lowercase : true
},
fullName : {
    type : String,
    required : true
},
logoLink : {
    type : String,
    url : String,
    required : true
},
isDeleted : {
    type : Boolean,
    default : false
}
}, { timestamps: true })


module.exports = mongoose.model('project2college', collegeModel)
