const Store = require("../models/Store");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const cron = require('node-cron');

exports.allStores = async (req, res, next) => {
  const stores = await Store.find({ deletedAt: { $eq: null } });;

  res.status(200).json({
    success: true,

    stores,
  });
};

exports.archivedStores = async (req, res, next) => {
  try {
    const deletedStores = await Store.find({ deletedAt: { $ne: null } });
    res.status(200).json({
      success: true,
      stores: deletedStores,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};


exports.newStore = async (req, res, next) => {
  const { name, slogan, stall, location, active } = req.body;
  const logo = req?.file?.path;
  
  try {

    if (!logo) {
      return res.status(400).json({
        success: false,
        message: 'Please Provide Logo',
      });
    }
   
    const result = await cloudinary.v2.uploader.upload(logo, {
      folder: 'stores',
    });

    const store = await Store.create({
      name,
      slogan,
      stall,
      location,
      active: active,
      logo: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      store,
    });
  } catch (error) {
    // Handle errors, e.g., database errors or Cloudinary upload errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the Store.',
    });
  }
};


exports.deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(new ErrorHandler(`Store not found with id: ${req.params.id}`));
    }
    await User.deleteMany({ 'store.storeId': store._id });
    await Product.deleteMany({ 'store.storeId': store._id });

    // Soft delete the store
    store.deletedAt = new Date();
    store.active = false;
    await store.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};


exports.restoreStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(new ErrorHandler(`Store not found with id: ${req.params.id}`));
    }
    store.deletedAt = null;
    await store.save();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler('Internal Server Error'));
  }
};

exports.getStoreDetails = async (req, res, next) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(
      new ErrorHandler(`Store not found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,

    store,
  });
};

exports.updateStore = async (req, res, next) => {
  try {
    const newStoreData = {
      name: req.body.name,
      slogan: req.body.slogan,
      stall: req.body.stall,
      location: req.body.location,
      active: req.body.active,
    };

    if (req.file && req.file.path !== null) {
      const store = await Store.findById(req.params.id);
      const image_id = store.logo.public_id;
      const res = await cloudinary.uploader.destroy(image_id);
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "stores",
      });
      newStoreData.logo = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    const store = await Store.findByIdAndUpdate(req.params.id, newStoreData, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    });

    // Update products associated with the store
    await Product.updateMany(
      { "store.storeId": store._id },
      { "store.name": store.name }
    );

    await User.updateMany(
      { "store.storeId": store._id },
      { "store.name": store.name }
    );

    res.status(200).json({
      success: true,
      store
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.updateStoreStatus = async (req, res, next) => {
  try {
    const oldStore = await Store.findById(req.params.id);
    

    if (!oldStore) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      { $set: { active: !oldStore.active } },
      { new: true, runValidators: true, useFindAndModify: false }
    );
    res.status(200).json({
      success: true,
      message: 'Store status updated successfully.',
      updatedStore: updatedStore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the Store status.',
    });
  }
};

exports.updatePermit = async (req, res, next) => {
  try {
   
    const { storeId, startedAt, expiration } = req.body;
    const oldStoreData = await Store.findById(storeId);
    const existingPermit = oldStoreData.permit;
  
    const permitData = {
      permit:{
        ...existingPermit,
        startedAt,
        expiration
      }
    };


    if (req.file && req.file.path !== null) {
      const store = await Store.findById(storeId);
      if(store.permit.public_id){
        const image_id = store.permit.public_id;
        await cloudinary.uploader.destroy(image_id);
      }
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "stores",
      });
      permitData.permit = {
        ...permitData.permit,
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const store = await Store.findByIdAndUpdate(storeId, permitData, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    });

    res.status(200).json({
      success: true,
      store
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.updateContract = async (req, res, next) => {
  try {
   
    const { storeId, startedAt, expiration } = req.body;
    const oldStoreData = await Store.findById(storeId);
    const existingContract = oldStoreData.contract;
  
    const contractData = {
      contract:{
        ...existingContract,
        startedAt,
        expiration
      }
    };


    if (req.file && req.file.path !== null) {
      const store = await Store.findById(storeId);
      if(store.contract.public_id){
        const image_id = store.contract.public_id;
        await cloudinary.uploader.destroy(image_id);
      }

      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "stores",
        public_id: `${oldStoreData.name}_${formattedDate}`
      });
      contractData.contract = {
        ...contractData.contract,
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const store = await Store.findByIdAndUpdate(storeId, contractData, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    });

    res.status(200).json({
      success: true,
      store
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



cron.schedule('0 0 * * *', async () => {
  try {
    const stores = await Store.find({
      'permit.expiration': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    for (const store of stores) {
      const owners = await User.find({ 'store.storeId': store._id });

      for (const owner of owners) {
        const notification = new Notification({
          message: `Your permit for ${store.name} is expiring within 7 days.`,
          recipient: owner._id,
          image: 'https://images.emojiterra.com/google/noto-emoji/unicode-15.1/color/share/2757.jpg',
        });
        
        await notification.save();
      }
    }
  } catch (error) {
    console.error('Error scheduling 7 days left notification:', error);
  }
});


cron.schedule('0 0 * * *', async () => {
  try {
    const stores = await Store.find({
      $and: [
        {
          'permit.expiration': {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        {
          'permit.expiration': {
            $not: {
              $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      ],
    });

    for (const store of stores) {
      const owners = await User.find({ 'store.storeId': store._id });

      for (const owner of owners) {
        const notification = new Notification({
          message: `Your permit for ${store.name} is expiring within 30 days.`,
          recipient: owner._id,
          image: 'https://images.emojiterra.com/google/noto-emoji/unicode-15.1/color/share/2757.jpg',
        });
        
        await notification.save();
      }
    }
  } catch (error) {
    console.error('Error scheduling 30 days left notification:', error);
  }
});


cron.schedule('0 0 * * *', async () => {
  try {
    const stores = await Store.find({
      'contract.expiration': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    for (const store of stores) {
      const owners = await User.find({ 'store.storeId': store._id });

      for (const owner of owners) {
        const notification = new Notification({
          message: `Your permit for ${store.name} is expiring within 7 days.`,
          recipient: owner._id,
          image: 'https://images.emojiterra.com/google/noto-emoji/unicode-15.1/color/share/2757.jpg',
        });
        
        await notification.save();
      }
    }
  } catch (error) {
    console.error('Error scheduling 7 days left notification:', error);
  }
});


cron.schedule('0 0 * * *', async () => {
  try {
    const stores = await Store.find({
      $and: [
        {
          'contract.expiration': {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        {
          'contract.expiration': {
            $not: {
              $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      ],
    });

    for (const store of stores) {
      const owners = await User.find({ 'store.storeId': store._id });

      for (const owner of owners) {
        const notification = new Notification({
          message: `Your contract for ${store.name} is expiring within 30 days.`,
          recipient: owner._id,
          image: 'https://images.emojiterra.com/google/noto-emoji/unicode-15.1/color/share/2757.jpg',
        });
        
        await notification.save();
      }
    }
  } catch (error) {
    console.error('Error scheduling 30 days left notification:', error);
  }
});







