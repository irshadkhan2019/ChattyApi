const cloudinary = require("cloudinary");

//pass only file if we want cloudinary to generate ids automatically
uploads = (file, public_id, overwrite, invalidate) => {
  return new Promise((resolve, _) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate,
      },
      (error, result) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
};

function videoUpload(file, public_id, overwrite, invalidate) {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        resource_type: "video",
        chunk_size: 50000,
        public_id,
        overwrite,
        invalidate,
      },
      (error, result) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}

module.exports = { uploads, videoUpload };
