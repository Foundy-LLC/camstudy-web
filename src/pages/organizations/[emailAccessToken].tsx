import { NextPage } from "next";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useStores } from "@/stores/context";

const EmailAccessToken: NextPage = observer(() => {
  const { organizationStore } = useStores();
  const router = useRouter();
  const AccessToken = router.query.emailAccessToken;

  useEffect(() => {
    if (typeof AccessToken === "string") {
      organizationStore.verifyEmailConfirm(AccessToken);
    }
  }, [AccessToken]);

  return (
    <>
      {organizationStore.successMessage === "" ? null : (
        <h1>{organizationStore.successMessage}</h1>
      )}
      {organizationStore.errorMessage === "" ? null : (
        <h1>{organizationStore.errorMessage}</h1>
      )}
    </>
  );
});

export default EmailAccessToken;
