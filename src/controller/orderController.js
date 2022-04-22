const mongoose = require('mongoose')
const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

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


const orderCreation = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;
        let userIdFromToken = req.headers.userid;
        let userIdFromParams= req.params.userId

        //validation for request body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: "Invalid request body. Please provide the the input to proceed."});
        }
        //Extract parameters
        const { cartId, cancellable, status } = requestBody;

        //validating userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }

        const searchUser = await userModel.findOne({ _id: userId });
        if (!searchUser) {
            return res.status(400).send({status: false, message: `user doesn't exists for ${userId}`});
        }
        //Authentication & authorization
        if (userIdFromToken != userIdFromParams) {
            return res.status(403).send({
            status: false,
          message: "Unauthorized access.",
            });
      }
        if (!cartId) {
            return res.status(400).send({status: false, message: `Cart doesn't exists for ${userId}`});
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({status: false, message: `Invalid cartId in request body.`});
        }

        //searching cart to match the cart by userId whose is to be ordered.
        const searchCartDetails = await cartModel.findOne({_id: cartId, userId: userId});
        if (!searchCartDetails) {
            return res.status(400).send({status: false,message: `Cart doesn't belongs to ${userId}`});
        }

        //must be a boolean value.
        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({status: false,message: `Cancellable must be either 'true' or 'false'.`})}
        }

        // must be either - pending , completed or cancelled.
        if (status) {
            if (!isValidStatus(status)) {
                return res.status(400).send({status: false,message: `Status must be among ['pending','completed','cancelled'].`})}
        }

        //verifying whether the cart is having any products or not.
        if (!searchCartDetails.items.length) {
            return res.status(202).send({status: false, message: `Order already placed for this cart. Please add some products in cart to make an order.`});
        }

        //adding quantity of every products
        const reducer = (previousValue, currentValue) => previousValue + currentValue;

        let totalQuantity = searchCartDetails.items.map((x) => x.quantity).reduce(reducer);

        //object destructuring for response body.
        const orderDetails = {
            userId: userId,
            items: searchCartDetails.items,
            totalPrice: searchCartDetails.totalPrice,
            totalItems: searchCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        };
        const savedOrder = await orderModel.create(orderDetails);

        //Empty the cart after the successfull order
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, {
            $set: {
                items: [],
                totalPrice: 0,
                totalItems: 0,
            }});
        return res.status(200).send({ status: true, message: "Order placed.", data: savedOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports.orderCreation = orderCreation


//2nd api .... update api

const updateOrder = async function (req, res) {
    try {
        let requestBody = req.body;
        const userId = req.params.userId
        let userIdFromToken = req.headers.userid;
        let userIdFromParams= req.params.userId
       
        const { orderId,status } = requestBody

        //-----------------validation starts-------------
       if(Object.keys(requestBody).length==0){
           return res.status(400).send({status:false,msg:"bad req"})
       }
       if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message:"userId is not valid" })
    }
       
    if (userIdFromToken != userIdFromParams) {
        return res.status(403).send({
        status: false,
      message: "Unauthorized access.",
        });
  }

      
        if (!isValid(orderId)) {
            return res.status(400).send({ status:false, message: 'orderId is required' })
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is not valid" })
        }
        const Order = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!Order) {
            return res.status(400).send({ status:false, message: 'order id not correct ' })
        } 
     
        if(isValid(status)){
                        if(!(["pending", "completed", "cancelled"].includes(status))){
                            return res.status(400).send({status:false,message:"status should be only pending, completed or cancelled "})
                        }
                    }
       
        let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status:status }, { new: true }).select({isDeleted:0,deletedAt:0})
        res.status(200).send({ status: true, msg: 'sucesfully updated', data: updateOrder })

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}


module.exports.updateOrder = updateOrder
