const Maintenance = require("../models/Maintenance");
const Store = require("../models/Store");
const ErrorHandler = require("../utils/errorHandler");

exports.allMaintenances = async (req, res, next) => {
  const maintenances = await Maintenance.find({
    storeId: req.params.id,
    deletedAt: { $eq: null },
  }).sort({ createdAt: -1 });;
  res.status(200).json({
    success: true,

    maintenances,
  });
};

exports.archivedMaintenances = async (req, res, next) => {
  try {
    const deletedMaintenances = await Maintenance.find({
      deletedAt: { $ne: null },
      storeId: req.params.id,
    }).sort({ deletedAt: -1 });;

    res.status(200).json({
      success: true,
      maintenances: deletedMaintenances,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};

exports.newMaintenance = async (req, res, next) => {
  const { amount, type, note, storeId, issuedAt, paidAt, cateredBy } = req.body;
  try {
    const paidDate = (type === "paid") ? paidAt : null;
    const maintenanceAmt = (type === "topay") ? -amount : 0;
    const maintenance = await Maintenance.create({
      storeId,
      amount: maintenanceAmt,
      type,
      note,
      issuedAt,
      cateredBy,
      paidAt: paidDate
    });

    const store = await Store.findOne({ _id: storeId });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }
    if(cateredBy.toLowerCase()==="store"){
      store.maintenance = (store.maintenance ?? 0) - amount;
    }
    await store.save();

    res.status(201).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the Maintenance.',
    });
  }
};

exports.deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return next(new ErrorHandler(`Maintenance not found with id: ${req.params.id}`));
    }
    maintenance.deletedAt = new Date();
    await maintenance.save();
    res.status(200).json({
    success: true,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};

exports.restoreMaintenance = async (req, res, next) => {
  try {
    const { id } = req.body;
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return next(new ErrorHandler(`Maintenance not found with id: ${id}`));
    }
    maintenance.deletedAt = null;
    await maintenance.save();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};

exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { id, storeId } = req.body;
    const maintenance = await Maintenance.findById(id);
    
    if (!maintenance) {
      return next(new ErrorHandler(`Maintenance not found with id: ${id}`));
    }

    if (maintenance.amount < 0) {
      maintenance.amount = Math.abs(maintenance.amount);
    }
    maintenance.paidAt = new Date();
    maintenance.type = 'paid';
    await maintenance.save();

    
    const store = await Store.findOne({ _id: storeId });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }
    store.maintenance = (store.maintenance ?? 0) + maintenance.amount;

    await store.save();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};
