import React, { useEffect, useState } from "react";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { WelcomeStore } from "@/stores/WelcomeStore";
import { observer } from "mobx-react";
import { useAuth } from "@/components/AuthProvider";
import { verifyUserToken } from "@/service/verifyUserToken";
import welcomeStyles from "@/styles/welcome.module.scss";
import userStore from "@/stores/UserStore";
import {
  NO_TAG_ERROR_MESSAGE,
  TAG_COUNT_ERROR_MESSAGE,
} from "@/constants/message";
import { event } from "next/dist/build/output/log";
import { useDebounce } from "@/components/UseDebounce";
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return await verifyUserToken(ctx);
};

const Welcome: NextPage = () => {
  const { user } = useAuth();
  const [welcomeStore] = useState(new WelcomeStore());
  const successToCreate = welcomeStore.successToCreate;
  const router = useRouter();

  //Welcome 페이지에서는 이동 못하도록 설정
  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      router.events.emit("routeChangeError");
    });
  }, [router.events]);

  useEffect(() => {
    if (successToCreate) {
      router.replace("/");
    }
  }, [successToCreate, router]);

  return (
    <div
      className={`${welcomeStyles["welcome-form"]} elevation__navigation-drawer__modal-side-bottom-sheet__etc login-form`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
        }}
      >
        <ImageInput welcomeStore={welcomeStore}></ImageInput>
        <div id={"nickName"}>
          <label className={`${welcomeStyles["title"]}`}>닉네임 설정</label>
          <label className={`${welcomeStyles["sub-title"]}`}>
            미풍양속을 해치치 않는 내용으로 작성해주세요
          </label>
          <input
            className={`${welcomeStyles["common-input"]}`}
            type={"text"}
            onChange={(e) => welcomeStore.changeName(e.target.value)}
            value={welcomeStore.name}
            placeholder={"최대 10자, 한글, 영문, 숫자 사용 가능"}
          />
          <div>{welcomeStore.nameErrorMessage}</div>
        </div>
        <div id={"introduce"}>
          <label className={`${welcomeStyles["title"]}`}>자기소개 메시지</label>
          <label className={`${welcomeStyles["sub-title"]}`}>
            나를 나타낼 수 있는 소개 내용을 입력해주세요
          </label>
          <input
            className={`${welcomeStyles["common-input"]}`}
            type={"text"}
            onChange={(e) => welcomeStore.changeIntroduce(e.target.value)}
            value={welcomeStore.introduce}
            placeholder={"최대 100자 이내로 작성"}
          />
          <div>{welcomeStore.introduceErrorMessage}</div>
        </div>
        <div id={"tags"}>
          <label className={`${welcomeStyles["title"]}`}>
            관심분야 해시태그
          </label>
          <TagsInput welcomeStore={welcomeStore}></TagsInput>
          {/*<div className={`${welcomeStyles["tag-input"]}`}>*/}
          {/*  <ul>*/}
          {/*    <li className={`${welcomeStyles["tag-item"]}`}>*/}
          {/*      <span>tag1</span>*/}
          {/*      <i>close</i>*/}
          {/*    </li>*/}
          {/*    <li>*/}
          {/*      <span>tag2</span>*/}
          {/*      <i>close</i>*/}
          {/*    </li>*/}
          {/*  </ul>*/}
          {/*  <input*/}
          {/*    id={"tagInput"}*/}
          {/*    // className={`${welcomeStyles["common-input"]}`}*/}
          {/*    type={"text"}*/}
          {/*    onChange={(e) => welcomeStore.changeTags(e.target.value)}*/}
          {/*    value={welcomeStore.tags}*/}
          {/*    aria-autocomplete={"list"}*/}
          {/*    autoComplete={"false"}*/}
          {/*    placeholder={"#수능, #개발, #공시 등 입력하세요"}*/}
          {/*    onSubmit={(e) => console.log(e.target)}*/}
          {/*  />*/}
          {/*</div>*/}
          <div>{welcomeStore.tagsErrorMessage}</div>
        </div>
      </div>

      <div
        className={`${welcomeStyles["button-group"]}`}
        style={{ marginTop: "3rem" }}
      >
        <button
          className={`${welcomeStyles["back-button"]}`}
          onClick={() =>
            userStore.signOut().then(() => {
              router.push("/login");
            })
          }
          style={{ marginRight: "0.5rem" }}
        >
          뒤로가기
        </button>
        <button
          className={`${welcomeStyles["save-button"]}`}
          onClick={() => welcomeStore.createUser(user!.uid)}
        >
          프로필 저장하고 시작
        </button>
      </div>
      <div>{welcomeStore.errorMessage}</div>
    </div>
  );
};

