// const AWS = require("aws-sdk");
// const fs = require("fs");
// import Image from "next/image";
//
// /*
//  * 네이버 클라우드 플랫폼을 활용한 이미지 업로드 및 다운로드를 테스트 하기 위한 페이지 입니다.
//  * **/
//
const img = () => {
  //   const endpoint = new AWS.Endpoint(process.env.NEXT_PUBLIC_NC_ENDPOINT);
  //   const region = process.env.NEXT_PUBLIC_NC_REGION;
  //   const access_key = process.env.NEXT_PUBLIC_NC_ACCESSKEY;
  //   const secret_key = process.env.NEXT_PUBLIC_NC_SECRETKEY;
  //
  //   const S3 = new AWS.S3({
  //     endpoint: endpoint,
  //     region: region,
  //     credentials: {
  //       accessKeyId: access_key,
  //       secretAccessKey: secret_key,
  //     },
  //   });
  //
  //   const local_file_path = "/text.txt";
  //
  //   const uploadImg = async (img: File) => {
  //     var object_name = "test";
  //     // upload file
  //     await S3.putObject({
  //       Bucket: process.env.NEXT_PUBLIC_NC_BUCKETNAME,
  //       Key: object_name,
  //       ACL: "public-read",
  //       // ACL을 지우면 전체 공개되지 않습니다.
  //       Body: fs.createReadStream(local_file_path),
  //     }).promise();
  //   };
  //
  //   const setFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const {
  //       target: { files },
  //     } = e;
  //     if (files !== null) {
  //       var file = files[0];
  //       console.log(file);
  //       //await setImgFile(file);
  //       const profile = document.getElementById(
  //         "selected_img"
  //       ) as HTMLImageElement;
  //       //if (imgFile) await uploadImg(imgFile);
  //       // if (profile !== null) profile.src = imgFile;
  //     }
  //   };
  //   const FileName = "default1.jpg";
  //   return (
  //     <div>
  //       <h1>img</h1>
  //       <form>
  //         <input id="img" type="file" onChange={setFile}></input>
  //       </form>
  //       <br />
  //       <h3>기본 이미지:</h3>
  //       <Image
  //         alt="roomImage is missing"
  //         id="selected_img"
  //         src={`http://mufgxalxvumi15837235.cdn.ntruss.com/default1.jpg?type=f&w=500&h=300`}
  //         width="500"
  //         height="300"
  //       ></Image>
  //     </div>
  //   );
  //   //http://mufgxalxvumi15837235.cdn.ntruss.com/default1.jpg?type=f&w=500&h=300
};

export default img;
