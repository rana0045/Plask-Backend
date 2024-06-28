import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Productive from "../models/productive.model.js";

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

    const firstActivity = await Employee.aggregate([
        { $match: { _id: employee._id } },
        { $unwind: '$activities' },
        { $sort: { "activities.start_time": 1 } },
        { $limit: 1 },
        { $project: { activity: "$activities" } }
    ])


    const lastActivity = await Employee.aggregate([
        { $match: { _id: employee._id } },
        { $unwind: '$activities' },
        { $sort: { "activities.start_time": -1 } },
        { $limit: 1 },
        { $project: { activity: "$activities" } }
    ])
    const activities = {
        Employee: employee,
        first: firstActivity[0] ? firstActivity[0].activity : null,
        last: lastActivity[0] ? lastActivity[0].activity : null
    };

    res.status(200).json(new ApiResponse(200, activities, ""));

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
    const id = req.query.id;
    const userID = req.user._id;

    if (!id) {
        res.status(400).json(new ApiResponse(400, "Invalid employee id", ""));
        throw new ApiError(400, "Invalid employee id");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""));
        throw new ApiError(404, "Employee not found");
    }

    const productiveDataList = await Productive.find({ user: userID });

    const updatedActivities = employee.activities.map(activity => {
        let isProductive = "Unidentified";

        if (activity.active_window) {
            for (const isPro of productiveDataList) {
                if (activity.active_window.includes(isPro.executable) && isPro.isProductive === true) {
                    isProductive = "Productive";
                    break;
                } else if (activity.active_window.includes(isPro.executable) && isPro.isProductive === false) {
                    isProductive = "Unproductive";
                    break;
                }
            }
        }

        activity.productivity = isProductive;
        return activity;
    });

    employee.activities = updatedActivities;
    await employee.save();
    const data = {
        email: employee?.email,
        activities: employee.activities
    }

    res.status(200).json(new ApiResponse(200, data, "Employee activities"));
});

const getActivitiesData = asyncHandler(async (req, res) => {

    const activities = await Employee.find()

    const data = activities.map((item) => {
        return item.activities
    })


    const allActivities = data.flat()

    const days = {};

    allActivities.forEach(entry => {
        const date = new Date(entry.start_time);
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // "YYYY-MM-DD" format

        if (!days[dayKey]) {
            days[dayKey] = { productive: 0, unproductive: 0, unidentified: 0 };
        }

        const timeInHours = entry.time_spent / 3600; // Convert seconds to hours

        if (entry.productivity === "Productive") {
            days[dayKey].productive += timeInHours;
        } else if (entry.productivity === "Unidentified") {
            days[dayKey].unidentified += timeInHours;
        } else if (entry.productivity === "Unproductive") {
            days[dayKey].unproductive += timeInHours;
        }
    });

    const productivity = Object.keys(days).map(day => ({

        productive: days[day].productive,
        unproductive: days[day].unproductive,
        unidentified: days[day].unidentified
    }));




    return res.status(200).json(new ApiResponse(200, productivity))


})

const getActivitiesDataSingle = asyncHandler(async (req, res) => {
    const id = req.query.id;

    if (!id) {
        res.status(400).json(new ApiResponse(400, "Invalid employee id", ""));
        throw new ApiError(400, "Invalid employee id");
    }

    const activities = await Employee.findById(id);

    if (!activities) {
        res.status(404).json(new ApiResponse(404, "Employee not found", ""));
        throw new ApiError(404, "Employee not found");
    }

    const days = {};

    activities.activities.forEach(entry => {
        const date = new Date(entry.start_time);
        const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // "YYYY-MM-DD" format

        if (!days[dayKey]) {
            days[dayKey] = { productive: 0, unproductive: 0, unidentified: 0 };
        }

        const timeInHours = parseFloat(entry.time_spent) / 3600; // Convert seconds to hours


        if (entry.productivity === "Productive") {
            days[dayKey].productive += timeInHours;
        } else if (entry.productivity === "Unidentified") {

            days[dayKey].unidentified += timeInHours;
        } else if (entry.productivity === "Unproductive") {
            days[dayKey].unproductive += timeInHours;
        }
    });

    const productivity = Object.keys(days).map(day => ({
        productive: days[day].productive,
        unproductive: days[day].unproductive,
        unidentified: days[day].unidentified
    }));

    const email = activities.email;
    return res.status(200).json(new ApiResponse(200, { productivity, email: email }, "Chart Data"));
});

const getTopApplications = asyncHandler(async (req, res) => {
    const activities = await Employee.find()

    const executableTimes = {};

    const data = activities.map((item) => {
        return item.activities
    })


    const allActivities = data.flat()



    allActivities.forEach((activity) => {
        const executable = activity.executable

        console.log(activity.executable);

        if (executable) {
            const timeSpent = parseFloat(activity.time_spent);

            if (!executableTimes[executable]) {
                executableTimes[executable] = 0;
            }

            executableTimes[executable] += timeSpent;
        }

    })


    const topApplications = Object.entries(executableTimes).map(([name, time]) => ({
        name,
        hours: Math.round(time / 3600),
        email: activities.email
    })).sort((a, b) => b.hours - a.hours);


    return res.status(200).json(new ApiResponse(200, topApplications, "Top Applications"));
})

const topUsers = asyncHandler(async (req, res) => {
    // Fetch the last two oldest employees
    const employees = await Employee.find().sort({ createdAt: 1 }).limit(2);

    const productivityData = employees.map(employee => {
        const activities = employee.activities;
        const days = {};
        let totalProductiveHours = 0;
        let totalUnproductiveHours = 0;
        let totalUnidentifiedHours = 0;

        activities.forEach(entry => {
            const date = new Date(entry.start_time);
            const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // "YYYY-MM-DD" format

            if (!days[dayKey]) {
                days[dayKey] = { productive: 0, unproductive: 0, unidentified: 0 };
            }

            const timeInHours = entry.time_spent / 3600; // Convert seconds to hours

            if (entry.productivity === "Productive") {
                days[dayKey].productive += timeInHours;
                totalProductiveHours += timeInHours;
            } else if (entry.productivity === "Unidentified") {
                days[dayKey].unidentified += timeInHours;
                totalUnidentifiedHours += timeInHours;
            } else if (entry.productivity === "Unproductive") {
                days[dayKey].unproductive += timeInHours;
                totalUnproductiveHours += timeInHours;
            }
        });

        const productivity = Object.values(days).map(day => ({
            productive: day.productive,
            unproductive: day.unproductive,
            unidentified: day.unidentified
        }));

        const totalHoursInSeconds = (totalProductiveHours + totalUnproductiveHours + totalUnidentifiedHours) * 3600;
        const totalHours = Math.floor(totalHoursInSeconds / 3600);
        const totalMinutes = Math.floor((totalHoursInSeconds % 3600) / 60);
        const totalTimeFormatted = `${totalHours}h ${totalMinutes}m`;

        return {
            name: employee.email,
            totalTime: totalTimeFormatted,
            productivity
        };
    });

    return res.status(200).json(new ApiResponse(200, { data: productivityData, message: "Success", success: true }));
});



export {
    createEmployee,
    getEmployee,
    deleteEmployee,
    updateEmployee,
    getEmployeeByKey,
    getEmployeesActivity,
    getActivitiesData,
    getActivitiesDataSingle,
    getTopApplications,
    topUsers
}