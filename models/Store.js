const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,

    required: [true, "Please enter your name"],

    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  slogan: {
    type: String,

    required: [true, "Please enter description"],

    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  logo: {
    public_id: {
      type: String,

      required: true,
    },

    url: {
      type: String,

      required: true,

      default: "https://wallpapercave.com/wp/wc1700893.jpg",
    },
  },

  stall: {
    type: Number,

    required: [true, "Please enter stall No."],
  },
  location: {
    type: String,

    required: [true, "Please enter location"],
  },
  rent: {
    type: Number,

    required: false,
  },
  rent: {
    type: Number,

    required: false,
  },
  water: {
    type: Number,

    required: false,
  },
  electricity: {
    type: Number,
    required: false,
  },
  maintenance: {
    type: Number,
    required: false,
  },
  deletedAt: {
    type: Date,
    default: null
  },
  permit: {
    public_id: {
      type: String,

      required: false,
    },
    url: {
      type: String,

      required: false,
    },
    startedAt: {
      type: Date,
      default: null
    },
    expiration: {
      type: Date,
      default: null
    }
  },
  contract: {
    public_id: {
      type: String,

      required: false,
    },
    url: {
      type: String,

      required: false,
    },
    startedAt: {
      type: Date,
      default: null
    },
    expiration: {
      type: Date,
      default: null
    }
  },

  active: {
    type: Boolean,
    default: false,
    required: true,
  },

});

module.exports = mongoose.model("Store", storeSchema);


