import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { AuthProvider } from "@/components/AuthProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
