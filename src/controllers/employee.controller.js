import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const createEmployee = asyncHandler(async (req, res) => {


    // Get Employee details
    const { firstName, lastName, phone, email, dob, maritalStatus, gender, nationality, address, city, state, zipCode, professional_details } = req.body
    console.log(req.body);
    // Validate the data
    if ([firstName, lastName, phone, email, dob, maritalStatus, gender, nationality, address, city, state, zipCode].some((field) => {
        field.trim() === ""
    })
    ) {
        res.status(400).json(new ApiResponse(400, "all fields are required"))
        throw new ApiError(400, "all fields are required")
    }
    // Check if employee exists with email or phone

    const isEmployee = await Employee.findOne({ email })

    if (isEmployee) {
        res.status(400).json(new ApiResponse(400, "Employee already exists", ""))
        throw new ApiError(400, "Employee already exists")
    }

    // Create Employee object and create entry in database

    const employee = await Employee.create({
        firstName,
        lastName,
        phone,
        email,
        dob,
        maritalStatus,
        gender,
        nationality,
        address,
        city,
        state,
        zipCode,
        userEmail: req.user.email,
        professional_details
    })
    // Check if the Employee was created
    const createdEmployee = await Employee.findOne(employee._id)

    if (!createdEmployee) {
        res.status(500).json(new ApiResponse(500, "Something went wrong creating user"))
        throw new ApiError(500, "Something went wrong creating user");
    }

    // Return response
    res.status(200).json(new ApiResponse(200, createdEmployee, "employee created successfully!"))

})

const getEmployee = asyncHandler(async (req, res) => {
    const id = req.query.userId;

    if (!id) {
        const employees = await Employee.find({ userEmail: req.user.email }).select("-activities");
        res.status(200).json(new ApiResponse(200, employees));
        return; // Important: return to avoid executing further code
    }

    const employee = await Employee.findById(id).select("-activities");

    if (!employee) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""));
        return; // Important: return to avoid executing further code
    }

    res.status(200).json(new ApiResponse(200, employee, ""));
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const id = await req.query.userId

    if (!id) {

        res.status(400).json(new ApiResponse(400, "Invalid employee id"))
        throw new ApiError(400, "Invalid employee id")
    }

    const employee = await Employee.findByIdAndDelete(id)

    if (!employee) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""))
        throw new ApiError(404, "Employee not found")
    }

    res.status(200).json(new ApiResponse(200, employee, "Employee deleted successfully"))


})

const updateEmployee = asyncHandler(async (req, res) => {
    const id = req.query.userId
    const updates = await req.body

    if (!id) {
        res.status(400).json(new ApiResponse(400, "Invalid employee id"))
        throw new ApiError(400, "Invalid employee id")
    }

    const email = updates.email
    const isEmailExist = await Employee.findOne({ email })



    if (isEmailExist && isEmailExist._id.toString() !== id && isEmailExist.email === email) {
        res.status(400).json(new ApiResponse(400, "Email already exists", ""))
        throw new ApiError(400, "Email already exists")
    }

    const employee = await Employee.findById(id).select("-activities")

    if (!employee) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""))
        throw new ApiError(404, "Employee not found")
    }



    Object.assign(employee, updates)
    await employee.save({ validateBeforeSave: false })

    res.status(200).json(new ApiResponse(200, employee, "Employee updated successfully!"))

})

const getEmployeeByKey = asyncHandler(async (req, res) => {
    const key = req.query.key

    if (!key) {
        res.status(404).json(new ApiResponse(404, {}, "invalid key"))
        throw new ApiError(404, "Invalid key")

    }
    const employee = await Employee.findOne({ key }).select("-activities")
    if (!employee) {
        res.status(404).json(new ApiResponse(404, {}, "invalid key , Employee not  found"))
        throw new ApiError(404, "Invalid key")

    }
    res.status(200).json(new ApiResponse(200, employee, "Employee found successfully"))


})


const getEmployeesActivity = asyncHandler(async (req, res) => {
    const id = req.query.id

    if (!id) {
        res.status(400).json(new ApiResponse(400, "Invalid employee id", ""))
        throw new ApiError(400, "Invalid employee id")
    }

    const employee = await Employee.findById(id)

    if (!employee) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""))
        throw new ApiError(404, "Employee not found")
    }

    res.status(200).json(new ApiResponse(200, employee.activities, "Employee activities "))
})


export { createEmployee, getEmployee, deleteEmployee, updateEmployee, getEmployeeByKey, getEmployeesActivity }



