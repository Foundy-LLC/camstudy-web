// import { NextPage } from "next";
// import { Layout } from "@/components/Layout";
// import Image from "next/image";
// import { useStores } from "@/stores/context";
// import { useAuth } from "@/components/AuthProvider";
// import React from "react";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "@/service/firebase";
// import router from "next/router";
//
// const crop: NextPage = () => {
//   return <Layout>asd</Layout>;
// };
//
// const myPot: NextPage = () => {
//   const { cropStore } = useStores();
//   const [user, loading] = useAuthState(auth);
//
//   if (loading) {
//     return <div>Loading</div>;
//   }
//   if (!user) {
//     router.replace("/login");
//     return <div>Please sign in to continue</div>;
//   }
//
//   return (
//     <div>
//       <div>내 화분</div>
//       <div>
//         <div>
//           <Image src={} alt={}></Image>
//         </div>
//         <div></div>
//       </div>
//     </div>
//   );
// };
//
// export default crop;
