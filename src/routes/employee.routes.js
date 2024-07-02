import {
    createEmployee,
    getEmployee,
    deleteEmployee,
    updateEmployee,
    getEmployeeByKey,
    getEmployeesActivity,
    getActivitiesData,
    getActivitiesDataSingle,
    getTopApplications,
    topUsers,
    getTopWebsites,
    getUncategorizedData
} from "../controllers/employee.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

// Create a new Employee
router.route("/add").post(verifyJWT, createEmployee)
//get the all employees data
router.route("/get").get(verifyJWT, getEmployee)
//delete the employee data
router.route("/delete").delete(verifyJWT, deleteEmployee)
//update the employee data
router.route("/update").put(verifyJWT, updateEmployee)
//get the single employee data
router.route("/key").get(getEmployeeByKey)
//get the employees activity
router.route("/activity").get(verifyJWT, getEmployeesActivity)
//get the activities data
router.route("/activity/data").get(verifyJWT, getActivitiesData)
//get the activities data single
router.route("/activity/data/single").get(verifyJWT, getActivitiesDataSingle)
//get the top applications
router.route("/activity/topApplications").get(verifyJWT, getTopApplications)
//get the top users
router.route("/activity/topUsers").get(verifyJWT, topUsers)

router.route("/activity/topSites").get(verifyJWT, getTopWebsites)


router.route("/activity/getUncategorizedData").get(verifyJWT, getUncategorizedData)

export default router 