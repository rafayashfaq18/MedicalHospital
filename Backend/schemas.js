const mongoose = require("mongoose")

const user_schema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/},
    password: {type: String, required: true,
        validate: {
            validator: pwd => pwd.length >=8 && /\d/.test(pwd) && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
            message: "Password must be ≥8 chars and include at least one uppercase letter, one lowercase letter and one number"
        }
    },
    role: {type: String, enum: ['Admin', 'Doctor', 'Patient'], default: 'Patient'},
    status: {type: String, enum:['Pending','Approved','Blocked'], default: 'Pending'}
},{
    timestamps: true
})
const Users = mongoose.model("Users", user_schema)

const appointment_schema = new mongoose.Schema({
    patientID: {type: mongoose.Types.ObjectId, required: true, ref: 'Users'},
    doctorID: {type: mongoose.Types.ObjectId, required: true, ref: 'Users'},
    date: {type: Date, required: true},
    status: {type:String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending'},
    reason: {type: String, required: true},
    note: {type:String, required: false}
},{
    timestamps: true
})
const Appointments = mongoose.model("Appointments", appointment_schema)

const log_schema = new mongoose.Schema({
    ID: {type: mongoose.Types.ObjectId, required: true, ref: 'Users' },
    role: {type: String, required: true, enum: ['Admin', 'Doctor', 'Patient']},
    log: {type: String, required: true, enum: [
      //Admin logs
      'Approved Doctor',
      'Block User',
      'Unblock User',
      'Removed User',
      'Updated Appointment',
      //Doctor logs
      'Approved Appointment',
      'Cancelled Appointment',
      'Removed Appointment',
      //User logs
      'Requested Appointment',
      'Cancelled Appointment'
    ]},
    targetmodel: {type: String, required: true, enum: ['Users', 'Appointments']},
    targetID: {type: mongoose.Types.ObjectId, required: true},
    details: {type: String, trim: true}
},{
    timestamps: true
})
const Logs = mongoose.model("Logs", log_schema)

module.exports = {Users, Appointments, Logs}