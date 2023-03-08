import React, { useEffect, useState } from "react";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { WelcomeStore } from "@/stores/WelcomeStore";
import { observer } from "mobx-react";
import { useAuth } from "@/components/AuthProvider";
import { verifyUserToken } from "@/service/verifyUserToken";
import welcomeStyles from "@/styles/welcome.module.scss";
import userStore from "@/stores/UserStore";
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
          <label className={`${welcomeStyles["title"]}`} htmlFor={"tagInput"}>
            관심분야 해시태그
          </label>
          <TagsInput welcomeStore={welcomeStore}></TagsInput>
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
          disabled={
            welcomeStore.tags.length === 0 ||
            welcomeStore.name === "" ||
            welcomeStore.nameErrorMessage !== undefined ||
            welcomeStore.tagsErrorMessage !== undefined ||
            welcomeStore.introduceErrorMessage !== undefined ||
            welcomeStore.profileImageUrlErrorMessage !== undefined
          }
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
    const [tag, setTag] = React.useState("");
    const debounceSearch = useDebounce(tag, 500);

    useEffect(() => {
      if (debounceSearch) {
        welcomeStore.onChangeTagInput(debounceSearch);
      }
    }, [debounceSearch]);

    const removeTags = (indexToRemove: number) => {
      welcomeStore.removeTags(indexToRemove);
    };
    const addTags = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isExistTag((event.target as HTMLInputElement).value)) return;

      if (
        (event.target as HTMLInputElement).value !== "" &&
        !event.nativeEvent.isComposing // 한글 키 중복 방지
      ) {
        welcomeStore.changeTags([(event.target as HTMLInputElement).value]);
        welcomeStore.clearRecommendTags();
        setTag("");
      }
    };
    const tagInputEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "Enter":
          addTags(event);
          break;
        default:
          if ((event.target as HTMLInputElement).value.length === 0) {
            setTag("#" + tag);
          }
          break;
      }
    };
    const isExistTag = (tag: string) => {
      if (welcomeStore.tags.includes(tag)) {
        alert("태그가 중복되었습니다.");
        return true;
      }
    };

    const selectRecommendTag = (
      e: React.MouseEvent<HTMLLabelElement, MouseEvent>
    ) => {
      if (isExistTag((e.target as HTMLLabelElement).innerText)) return;
      welcomeStore.changeTags([(e.target as HTMLLabelElement).innerText]);
      welcomeStore.clearRecommendTags();
      setTag("");
    };
    return (
      <>
        <div className={`${welcomeStyles["tags-input"]}`}>
          <ul className={`${welcomeStyles["tags"]}`}>
            {...welcomeStore.tags.map((tag: string, index: number) => (
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
            id={"tagInput"}
            name={"tagInput"}
            type="text"
            onKeyDown={(event) => tagInputEvent(event)}
            placeholder={
              welcomeStore.tags.length == 0
                ? "#수능, #개발, #고시 등 입력하세요"
                : "#"
            }
            hidden={welcomeStore.tags.length === 3}
            onChange={(e) => {
              setTag(e.target.value);
              console.log(tag);
            }}
            value={tag}
            autoComplete={"off"}
            aria-autocomplete={"list"}
            list={"tags-list"}
            maxLength={21}
          />
        </div>
        <div
          className={`${welcomeStyles["recommend-tags"]}`}
          hidden={welcomeStore.recommendTags.length == 0}
        >
          {welcomeStore.recommendTags.map((tag, idx) => {
            return (
              <label
                className={`${welcomeStyles["recommend-tag"]}`}
                key={idx}
                onClick={(e) => selectRecommendTag(e)}
              >
                {tag.name}
              </label>
            );
          })}
        </div>
      </>
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
