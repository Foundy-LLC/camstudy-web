import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import Mail from "nodemailer/lib/mailer";
import mailgunTransport from "nodemailer-mailgun-transport";
const mailGunSendMail = (email: Mail.Options) => {
  const auth: mailgunTransport.Options = {
    auth: {
      api_key: process.env.NEXT_PUBLIC_MAILGUN_API_KEY!,
      domain: process.env.NEXT_PUBLIC_MAILGUN_DOMAIN_URL,
    },
  };
  const nodemailerMailgun = nodemailer.createTransport(mg(auth));
  try {
    return nodemailerMailgun.sendMail(email, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        console.log(`Response: ${info}`);
      }
    });
  } catch (e) {}
};

export const sendSecretMail = (address: string, secret: string) => {
  const email = {
    from: "Windo@developer.com", // 보내는 사람 - 원하는 대로 쓰면 된다.
    to: address, // 받는 사람
    subject: "Login Secret Key", // 이메일 제목
    html: `<b>Your Login Secret Key ${secret}</b>`, // 이메일 본문. HTML 문법이 먹힌다.
  };
  return mailGunSendMail(email);
};
