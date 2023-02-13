import "@/styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import ProtectedRoutes from "@/components/ProtectedRoutes";

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <ProtectedRoutes router={router}>
      <Component {...pageProps} />
    </ProtectedRoutes>
  );
}
