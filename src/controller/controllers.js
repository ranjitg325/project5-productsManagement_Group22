const collegeModel = require("../models/collegeModel.js")
const internModel = require ("../models/internModel")
const emailValidator = require('validator')
const createCollege= async function(req, res){
try{
let data = req.body;

if(Object.entries(data).length==0){
    res.status(400).send({ status: false , msg: "please pass some data above"})
}

else{
    let name = req.body.name
    if(!name)
    return res.status(400).send({status : false, msg : "enter valid name"})

    let fullName= req.body.fullName
    if(!fullName)
    return res.status(400).send({ status : false, msg : " please enter full name"})

    let logoLink = req.body.logoLink
    if(!logoLink)
    return res.status(400).send({ status: false, msg : "please provide logoLink"})

    let shortname = await collegeModel.findOne({name})
    if (shortname) {
        return res.status(401).send({ status : false, msg :"enter unique name"})
    }
    let savedData = await collegeModel.create(data);
    res.status(201).send({ status : true, msg : savedData});
}
}
// if(Object.keys(data).length != 0){
// let savedData = await collegeModel.create(data);
// res.status(201).send({ msg : savedData});
// }

// else res.status(400).send({ msg : "Bad request"})
// }

catch(error){
 console.log(error)
 return res.status(500).send({ status : false, msg : error.message })
}
};

//2nd api

const createIntern = async function(req,res){
try{
    let data= req.body
    const {email} = req.body
    if(Object.entries(data).length==0){
        res.status(400).send({ status: false , msg: "please pass some data above"})
    }
    const isValidEmail = emailValidator.isEmail(email)
    if (!isValidEmail){
        return res.status(400).send({ status: false , msg : " invalid email"})
    }
    else{
    let collegeId = req.body.collegeId
    let college = await collegeModel.findById(collegeId)
    if(!college) {
        return res.status(401).send({ status: false , msg : "no such collegeId is present, please recheck Id"})
    }
 
    let name2 = req.body.name
    if(!name2) 
    return res.status(400).send({ status : false, msg : "please provide name"})

    let email= req.body.email
    if (!email)
    return res.status(400).send({ status : false , msg : "provide email"})

    let mobile = req.body.mobile
    if (!mobile)
    return res.status(400).send({ status : false, msg : "please provide a number"})

    if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(mobile))) {
        res.status(400).send({status : false , msg : " enter valid no."})
        return
    }

    let validemail = await internModel.findOne({email})
    if (validemail) {
        return res.status(401).send({ status : false, msg :"email id is already exist"})
    }
        let validnumber = await internModel.findOne({mobile})
    if (validnumber) {
        return res.status(401).send({ status : false, msg :"mobile number is already exist"})
  }

    let savedData= await internModel.create(data)
    return res.status(201).send({ status : true, data : savedData})

}
}
catch(error){
    console.log(error)
    return res.status(500).send({ status : false, msg : error.message })
   }
   };

//3rd api

const collegeDetail = async function (req, res) {
    try{
        const collegeName = req.query.collegeName
     
        if(!collegeName){return res.status(400).send({status:false, msg:"BAD REQUEST please provied valid collegeName"})}
        const college =await collegeModel.find({ name:collegeName, isDeleted: false })
        if (!college) {
           return res.status(404).send({ status: false, msg: "BAD REQUEST  college not found" })
         }
          console.log(college)
         const collegeId = college[0]._id
        
         
           const interName = await internModel.find({collegeId: collegeId, isDeleted : false})
           if(interName.length == 0) 
           return res.status(404).send({msg: `No intern apply for this college, data : ${college} `})
           
           const interns =[]
            
           for (let i=0; i<interName.length;i++)
           {
               let Object={}
               Object._id = interName[i]._id
               Object.name=interName[i].name
               Object.email = interName[i].email
               Object.mobile=interName[i].mobile
               interns.push(Object)
           }
     
           const ObjectData = {
               name:college[0].name,
               fullName:college[0].fullName,
               logoLink:college[0].logoLink,
               interests:interns
           }
           
         return res.status(201).send({ status: true, count : interns.length, msg:ObjectData })
     
     
     }
     catch (err) {
       return res.status(500).send({ status: false, msg: err.message })
     }
     }
 



module.exports.createCollege=createCollege
module.exports.createIntern=createIntern
module.exports.collegeDetail=collegeDetail