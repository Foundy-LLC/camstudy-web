import { auth } from "@/service/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const isBrowser = () => typeof window !== "undefined";

//TODO: any 타입 말고 뭔지 찾아보기
const ProtectedRoutes = ({ router, children }: any) => {
  let unprotectedRoutes = ["login"];
  const [user] = useAuthState(auth);

  /**
   * @var pathIsProtected Checks if path exists in the unprotectedRoutes routes array
   */
  let pathIsProtected = unprotectedRoutes.indexOf(router.pathname) === -1;

  if (isBrowser() && !auth && !user && pathIsProtected) {
    router.push("/login");
  }
  return children;
};

export default ProtectedRoutes;
