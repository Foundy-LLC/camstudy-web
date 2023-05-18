import React, { useState } from "react";
import studyRoomStyles from "@/styles/studyRoom.module.scss";

interface PopupMenuProps {
  label: string;
  menuItems: string[];
  onMenuItemClick: (item: string) => void;
  name: string;
}

/**
 * 임시 팝업 메뉴이다.
 * @param label 팝업 메뉴 버튼의 레이블 텍스트이다.
 * @param menuItems 메뉴의 항목들이다.
 * @param onMenuItemClick 메뉴를 클릭했을 때 실행할 콜백함수이다.
 */
// TODO: 디자인 개선하기
const PopupMenu: React.FC<PopupMenuProps> = ({
  label,
  menuItems,
  onMenuItemClick,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserOption, setShowUserOption] = useState<string>("");
  const handleHover = (event: React.MouseEvent<HTMLSpanElement>) => {
    console.log((event.target as HTMLElement).className);
    const position = (event.target as HTMLElement).getBoundingClientRect();
    const x = position.x - 8;
    const y = position.y - 45;
    document.getElementById("dialog")!.style.top = y.toString() + "px";
    document.getElementById("dialog")!.style.left = x.toString() + "px";
  };

  const handleClick = (item: string) => {
    setShowUserOption("");
    onMenuItemClick(item);
  };

  return (
    <>
      <div
        tabIndex={0}
        className={`${studyRoomStyles["study-room__option"]}`}
        onFocus={() => setShowUserOption(name)}
        onBlur={() => setShowUserOption("")}
      >
        <span
          className={`${studyRoomStyles["study-room__option-icon"]} material-symbols-rounded`}
        >
          more_horiz
        </span>
        <ul
          className={`${studyRoomStyles["study-room__option__dialog"]} typography__text--small`}
          hidden={showUserOption !== name}
        >
          <li onClick={() => handleClick("block")}>
            <span className="material-symbols-rounded">block</span>
            차단하기
          </li>
          <li onClick={() => handleClick("kick")}>
            <span className="material-symbols-rounded">account_circle_off</span>
            강퇴하기
          </li>
        </ul>
      </div>
    </>
  );
};

export default PopupMenu;
