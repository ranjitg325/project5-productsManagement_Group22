const express = require('express');
const router = express.Router();
const usercontroller = require ("../controller/userControllers.js")
const productcontroller = require ("../controller/productController.js")
const cartcontroller = require ("../controller/cartController.js")
const ordercontroller = require ("../controller/orderController.js")
const middleware=require("../middleware/auth.js")

router.post("/register",usercontroller.userCreate)
router.post("/login", usercontroller.userLogin)
router.get("/user/:userId/profile",middleware.authentication,usercontroller.getuserdetail)
router.put("/user/:userId/profile", middleware.authentication,usercontroller.profileUpdate)


router.post("/products",productcontroller.productCreate)
router.get("/products",productcontroller.getProductsByfilter)
router.get("/products/:productId",productcontroller.getproductsById) 
router.put("/products/:productId",productcontroller.updatedProductById)
router.delete("/products/:productId",productcontroller.deleteproductById) 



router.post("/users/:userId/cart",middleware.authentication,cartcontroller.cartCreation)
router.put("/users/:userId/cart",middleware.authentication,cartcontroller.updateCart)
router.get("/users/:userId/cart",middleware.authentication,cartcontroller.getCart)
router.delete("/users/:userId/cart",middleware.authentication,cartcontroller.deleteCart)


router.post('/users/:userId/orders',middleware.authentication, ordercontroller.orderCreation)
router.put('/users/:userId/orders',middleware.authentication, ordercontroller.updateOrder)


module.exports = router;