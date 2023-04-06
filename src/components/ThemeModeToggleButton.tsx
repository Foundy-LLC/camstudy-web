import { NextPage } from "next";
import React, { useEffect, useState } from "react";

export const ThemeModeToggleButton: NextPage = () => {
  const [darkMode, setDarkMode] = useState<string>("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("color-theme");
    const systemTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    savedTheme
      ? setDarkMode(savedTheme === "dark" ? "true" : "false")
      : setDarkMode(systemTheme ? "true" : "false");
  }, []);

  useEffect(() => {
    if (darkMode === "") return;
    localStorage.setItem("color-theme", darkMode === "true" ? "dark" : "light");
    darkMode === "true"
      ? document.body.setAttribute("color-theme", "dark")
      : document.body.setAttribute("color-theme", "light");
  }, [darkMode]);

  return (
    <>
      <button
        onClick={() => {
          setDarkMode(darkMode === "true" ? "false" : "true");
        }}
      >
        {darkMode === "true" ? "다크 모드" : "라이트 모드"}
      </button>
    </>
  );
};
