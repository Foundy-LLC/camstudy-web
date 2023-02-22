import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import Mail from "nodemailer/lib/mailer";
import mailgunTransport from "nodemailer-mailgun-transport";
import * as process from "process";
const mailGunSendMail = (email: Mail.Options) => {
  const auth: mailgunTransport.Options = {
    auth: {
      api_key: process.env.NEXT_PUBLIC_MAILGUN_API_KEY!,
      domain: process.env.NEXT_PUBLIC_MAILGUN_DOMAIN_URL,
    },
  };
  const nodemailerMailgun = nodemailer.createTransport(mg(auth));
  try {
    nodemailerMailgun.sendMail(email, (err, info) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
        console.log(`Response: ${info}`);
      }
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const sendSecretMail = (address: string, userName: string) => {
  const email = {
    from: "studyingFarmer@developer.com",
    to: address,
    subject: "공부하는 농부 - 소속 인증 이메일",
    html: `<b>안녕하세요, ${userName}님. 본인이 보낸 인증 메일이 맞다면 확인 버튼을 눌러주세요</b> </br> <button>확인</button>`,
  };
  return mailGunSendMail(email);
};
