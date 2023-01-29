import {getAuth} from "@firebase/auth";
import {useAuthState} from "react-firebase-hooks/auth";
import React from "react";
import {NextPage} from "next";
import {useRouter} from "next/router";

const Dashboard:NextPage = () => {
    const auth = getAuth()
    const [user, loading] = useAuthState(auth);
    const router = useRouter()

    if (loading) {
        return <div>Loading</div>
    }
    if (!user) {
        router.push("/login");
        return <div>Please sign in to continue</div>
    }

    return (
        <button onClick={() => auth.signOut()}>Sign out</button>
    )
}
export default Dashboard;