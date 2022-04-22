const mongoose = require('mongoose');
const userModel = require("../models/userModel.js")
const jwt = require("jsonwebtoken")
const emailValidator = require('validator')
const aws = require('../aws/aws')
const bcrypt = require('bcrypt')
//const saltRounds = 10

const isValidvalue = function (value) {
    return mongoose.Types.ObjectId.isValid(value)
}


const userCreate = async function (req, res) {
    try {
        let data = req.body;
        const { email } = req.body
        let profileImage = req.files;

        if (Object.keys(req.body).length == 0){
        return res.status(400).send({ status: false, message: "please pass some data in body " })
        }
      
            let fname = req.body.fname
            if (!fname){
            return res.status(400).send({ status: false, msg: " first name is required" })
            }
            let lname = req.body.lname
            if (!lname){
            return res.status(400).send({ status: false, msg: " last name is required" })
            }
            if(!email){
                return res.status(400).send({ status: false, msg: " email is required" })
            }
        
            let validemail = await userModel.findOne({ email })
            if (validemail) {
                return res.status(400).send({ status: false, msg: "email id is already exist" })
            }
        
            const isValidEmail = emailValidator.isEmail(email)
            if (!isValidEmail) {
                 return res.status(400).send({ status: false, msg: " invalid email" })
            }

            if (profileImage && profileImage.length > 0) {
                profileImage = await aws.uploadFile(profileImage[0]);
                }
                else {
                    return res.status(400).send({ status: false, message: "profileImage is required" })
                }

            let phone = req.body.phone
            if (!phone){
                return res.status(400).send({ status: false, msg: "Phone no is required" })
            }
            
            let validphone = await userModel.findOne({ phone })
            if (validphone) {
                return res.status(401).send({ status: false, msg: "phone no. is already exist" })
            }
            if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
                return res.status(400).send({ status: false, msg: " enter valid  phone no." })
            }

            let password = req.body.password
            if (!password){
                return res.status(400).send({ status: false, msg: "Password is required" })
            }  
        
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }
    

            const salt = await bcrypt.genSalt(10);      
         password = await bcrypt.hash(password, salt)    

      

            let address = req.body.address
            if (!address){
                return res.status(400).send({ status: false, msg: "address is required" })
            }
            
            if(address.shipping){
                if(!(address["shipping"]["street"])){
                    return res.status(400).send({ status: false, messege: "please provide street for shipping." })
                }
                else if (!(address["shipping"]["city"])){
                        return res.status(400).send({ status: false, messege: "please provide city for shipping." })
                    }
                    else if (!(address["shipping"]["pincode"])){
                        return res.status(400).send({ status: false, messege: "please provide pincode for shipping." })
                    }
                    if (address["shipping"]["pincode"].length != 6){
                        return res.status(400).send({status:false, message:"please provide valid pincode in shipping"})
                    }
                    if (isNaN(address["shipping"]["pincode"])){
                        return res.status(400).send({status:false, message:"pincode should be in numbers only in shipping"})
                    }
                    
            }
            else{
                return res.status(400).send({status:false, msg:"please provide shipping details."})
            }

            if(address.billing){
                if(!(address["billing"]["street"])){
                    return res.status(400).send({ status: false, messege: "please provide street for billing." })
                }
                else if (!(address["billing"]["city"])){
                        return res.status(400).send({ status: false, messege: "please provide city for billing." })
                    }
                    else if (!(address["billing"]["pincode"])){
                        return res.status(400).send({ status: false, messege: "please provide pincode for billing." })
                    }
                    if (address["billing"]["pincode"].length != 6){
                        return res.status(400).send({status:false, message:"please provide valid pincode in billing"})
                    }
                    if (isNaN(address["billing"]["pincode"])){
                        return res.status(400).send({status:false, message:"pincode should be in numbers only in billing"})
                    }
                   
            }
            else{
                return res.status(400).send({status:false, msg:"please provide billing details."})
            }
        
         

        let finalData = { fname, lname, email, password, profileImage, phone, address };
        const userData = await userModel.create(finalData);
        res.status(201).send({ status: true, data: userData });
         }
        
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
        }
 module.exports.userCreate = userCreate


 const userLogin = async function(req,res){
    try{
         let data =req.body;
         if(Object.keys(data).length==0){
             res.status(400).send({status:false,msg:"kindly pass Some Data"})
         }
         let username = req.body.email;
         let password = req.body.password;

         if(!username){
            return res.status(400).send({ status: false, msg: " Email is required" })
        }

        const isValidEmail = emailValidator.isEmail(username)
        if (!isValidEmail) {
         return res.status(400).send({ status: false, msg: " invalid email" })
    }

    const findUser = await userModel.findOne({ email: username });

    if (!findUser) {
      return res.status(401).send({ status: false, message: `Login failed! email is incorrect.` });
    }

         if (!password){
        return res.status(400).send({ status: false, msg: "Password is required" })
         }

         let encryptedPassword = findUser.password;

         const decryptpassword = await bcrypt.compare(password, encryptedPassword);
     
         if (!decryptpassword) {
           return res.status(401).send({ status: false, message: `Login failed! password is incorrect.` });
         }
         
         
         let token = jwt.sign({
              userId: findUser._id,
             
              
            },"project5" ,{expiresIn:"1800s"},
            
            
            );
            res.setHeader("Authorization",token);
          res.status(201).send({status: true,msg:'success', data: {userId: findUser._id, token}})

    }
    catch (err) {
       res.status(500).send({ Error: err.message })
    }
}


