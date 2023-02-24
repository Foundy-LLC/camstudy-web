import jwt, { TokenExpiredError } from "jsonwebtoken";
import process from "process";

export const createEmailToken = (
  userId: string,
  organizationId: string
): string => {
  try {
    return jwt.sign(
      {
        userId: userId,
        organizationId: organizationId,
      },
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_ACCESS_SECRET!,
      {
        expiresIn: "24h",
        issuer: "studying-farmer",
      }
    );
  } catch (e) {
    throw "인증 토큰 생성에 실패하였습니다";
  }
};

export const verifyEmailToken = (AccessToken: string) => {
  try {
    return jwt.verify(
      AccessToken,
      process.env.NEXT_PUBLIC_EMAIL_TOKEN_ACCESS_SECRET!
    );
  } catch (e) {
    throw e;
  }
};
