import mongoose from "mongoose";

const professionalDetailsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,

    },
    type: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,

        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    department: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    workingDays: {
        type: String,
        required: true,
    },
    joiningDate: {
        type: String,
        required: true,
    },
    officeLocation: {
        type: String,
        required: true,
    },
});

const employeeSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        dob: {
            type: String,
            required: true,
        },
        maritalStatus: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
        nationality: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            default: () => Math.random().toString(36).slice(2),
        },
        userEmail: {
            type: String,
            required: true

        },
        activities: [
            {
                userID: String,
                active_window: String,
                current_url: String,
                current_time: String,
                time_spent: String,
                pc_name: String,
                start_time: String,
                end_time: String,
                productivity: {
                    type: String,
                    enum: ["Productive", "Unproductive", "Unidentified"],
                    default: "Unidentified"
                }
            },
            {
                timestamps: true
            }
        ],

        professional_details: professionalDetailsSchema,
    },

    {
        timestamps: true,
    }
);

export const Employee = mongoose.model("Employees", employeeSchema);