const mongoose = require('mongoose');
const productModel = require ("../models/productModel.js")
const aws = require('../aws/aws')
const currencySymbol = require("currency-symbol-map")


const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0; 
};
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false 
    if (typeof value === 'string' && value.trim().length === 0) return false 
    return true;
};

const productCreate = async function (req, res) {
    try {
        let data = req.body;
        let productImage = req.files;

        if (Object.keys(req.body).length == 0){
            return res.status(400).send({ status: false, message: "please pass some data in body " })
            }

            let title = req.body.title
            if (!title){
            return res.status(400).send({ status: false, msg: " title is required" })
            }
            let validtitle = await productModel.findOne({ title })
            if (validtitle) {
                return res.status(401).send({ status: false, msg: "title is already exist" })
            }

            let description = req.body.description
            if (!description){
            return res.status(400).send({ status: false, msg: " description is required" })
            }

            let price = req.body.price
            if (!price){
            return res.status(400).send({ status: false, msg: " price is required" })
            }
            
            if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
                return res.status(400).send({ status: false, message: "Enter valid price" })
            }

            let currencyId = req.body.currencyId
            if (!currencyId){
            return res.status(400).send({ status: false, msg: " currencyId type is required in INR form" })
            }

            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "currencyId should be INR" })
            }

            

            let currencyFormat = req.body.currencyFormat
            if (!currencyFormat){
            return res.status(400).send({ status: false, msg: " currencyFormat is required" })
            }
            if (currencyFormat != "INR") {
                return res.status(400).send({ status: false, message: "please write INR in currencyFormat for getting the ₹ symbol" })
            }
            currencyFormat = currencySymbol('INR')
            
            let isFreeShipping = req.body.isFreeShipping
            if(!((isFreeShipping === "true" ||  isFreeShipping=== "false" ))){
                return res.status(400).send({status : false, message: "isFreeShipping must be true or false value"})
            }
        
            
            if (productImage && productImage.length > 0) {
            productImage = await aws.uploadFile(productImage[0]);
          
            }
            else {
                return res.status(400).send({ status: false, message: "productImage is required" })
            }

            let style = req.body.style

             let availableSizes = req.body.availableSizes
            if (!availableSizes){
            return res.status(400).send({ status: false, msg: " Size is required" })
            }


            if (availableSizes) {
                let sizesArray = availableSizes.split(",").map(x => x.trim())
    
                for (let i = 0; i < sizesArray.length; i++) {
                    if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i]))) {
                        return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" })
                    }
                }
    
                //using array.isArray function to check the value is array or not.
                if (Array.isArray(sizesArray)) {
                    data['availableSizes'] = sizesArray
                }
        
            }
            let installments = req.body.installments //QUANTITY
            if (isNaN(installments)){
                return res.status(400).send({status:false, message:"installement should be in no. only"})
            }

            if(!isValid(installments))
            {
                return res.status(400).send({status:false, message:"installments should present"})
            }

            if (isNaN(installments)){
                return res.status(400).send({status:false, message:"installement should be in no. only"})
            }

            if (installments <= 0 || installments % 1 != 0) {
                return res.status(400).send({ status: false, message: "installments can not be a decimal number" })
            }

            let isDeleted = req.body.isDeleted
            let deletedAt = req.body.deletedAt

            let finalData = { title, description, price, currencyId, currencyFormat,isFreeShipping, productImage,style, availableSizes,installments,isDeleted,deletedAt };
        const userData = await productModel.create(finalData);
        res.status(201).send({ status: true, data: userData });
        }
        catch (error) {
            console.log(error)
            return res.status(500).send({ status: false, msg: error.message })
        }

    }
    module.exports.productCreate = productCreate


    //2nd api get by id

     let getProductsByfilter = async function (req, res) {
        
            try {
                const filterQuery = { isDeleted: false } //complete object details.
                const queryParams = req.query;
        
                if (isValidRequestBody(queryParams)) {
                    const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;
        
                    //validation starts.
                    if (isValid(size)) {
                        filterQuery['availableSizes'] = size
                    }
        
                    //using $regex to match the subString of the names of products & "i" for case insensitive.
                    if (isValid(name)) {
                        filterQuery['title'] = {}
                        filterQuery['title']['$regex'] = name
                        filterQuery['title']['$options'] = 'i'
                    }
        
                    //setting price for ranging the product's price to fetch them.
                    if (isValid(priceGreaterThan)) {
        
                        if (!(!isNaN(Number(priceGreaterThan)))) {
                            return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                        }
                        if (priceGreaterThan <= 0) {
                            return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                        }
                        if (!filterQuery.hasOwnProperty('price'))
                            filterQuery['price'] = {}
                        filterQuery['price']['$gte'] = Number(priceGreaterThan)
                        //console.log(typeof Number(priceGreaterThan))
                    }
        
                    //setting price for ranging the product's price to fetch them.
                    if (isValid(priceLessThan)) {
        
                        if (!(!isNaN(Number(priceLessThan)))) {
                            return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                        }
                        if (priceLessThan <= 0) {
                            return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                        }
                        if (!filterQuery.hasOwnProperty('price'))
                            filterQuery['price'] = {}
                        filterQuery['price']['$lte'] = Number(priceLessThan)
        
                    }
        
                    //sorting the products acc. to prices => 1 for ascending & -1 for descending.
                    if (isValid(priceSort)) {
        
                        if (!((priceSort == 1) || (priceSort == -1))) {
                            return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
                        }
        
                        const products = await productModel.find(filterQuery).sort({ price: priceSort })
        
                        if (Array.isArray(products) && products.length === 0) {
                            return res.status(404).send({ productStatus: false, message: 'No Product found' })
                        }
        
                        return res.status(200).send({ status: true, message: 'Product list', data2: products })
                    }
                }
        
                const products = await productModel.find(filterQuery)
        
                //verifying is it an array and having some data in that array.
                if (Array.isArray(products) && products.length === 0) {
                    return res.status(404).send({ productStatus: false, message: 'No Product found' })
                }
        
                return res.status(200).send({ status: true, message: 'Product list', data: products })
            } catch (error) {
                return res.status(500).send({ status: false, error: error.message });
            }
        };
    module.exports.getProductsByfilter = getProductsByfilter

    //3rd api get by id
    
    const getproductsById=async function(req,res){

    try {
        let productId=req.params.productId
        if(!isValidObjectId(productId)){
            return res.status(400).send({status:false,msg:"product id is not valid"})
        }
        const getproducts=await productModel.findById({_id:productId})
        if(!getproducts){
            return res.status(404).send({status:false,msg:"this product are not avilable"})
        }
        if(getproducts.isDeleted==true){
            return res.status(200).send({status:true,msg:"product is already deleted"})
        }
        return res.status(400).send({status:false,msg:"data",data:getproducts})

        
    } catch (error) {
        return res.status(500).send({status:false,msg:error.message})
        
    }
}

