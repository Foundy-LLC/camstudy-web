import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import React, { Suspense, useContext } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import "../styles/_main.scss";
import { ThemeContext, ThemeProvider } from "@/context/ThemeContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function App({ Component, pageProps }: AppProps) {
  const { theme } = useContext(ThemeContext);
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={`${theme}`}>
          <div className={"background"}>
            <Suspense fallback={<LoadingSpinner />}>
              <Component {...pageProps} />
            </Suspense>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
