import { GetServerSidePropsContext } from "next";
import nookies from "nookies";
import { firebaseAdmin } from "@/service/firebaseAdmin";

export async function verifyUserToken(ctx: GetServerSidePropsContext) {
  try {
    const cookies = nookies.get(ctx);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    const { uid, email } = token;

    return {
      props: {
        message: `Your email is ${email} and your UID is ${uid}.`,
        uid: uid,
      },
    };
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: {} as never };
  }
}
