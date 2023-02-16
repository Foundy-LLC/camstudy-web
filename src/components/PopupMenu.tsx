import React, { useState } from "react";

interface PopupMenuProps {
  label: string;
  menuItems: string[];
  onMenuItemClick: (item: string) => void;
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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (item: string) => {
    setIsOpen(false);
    onMenuItemClick(item);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{label}</button>
      {isOpen && (
        <ul>
          {menuItems.map((item) => (
            <li key={item} onClick={() => handleClick(item)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PopupMenu;
