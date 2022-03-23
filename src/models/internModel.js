const mongoose = require('mongoose');
const validator = require("validator")
const ObjectId = mongoose.Schema.Types.ObjectId
const internmodel = new mongoose.Schema( {

name : {
    type : String,
    required : true
},

email: {
    required:true,
    unique:true,
    type:String,
    // validate: {
    //     validator: validator.isEmail,
    //     message: '{VALUE} is not a valid email',
    //     isAsync: false
    // }
},

mobile : {
    required : true,
    type : Number,
    unique : true,
    match : [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, 'please provide valid movile number'],
    // validate: {
    //     validator: function(v) {
    //         return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
    //     },
    //     message: '{VALUE} is not a valid 10 digit number!'
    // }
},
collegeId : {
    type : ObjectId,
    ref : " collegeModel"
},
isDeleted :{
    type : Boolean,
    default : false
}
}, { timestamps: true });

module.exports = mongoose.model('project2intern', internmodel)