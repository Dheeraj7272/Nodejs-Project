import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// cloudinary.uploader.upload(
//   " https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png",
//   {
//     public_id: "sample_image",
//   },
//   (err, result) => {
//     if (err) {
//       console.log("Error uploading to cloudinary", err);
//     } else {
//       console.log("Successfully uploaded to cloudinary", result);
//     }
//   }
// );

const uploadeOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("File is required to upload on cloudinary");
      return null;
    }
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // If file uploaded
    console.log("File uploaded to Cloudinary successfully");
    if (res && res.secure_url) {
      console.log("File uploaded to Cloudinary successfully", res.secure_url);
      return res;
    }
  } catch (err) {
    // If the file uploade results in failure, remove the file from local uploads folder
    fs.unlinkSync(localFilePath);
    console.error("Error uploading file to cloudinary", err);
    return null;
  }
};

export { uploadeOnCloudinary as uploadToCloudinary };