module.exports.getproductsById = getproductsById


//4th api update by id

const updatedProductById=async function(req,res){
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }
       
        const findProduct = await productModel.findById(productId)

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is already deleted" });
        }

      

        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "please provide details to update." });
        }

        let { title, description, price, currencyId,
            productImage, style, availableSizes, installments } = req.body

        const dataToUpdate = {}

       
            if(!isValid(title)){
                return res.status(400).send({status:false, message:"A valid title should present"})
            }


            const isDuplicateTitle = await productModel.findOne({title});
            if (isDuplicateTitle) {
                return res.status(400).send({status: false,msg: "title already exists.",})
            }

            dataToUpdate['title'] = title
        
        
       
            if(!isValid(description)){
                return res.status(400).send({status:false, message:" valid description should present"})
            }
            dataToUpdate['description'] = description
      

            if(!isValid(price)){
                return res.status(400).send({status:false, message:"A valid product price should present"})
            }
            if ((isNaN(Number(price)))) {
                return res.status(400).send({ status: false, message: 'Price should be a valid number' })
            }

            if (price <= 0) {
                return res.status(400).send({ status: false, message: 'Price can not be zero or less than zero.' })
            }

            dataToUpdate['price'] = price
      
            if(!isValid(currencyId)){
                return res.status(400).send({status:false, message:"A valid currrency Id should present ,Pls write INR"})
            }
            if (!(currencyId == "INR")) {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }

            dataToUpdate['currencyId'] = currencyId
       

        productImage = req.files;
        if(productImage){
            if (productImage && productImage.length > 0) {
                productImage = await aws.uploadFile(productImage[0]);
            dataToUpdate['productImage'] = productImage
        }}

      
            if(!isValid(style)){
                return res.status(400).send({status:false, message:"Style should present"})
            }
            dataToUpdate['style'] = style
       

        if (availableSizes) {
            let sizesArray = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < sizesArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i]))) {
                    return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" })
                }
            }
        }
            dataToUpdate['availableSizes'] = availableSizes
    

          if(!isValid(installments)){
                return res.status(400).send({status:false, message:"installments should present"})
            }

            if (isNaN(installments)){
                return res.status(400).send({status:false, message:"installement should be in no. only"})
            }

            if (installments <= 0 || installments % 1 != 0) {
                return res.status(400).send({ status: false, message: "installments can not be a decimal number" })
            }
            
            dataToUpdate['installments'] = installments
        

        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: productId }, dataToUpdate, {new: true} );

        res.status(200).send({status: true,msg: "product details updated successfully",data: updatedProduct});
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.updatedProductById = updatedProductById

//5th api delete by id

const deleteproductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "need valid productid in the params" })
        }
        const productwithId = await productModel.findById({ _id: productId })
        if (!productwithId) {
            return res.status(404).send({ status: false, msg: "not able to found" })
        }
        if (productwithId.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "product already deleted" })
        }

        const productdelete = await productModel.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true, msg: "deleted sucessfully", data: productdelete })

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }

}

module.exports.deleteproductById = deleteproductById
