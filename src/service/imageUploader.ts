import * as process from "process";

const fs = require("fs");
const AWS = require("aws-sdk");
const endpoint = new AWS.Endpoint(process.env.NEXT_PUBLIC_NC_ENDPOINT);
const region = process.env.NEXT_PUBLIC_NC_REGION;
const access_key = process.env.NEXT_PUBLIC_NC_ACCESS_KEY;
const secret_key = process.env.NEXT_PUBLIC_NC_SECRET_KEY;
const bucket_name = process.env.NEXT_PUBLIC_NC_BUCKETNAME;

const s3 = new AWS.S3({
  endpoint,
  region,
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_key,
  },
});

export const multipartUploader = async (
  fileName: string,
  profileImage: string
) => {
  let options = {
    partSize: 5 * 1024 * 1024,
  };
  const response = await s3
    .upload(
      {
        Bucket: bucket_name,
        Key: fileName,
        Body: fs.createReadStream(profileImage),
        ACL: "public-read-write",
      },
      options
    )
    .promise();
  return response.Location;
};
