const express=require("express")
const router=express.Router()

//todo: router.get(), router.put().....
//pass to controllers
const userController = require("../controllers/User_controller.js") //get the conroller

router.get("/:id", userController.getById);


module.exports = router