
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: { type:ObjectId, 
        ref: "project5user", 
        unique:true
     },
    items:
      [
        {
          productId: { type:ObjectId, ref: "project5product", required:true },
          quantity: { type:Number,default:0//required:true
        },
        },
      ],
    totalPrice:
      {
        type: Number,
        default:0
       // required:true,
      
      },
    totalItems:
      { type:Number,default:0 //required:true
    },
  },
{ timestamps: true }
)



module.exports = mongoose.model('project5cart', cartSchema)