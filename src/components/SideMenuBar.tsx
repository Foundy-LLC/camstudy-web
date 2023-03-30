import React from "react";
import sideMenuBarStyles from "@/styles/sideMenuBar.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { NextPage } from "next";

interface Menu {
  title: string;
  items: item[];
}

interface item {
  icon: string;
  text: string;
  path: string;
  notification?: (userId: string) => string;
}

interface MenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  menus: Menu[];
  userId: string;
}

const menus: Menu[] = [
  {
    title: "메인",
    items: [
      {
        icon: "dashboard",
        text: "대시보드",
        path: "/",
      },
      {
        icon: "chat_bubble",
        text: "스터디룸",
        path: "/rooms",
      },
    ],
  },
  {
    title: "작물",
    items: [
      {
        icon: "potted_plant",
        text: "내 작물 관리하기",
        path: "",
      },
    ],
  },
  {
    title: "랭킹",
    items: [
      {
        icon: "bar_chart",
        text: "랭킹 목록",
        path: "",
      },
    ],
  },
  {
    title: "프로필&친구",
    items: [
      {
        icon: "person",
        text: "내 프로필",
        path: "",
      },
      {
        icon: "group",
        text: "친구 목록",
        path: "/friends",
        notification: function (userId: string) {
          const fetcher = (args: string) =>
            fetch(args).then((res) => res.json());
          const { data, error, isLoading } = useSWR(
            `api/users/${userId}/friends?accepted=false`,
            fetcher
          );
          if (data?.data.length === 0) return "";
          return data?.data.length;
        },
      },
      {
        icon: "person_search",
        text: "유저 검색",
        path: "",
      },
    ],
  },
  {
    title: "그 외",
    items: [
      {
        icon: "settings",
        text: "환경 설정",
        path: "",
      },
      {
        icon: "info",
        text: "도움말",
        path: "",
      },
    ],
  },
];

const MenuGroup = ({ menus, userId, ...props }: MenuListProps) => {
  const router = useRouter();

  const currentPath = router.pathname;

  return (
    <>
      <ul className={`${sideMenuBarStyles["menu"]}`} {...props}>
        {menus.map((menu, index) => (
          <>
            <li key={index}>
              <h2
                className={`${sideMenuBarStyles["title"]} typography__text--big`}
              >
                {menu.title}
              </h2>
              <ul>
                {menu.items.map((item, index) => (
                  <Link
                    className={`${sideMenuBarStyles["contents"]} ${
                      currentPath === item.path
                        ? sideMenuBarStyles["active"]
                        : ""
                    }`}
                    href={item.path}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <li key={index}>{item.text}</li>
                    <span
                      className={`${sideMenuBarStyles["notification"]}`}
                      style={{ marginLeft: "auto", marginRight: "1.5rem" }}
                    >
                      {item.notification != undefined
                        ? item.notification(userId)
                        : ""}
                    </span>
                  </Link>
                ))}
              </ul>
            </li>
            <hr />
          </>
        ))}
        <div className={`${sideMenuBarStyles["empty-place"]}`}>
          <div className={`${sideMenuBarStyles["empty-place-content"]}`}>
            푸터 대용 공간
          </div>
        </div>
        <style jsx>
          {`
            .material-symbols-outlined {
              font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
            }
          `}
        </style>
      </ul>
    </>
  );
};
export const SideMenuBar: NextPage<{ userId: string }> = ({ userId }) => {
  return (
    <aside>
      <MenuGroup menus={menus} userId={userId}></MenuGroup>
    </aside>
  );
};
