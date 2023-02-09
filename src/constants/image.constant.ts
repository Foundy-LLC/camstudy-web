import * as process from "process";

export const IMAGE_SERVER_URL = `https://${process.env.NEXT_PUBLIC_NC_BUCKETNAME}.kr.object.ncloudstorage.com`;

export const USER_DEFAULT_IMAGE_SRC = "default-image";

export const MAX_IMAGE_BYTE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = /(\.jpg|\.jpeg|\.png)$/i;
