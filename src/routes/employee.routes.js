import { createEmployee, getEmployee, deleteEmployee, updateEmployee } from "../controllers/employee.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";



const router = Router();

// Create a new Employee

router.route("/add").post(
    verifyJWT,
    createEmployee)
router.route("/get").get(
    verifyJWT,
    getEmployee)
router.route("/delete").delete(
    verifyJWT,
    deleteEmployee)
router.route("/update").put(
    verifyJWT,
    updateEmployee)

export default router 