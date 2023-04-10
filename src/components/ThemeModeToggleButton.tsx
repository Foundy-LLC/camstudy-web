import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import buttonStyles from "@/styles/darkModeToggleButton.module.scss";
import moonIcon from "/public/components/Moon.png";
import Image from "next/image";

export const ThemeModeToggleButton: NextPage = () => {
  const [darkMode, setDarkMode] = useState<string>("");
  const [clicked, setClicked] = useState<boolean>(false);
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

  const toggleButtonOnClick = () => {
    if (clicked === false) {
      setClicked(true);
      const button = document.getElementById("toggleButton");
      button!.setAttribute("clicked", "true");
    }
    setDarkMode(darkMode === "true" ? "false" : "true");
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ display: "flex", marginTop: "3px" }}>
        <Image
          alt={`moon-icon`}
          src={moonIcon}
          width={14}
          height={14}
          style={{ marginTop: "2px" }}
        ></Image>
        <label
          className={"typography__text--small"}
          style={{ marginLeft: "5px", fontWeight: "400" }}
        >
          다크 모드
        </label>
      </div>
      <button
        id="toggleButton"
        className={`${
          buttonStyles[`button${darkMode === "true" ? "-active" : ""}`]
        }`}
        onClick={toggleButtonOnClick}
      >
        <div className={`${buttonStyles[`circle`]}`}></div>
      </button>
    </div>
  );
};
