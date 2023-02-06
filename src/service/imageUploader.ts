import * as process from "process";

const fs = require("fs");
const AWS = require("aws-sdk");
const endpoint = new AWS.Endpoint(process.env.NEXT_PUBLIC_NC_ENDPOINT);
const region = process.env.NEXT_PUBLIC_NC_REGION;
const access_key = process.env.NEXT_PUBLIC_NC_ACCESS_KEY;
const secret_key = process.env.NEXT_PUBLIC_NC_SECRET_KEY;
const bucket_name = process.env.NEXT_PUBLIC_NC_BUCKET_NAME;

const s3 = new AWS.S3({
  endpoint,
  region,
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_key,
  },
});

export const multipartUploader = async (uid: string, profileImage: string) => {
  let options = {
    partSize: 5 * 1024 * 1024,
  };
  const response = await s3
    .upload(
      {
        Bucket: bucket_name,
        Key: uid,
        Body: profileImage, //fs.createReadStream(local_file_name),
      },
      options
    )
    .promise();
  return response.Location;
};

// const storage = multerS3({
//   s3,
//   bucket: bucket_name as string,
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   acl: "public-read",
//
//   key(req: Request, file, cb) {
//     const originFilename = file.originalname;
//     const extension = originFilename.substring(originFilename.lastIndexOf("."));
//     cb(
//       null,
//       `uploads/profile-images/${new Date().getTime()}-${uuidv4()}${extension}`
//     );
//   },
// });
//
// export default multer({ storage });
