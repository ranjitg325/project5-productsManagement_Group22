const mongoose = require('mongoose');


const productModel = new mongoose.Schema ({

title : {
    type : String,
    required : true,
    unique: true,
    trim : true
},
description : {
    type : String,
    required : true,
    trim : true
},
price:{
    type : Number,
    required : true,
    trim : true
    //valid no./decimal
},
currencyId : {
    type : String,
    required : true,
    //default : "INR",
    trim : true
    //inr
},
currencyFormat : {
    type : String,
    required : true,

    trim : true
    //rs symbol
},
isFreeShipping: {
    type : Boolean,
    default : false
   
    
},
productImage : {
    type : String,
    required : true,
    trim : true
    //s3 link
},

style : {
    type : String,
    //required : true,
    trim : true
    
},
availableSizes: {
    type : [String],
    required : true,
    //enum : ["S", "XS","M","X", "L","XXL", "XL"]
},
installments:{
    type : Number
},

isDeleted: {
    type : Boolean,
    default : false,
},
deletedAt: {
    type: Date 
},

}, { timestamps: true });


module.exports = mongoose.model('project5product', productModel)