module.exports.userLogin = userLogin

const getuserdetail = async function (req, res) { 
    try {
        let userId = req.params.userId;
        let userIdFromToken = req.headers.userid;
     let userIdFromParams= req.params.userId

        if (!isValidvalue(userId)) {

            res.status(400).send( { status : false , message : `${userId} is Not a Valid user id` } )
            return
         }
         
         if (userIdFromToken != userIdFromParams) {
            return res.status(403).send({
            status: false,
          message: "Unauthorized access.",
            });
      }
        
        let profile=await userModel.findOne({ _id: userId,isDeleted:false })
    
         if (!profile) {
             return res.status(404).send({ status: false, msg: "No profile found" })
         }
       
         return res.status(200).send({ status: true,message:'User profile details', data:profile })
     }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getuserdetail = getuserdetail

const profileUpdate = async function (req, res) {
    try {
        const { email } = req.body
     const userId = req.params.userId
     let userIdFromToken = req.headers.userid;
     let userIdFromParams= req.params.userId
     

    if(!email){
        return res.status(400).send({ status: false, msg: " email is required" })
    }

    let validemail = await userModel.findOne({ email })
    if (validemail) {
        return res.status(400).send({ status: false, msg: "email id is already exist" })
    }

    const isValidEmail = emailValidator.isEmail(email)
    if (!isValidEmail) {
         return res.status(400).send({ status: false, msg: " invalid email" })
    }

    let phone = req.body.phone
    if (!phone){
        return res.status(400).send({ status: false, msg: "Phone no is required" })
    }
    
    let validphone = await userModel.findOne({ phone })
    if (validphone) {
        return res.status(401).send({ status: false, msg: "phone no. is already exist" })
    }
    if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
        return res.status(400).send({ status: false, msg: " enter valid  phone no." })
    }

     if (!isValidvalue(userId)) {
        res.status(400).send( { status : false , message : `${userId} is Not a Valid user id` } )
        return
     }

    if (!isValidvalue(userIdFromToken)) {
        res.status(400).send( { status : false , message : `${userIdFromToken} is Not a Valid token id` } )
        return
    }
     const user1 = await userModel.findOne( { _id: userId, isDeleted: false } )

    if(!user1) {
        res.status(404).send({ status : false , message : "user Not Found" } )
        return
    }
    
    if (userIdFromToken != userIdFromParams) {
        return res.status(403).send({
        status: false,
      message: "Unauthorized access.",
        });
  }
    
    let userData = req.body
    if (Object.keys(userData).length == 0) {
        return res.status(400).send({ status: false, msg: "Please provide some data" })
    }

  
    let updateduser = await userModel.findOneAndUpdate({ _id: userId },userData, { new: true })
    res.status(200).send({ status: true, message: 'success', data: updateduser });

}
catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error.message })
}
}

module.exports.profileUpdate = profileUpdate