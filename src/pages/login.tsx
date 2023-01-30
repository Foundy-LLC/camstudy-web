import React, {useState} from "react";
import {NextPage} from "next";
import {initFirebase} from "@/service/firebase";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "@firebase/auth";
import {useAuthState} from "react-firebase-hooks/auth";
import {useRouter} from "next/router";

const Login: NextPage = () => {
    initFirebase();
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const [user, loading] = useAuthState(auth);
    const router = useRouter()

    if (loading) {
        return <div>Loading</div>
    }
    if (user) {
        router.push({pathname: "/welcome", query: {uid: user.uid}})
        return <div>Loading</div>
    }

    const signIn = async () => {
        const result = await signInWithPopup(auth, provider);
    }

    return (
        <div>
            <button onClick={signIn}>
                Sign In
            </button>
        </div>
    );
}

export default Login