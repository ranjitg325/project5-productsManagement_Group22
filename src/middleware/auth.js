const jwt = require("jsonwebtoken")

const authentication = function (req, res, next) {
    try {
        const token = req.header("Authorization")
        if (!token){
            return res.status(403).send({ status: false, msg: "Token is required in Header" })
        }
            const token1 = token.split(" ")
        const decodedToken = jwt.verify(token1[1], "project5")
       if (!decodedToken){
           res.status(403).send({status:false,msg:"invalid token present"})
           return
       }
       //authorisation
       req.headers.userid = decodedToken.userId;
       next()
    }catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports.authentication=authentication