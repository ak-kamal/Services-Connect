import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadBufferToCloudinary = (fileBuffer, folder = "services-connect/nid") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export default uploadBufferToCloudinary;