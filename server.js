const  server = require("./socket");

const connectDatabase = require("./config/database");

const cloudinary = require("cloudinary");

const dotenv = require("dotenv");


dotenv.config({ path: "./config/.env" });

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



server.listen(process.env.PORT, () => {
  console.log(`Server started on port:' ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