const TagsInput: NextPage<{ welcomeStore: WelcomeStore }> = observer(
  ({ welcomeStore }) => {
    // TODO(대현): any 타입 바꾸기
    const [tags, setTags] = React.useState([] as any);
    const [tag, setTag] = React.useState("");
    const debounceSearch = useDebounce(tag, 500);

    useEffect(() => {
      if (debounceSearch) {
        welcomeStore.onChangeTagInput(debounceSearch);
        // welcomeStore.setEmailVerifyButtonDisable(
        //   welcomeStore.checkIfNameIncluded() === undefined
        // );
      }
    }, [debounceSearch]);

    const removeTags = (indexToRemove: number) => {
      setTags([
        ...tags.filter((_: any, index: number) => index !== indexToRemove),
      ]);
    };
    const addTags = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if ((event.target as HTMLInputElement).value !== "") {
        setTags([...tags, (event.target as HTMLInputElement).value]);
        (event.target as HTMLInputElement).value = "";
        setTag("");
      }
    };
    const tagInputEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          addTags(event);
          break;
        case "Backspace": {
          if (
            (event.target as HTMLInputElement).value.length === 0 &&
            tags.length != 0
          ) {
            // onKeyDown 이벤트여서 백스페이스가 앞에 있는 태그에 영향을 준다. 따라서 공백 문자 하나를 주어서 공백 문자가 지워지게 했다.
            setTag(tags[tags.length - 1] + " ");
            removeTags(tags.length - 1);
          }
          break;
        }
        default:
          if ((event.target as HTMLInputElement).value.length === 0) {
            setTag("#" + tag);
          }
          break;
      }
    };
    return (
      <div className={`${welcomeStyles["tags-input"]}`}>
        <ul className={`${welcomeStyles["tags"]}`}>
          {tags.map((tag: string, index: number) => (
            <li key={index} className={`${welcomeStyles["tag"]}`}>
              <span className={`${welcomeStyles["tag-title"]}`}>{tag}</span>
              <span
                className={`${welcomeStyles["tag-close-icon"]}`}
                onClick={() => removeTags(index)}
              >
                x
              </span>
            </li>
          ))}
        </ul>
        <input
          type="text"
          onKeyDown={(event) => tagInputEvent(event)}
          placeholder={
            tags.length == 0 ? "#수능, #개발, #고시 등 입력하세요" : "#"
          }
          hidden={tags.length === 3}
          onChange={(e) => setTag(e.target.value)}
          value={tag}
        />
      </div>
    );
  }
);

const ImageInput: NextPage<{ welcomeStore: WelcomeStore }> = ({
  welcomeStore,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const inputOnChange = (e: any) => {
    if (e.target.files[0]) {
      const imageFile = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = () => {
        setImage((reader.result as string) || null);
      };
      console.log(imageFile);
      welcomeStore.changeProfileImage(imageFile);
    }
  };

  return (
    <>
      <div id={"profileImage"} className={`${welcomeStyles["image-input"]}`}>
        {image ? (
          <img
            className={`${welcomeStyles["preview"]}`}
            src={image}
            alt={"profile"}
          ></img>
        ) : (
          <div id={"preview"} className={`${welcomeStyles["preview"]}`}></div>
        )}

        <div className={`${welcomeStyles["input"]}`}>
          <label className={`${welcomeStyles["title"]}`}>프로필 사진</label>
          <label className={`${welcomeStyles["sub-title"]}`}>
            5mb 이하의 파일만 업로드 가능합니다.
          </label>
          <div className={`${welcomeStyles["file-box"]}`}>
            <label htmlFor={"profileImageInput"}>사진 업로드하기</label>
            <input
              id={"profileImageInput"}
              type={"file"}
              accept={"image/png, image/jpeg, image/jpg"}
              hidden={true}
              onChange={(e) => inputOnChange(e)}
            />
          </div>
        </div>
        <div>{welcomeStore.profileImageUrlErrorMessage}</div>
      </div>
    </>
  );
};
export default observer(Welcome);
