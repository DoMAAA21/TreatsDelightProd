


const Notification = require("../models/Notification");
const ErrorHandler = require("../utils/errorHandler");

const bcrypt = require("bcryptjs");

const cloudinary = require("cloudinary");



exports.allEmployees = async (req, res, next) => {
  const { id } = req.params;
    const employees = await User.find({$and: [{ 'role': 'Employee' },{ 'store.storeId': id } ] });

  res.status(200).json({
    success: true,
    employees,
  });
};











