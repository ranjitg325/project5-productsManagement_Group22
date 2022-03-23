const express = require('express');
const router = express.Router();
const controller = require ("../controller/controllers.js")

router.post("/collegeinfo",controller.createCollege)
router.post("/interninfo",controller.createIntern)
router.get("/collegedetails",controller.collegeDetail)


module.exports = router;