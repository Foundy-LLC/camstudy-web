import React from "react";
import sideMenuBarStyles from "@/styles/sideMenuBar.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { NextPage } from "next";
import GitHubIcon from "@mui/icons-material/GitHub";
import logo from "@/assets/logo.png";
import Image from "next/image";

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

const FetchFriendsRequest = (userId: string) => {
  const fetcher = (args: string) => fetch(args).then((res) => res.json());
  const { data, error, isLoading } = useSWR(
    `api/users/${userId}/friends?accepted=false`,
    fetcher
  );
  if (data?.data.length === 0) return "";
  return data?.data.length;
};

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
        path: "/crop",
      },
    ],
  },
  {
    title: "랭킹",
    items: [
      {
        icon: "bar_chart",
        text: "랭킹 목록",
        path: "/rank",
      },
    ],
  },
  {
    title: "프로필&친구",
    items: [
      {
        icon: "person",
        text: "내 프로필",
        path: "/profile",
      },
      {
        icon: "group",
        text: "친구 목록",
        path: "/friends",
        notification: FetchFriendsRequest,
      },
      {
        icon: "person_search",
        text: "유저 검색",
        path: "/users",
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
          <div className={`${sideMenuBarStyles["menu__group"]}`} key={index}>
            <li>
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
                    key={item.text}
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
          </div>
        ))}
        <div className={`${sideMenuBarStyles["footer"]}`}>
          <div className={`${sideMenuBarStyles["footer__logo"]}`}>
            <Image alt={"studying-farmer-logo"} src={logo} width={100}></Image>
          </div>
          <div
            className={`${sideMenuBarStyles["footer-content"]} typography__text--small`}
          >
            <label
              className={`${sideMenuBarStyles["footer-content__email"]} typography__text--small`}
            >
              Email:&nbsp; Foundy-LLC@gmail.com
            </label>
            <Link href={"https://github.com/Foundy-LLC"} target={"_blank"}>
              <div
                className={`${sideMenuBarStyles["footer-content__git-address"]} typography__text--small`}
              >
                <GitHubIcon
                  className={`${sideMenuBarStyles["footer-content__git-address__icon"]} `}
                />
                <label>&nbsp; Foundy / camstudy-web</label>
              </div>
            </Link>
          </div>
          <div
            className={`${sideMenuBarStyles["copyright"]} typography__text--small`}
          >
            <hr />
            <label>copyright © 한성대학교 TEAM.애플주주</label>
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
