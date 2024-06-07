import { createEmployee, getEmployee, deleteEmployee, updateEmployee, getEmployeeByKey, getEmployeesActivity, getActivitiesData } from "../controllers/employee.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

// Create a new Employee

router.route("/add").post(
    verifyJWT,
    createEmployee)
//get the all employees data
router.route("/get").get(
    verifyJWT,
    getEmployee)
//delete the employee data
router.route("/delete").delete(
    verifyJWT,
    deleteEmployee)
//update the employee data
router.route("/update").put(
    verifyJWT,
    updateEmployee)
//get the single employee data
router.route("/key").get(getEmployeeByKey)
router.route("/activity").get(verifyJWT, getEmployeesActivity)
router.route("/activity/data").get(getActivitiesData)
export default router 