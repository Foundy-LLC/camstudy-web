import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/service/firebase";
import profileStyles from "@/styles/profile.module.scss";
import Image from "next/image";
import { useStores } from "@/stores/context";
import { observer } from "mobx-react";
import { Layout } from "@/components/Layout";
import { BelongOrganization } from "@/models/organization/BelongOrganization";
import { useDebounce } from "@/components/UseDebounce";
import { Organization } from "@/models/organization/Organization";
import { Tag } from "@/models/welcome/Tag";

const BelongOrganizationsName: NextPage<{ item: BelongOrganization }> =
  observer(({ item }) => {
    const { organizationStore } = useStores();
    const { organizationName } = item;
    return (
      <>
        <div
          className={`${profileStyles["belong__item"]} typography__text--small`}
        >
          <button
            onClick={() => {
              if (
                confirm(
                  `"${organizationName}"을 소속에서 삭제하시겠습니까?`
                ) === true
              ) {
                organizationStore.deleteBelongOrganization(item);
                console.log(
                  `${organizationName}가(이) 소속에서 삭제되었습니다`
                );
              }
            }}
          >
            <span className="material-symbols-sharp">close</span>
          </button>
          <div>
            <label>{organizationName}</label>
          </div>
        </div>
        <br />
      </>
    );
  });

const BelongOrganizationsNameGroup: NextPage<{ items: BelongOrganization[] }> =
  observer(({ items }) => {
    return (
      <div className={`${profileStyles["belong"]}`}>
        {items.map((item, key) => (
          <BelongOrganizationsName item={item} key={key} />
        ))}
      </div>
    );
  });

const TagName: NextPage<{ item: string }> = observer(({ item }) => {
  const { profileStore } = useStores();
  return (
    <>
      <div className={`${profileStyles["tag__item"]} typography__text--small`}>
        <button
          onClick={() => {
            if (
              confirm(`"${item}"을 관심 태그에서 삭제하시겠습니까?`) === true
            ) {
              profileStore.addDeletedTag(item);
              console.log(`${item}가(이) 관심 태그에서 삭제되었습니다`);
            }
          }}
        >
          <span className="material-symbols-sharp">close</span>
        </button>
        <div>
          <label>{item}</label>
        </div>
      </div>
      <br />
    </>
  );
});

const TagNameGroup: NextPage<{ items: string[] }> = observer(({ items }) => {
  return (
    <div className={`${profileStyles["tag"]}`}>
      {items.map((tag, key) => (
        <TagName item={tag} key={key} />
      ))}
    </div>
  );
});

const RecommendedOrganizationsNameGroup: NextPage<{ items: Organization[] }> =
  observer(({ items }) => {
    const slicedItems = items.slice(0, 5);
    return (
      <div className={`${profileStyles["organization__content"]}`}>
        {slicedItems.map((item, key) => (
          <RecommendedOrganizationsName item={item} key={key} />
        ))}
      </div>
    );
  });

const RecommendedOrganizationsName: NextPage<{ item: Organization }> = observer(
  ({ item }) => {
    const { organizationStore } = useStores();
    return (
      <>
        <div
          id={"organizations__item"}
          className={`${profileStyles["organization__item"]} typography__text--small`}
        >
          <label
            onClick={(e) => {
              const text = e.target as HTMLElement;
              const input = document.getElementById(
                "organization__input"
              ) as HTMLInputElement;
              organizationStore.onChangeNameInput(text.textContent || "");
              input!.value = organizationStore.typedName;
              organizationStore.setDropDownHidden(true);
            }}
          >
            {item.name}
          </label>
        </div>
      </>
    );
  }
);

const SimilarTagNameGroup: NextPage<{ items: Tag[] }> = observer(
  ({ items }) => {
    const slicedItems = items.slice(0, 5);
    return (
      <div className={`${profileStyles["tags__content"]}`}>
        {slicedItems.map((item, key) => (
          <SimilarTagName item={item} key={key} />
        ))}
      </div>
    );
  }
);

const SimilarTagName: NextPage<{ item: Tag }> = observer(({ item }) => {
  const { profileStore } = useStores();
  return (
    <>
      <div
        id={"tag__item"}
        className={`${profileStyles["tag__item"]} typography__text--small`}
        onClick={async (e) => {
          const text = e.target as HTMLElement;
          (document.getElementById("tags") as HTMLInputElement).value = "";
          await profileStore.onChangeTagInput(text.textContent!);
          await profileStore.enterTag(text.textContent!);
          profileStore.setTagDropDownHidden(true);
        }}
      >
        <label>{item.name}</label>
      </div>
    </>
  );
});

const IntroduceForm: NextPage<{
  setChanged: (changed: boolean) => void;
}> = observer(({ setChanged }) => {
  const { profileStore } = useStores();
  useEffect(() => {
    (document.getElementById("nickName") as HTMLInputElement).value =
      profileStore.nickName ? profileStore.nickName : "";
    (document.getElementById("introduce") as HTMLInputElement).value =
      profileStore.introduce ? profileStore.introduce : "";
  }, [profileStore.nickName, profileStore.introduce]);
  return (
    <div
      className={`${profileStyles["nickname-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
    >
      <div className={`${profileStyles["title"]}`}>
        <span className="material-symbols-sharp">text_snippet</span>
        <label className={"typography__text--big"}>닉네임 및 자기소개</label>
      </div>
      <div className={`${profileStyles["nickname"]} `}>
        <label className={"typography__caption"}>닉네임</label>
        <input
          id={"nickName"}
          type={"text"}
          className={"typography__text--small"}
          onChange={(e) => {
            profileStore.onChanged(e);
            setChanged(true);
          }}
          maxLength={20}
        />
        {profileStore.editNameErrorMessage ? (
          <label
            className={`${profileStyles["nickname__error"]} typography__caption`}
          >
            {profileStore.editNameErrorMessage}
          </label>
        ) : (
          <label className={"typography__caption"}>
            다른 농부들에게 표시되는 닉네임입니다
          </label>
        )}
      </div>
      <div className={`${profileStyles["introduce"]} `}>
        <label className={"typography__caption"}>자기소개</label>
        <input
          id={"introduce"}
          type={"text"}
          className={"typography__text--small"}
          onChange={(e) => {
            profileStore.onChanged(e);
            setChanged(true);
          }}
          maxLength={100}
        />
        <label className={"typography__caption"}>
          나를 나타낼 수 있는 소개 내용을 입력해주세요
        </label>
      </div>
    </div>
  );
});

const OrganizationForm: NextPage = observer(() => {
  const { organizationStore, userStore } = useStores();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const debounceSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    organizationStore.onChangeNameInput(debounceSearch);
  }, [debounceSearch]);

  useEffect(() => {
    if (!userStore.currentUser) return;
    organizationStore.fetchBelongOrganizations();
    if (inputRef.current) {
      inputRef.current.addEventListener("focus", () => {
        organizationStore.setDropDownHidden(false);
      });
      inputRef.current.addEventListener("blur", () => {
        setTimeout(() => organizationStore.setDropDownHidden(true), 100);
      });
    }
  }, [userStore.currentUser]);

  useEffect(() => {
    const content = document.querySelector<HTMLDivElement>(
      `.${profileStyles["organization__content"]}`
    );

    if (!content) return;

    if (organizationStore.dropDownHidden) {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  }, [organizationStore.dropDownHidden]);

  return (
    <div
      className={`${profileStyles["organization-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
    >
      <div className={`${profileStyles["title"]}`}>
        <span className="material-symbols-sharp">business_center</span>
        <label className={"typography__text--big"}>소속</label>
      </div>
      <div
        className={`${profileStyles["belong__title"]} typography__text--small`}
      >
        <label>현재 설정된 조직</label>
      </div>
      <BelongOrganizationsNameGroup
        items={
          organizationStore.belongOrganizations
            ? organizationStore.belongOrganizations
            : []
        }
      />
      <div className={`${profileStyles["organization__name"]} `}>
        <label
          className={`${profileStyles["organization__subtitle"]} typography__caption`}
        >
          소속명
        </label>
        <input
          type={"text"}
          id={"organization__input"}
          className={"typography__text--small"}
          ref={inputRef}
          onChange={async (e) => {
            setSearchInput(e.target.value);
          }}
        />
        {organizationStore.recommendOrganizations.length !== 0 && (
          <RecommendedOrganizationsNameGroup
            items={organizationStore.recommendOrganizations}
          />
        )}

        <label
          className={`${profileStyles["organization__subtitle"]} typography__caption`}
        >
          소속된 학교/회사 등을 검색해주세요
        </label>
      </div>
      <div className={`${profileStyles["email"]}`}>
        <label className={"typography__caption"}>이메일</label>
        <input
          type={"text"}
          className={"typography__text--small"}
          onChange={(e) => {
            organizationStore.onChangeEmailInput(e.target.value);
          }}
        />
        <label className={"typography__caption"}>
          소속된 학교/회사의 이메일 주소를 입력해주세요
        </label>
        {organizationStore.successMessage ? (
          <label
            className={`${profileStyles["organization__success"]} typography__caption`}
          >
            {organizationStore.successMessage}
          </label>
        ) : (
          <label
            className={`${profileStyles["organization__error"]} typography__caption`}
          >
            {organizationStore.errorMessage}
          </label>
        )}
      </div>
      <button
        className={`${profileStyles["add-button"]}`}
        onClick={() => {
          organizationStore.sendOrganizationVerifyEmail();
        }}
        disabled={
          organizationStore.checkTypedName &&
          !organizationStore.emailVerityButtonDisable
            ? false
            : true
        }
      >
        <span className="material-symbols-sharp">add</span>
        <label className={"typography__text"}>소속 등록하기</label>
      </button>
    </div>
  );
});

const TagForm: NextPage = observer(() => {
  const { profileStore } = useStores();
  const [searchInput, setSearchInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const debounceSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    console.log(debounceSearch);
    profileStore.onChangeTagInput(debounceSearch);
  }, [debounceSearch]);

  useEffect(() => {
    if (tagInputRef.current) {
      tagInputRef.current.addEventListener("focus", () => {
        profileStore.setTagDropDownHidden(false);
      });
      tagInputRef.current.addEventListener("blur", () => {
        setTimeout(() => profileStore.setTagDropDownHidden(true), 100);
      });
    }
  }, []);

  useEffect(() => {
    const content = document.querySelector<HTMLDivElement>(
      `.${profileStyles["tags__content"]}`
    );
    if (!content) return;
    if (profileStore.tagDropDownHidden) {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  }, [profileStore.tagDropDownHidden]);

  return (
    <div
      className={`${profileStyles["tag-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
    >
      <div className={`${profileStyles["title"]}`}>
        <span className="material-symbols-outlined">tag</span>
        <label className={"typography__text--big"}>관심분야</label>
      </div>
      <div className={`${profileStyles["tag__title"]} typography__text--small`}>
        <label>현재 설정된 관심분야</label>
      </div>

      {profileStore.tags && <TagNameGroup items={profileStore.tags} />}
      <div className={`${profileStyles["tag__name"]} `}>
        <label
          className={`${profileStyles["tag__subtitle"]} typography__caption`}
        >
          관심 관심분야 태그
        </label>
        <input
          type={"text"}
          id={"tags"}
          autoComplete={"off"}
          ref={tagInputRef}
          className={"typography__text--small"}
          placeholder="#수능, #개발, #공시 등 검색해주세요"
          maxLength={21}
          onKeyUp={async (e) => {
            let key = e.key || e.keyCode;
            if (key === "Enter" || key === 13) {
              await profileStore.enterTag(searchInput);
              (document.getElementById("tags") as HTMLInputElement).value = "";
              profileStore.setTagDropDownHidden(true);
              profileStore.onChangeTagInput("");
              profileStore.initRecommendTags();
              setSearchInput("");
            }
          }}
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          disabled={!profileStore.isTagInputDisable}
        />
        {profileStore.recommendTags.length !== 0 && (
          <SimilarTagNameGroup items={profileStore.recommendTags} />
        )}
        {profileStore.tagUpdateSuccessMessage === "" ? (
          profileStore.tagUpdateErrorMessage === "" ? (
            <label
              className={`${profileStyles["tag__caution"]} typography__caption`}
            >
              태그는 최대 3개까지 설정 가능합니다
            </label>
          ) : (
            <label
              className={`${profileStyles["tag__error"]} typography__caption`}
            >
              {profileStore.tagUpdateErrorMessage}
            </label>
          )
        ) : (
          <label
            className={`${profileStyles["tag__success"]} typography__caption`}
          >
            {profileStore.tagUpdateSuccessMessage}
          </label>
        )}
      </div>

      <button
        className={`${profileStyles["edit-tag__button"]}`}
        onClick={() => {
          profileStore.saveTagsButtonOnClick();
        }}
        disabled={
          profileStore.unsavedTags.length === 0 &&
          profileStore.deletedTags.length === 0
        }
      >
        <label className={"typography_장_text"}>태그 저장하기</label>
      </button>
    </div>
  );
});

const UserProfile: NextPage = observer(() => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { userStore, roomListStore, profileStore } = useStores();
  const [changed, setChanged] = useState<boolean>(false);

  useEffect(() => {
    if (!userStore.currentUser) return;
    profileStore.getUserProfile(userStore.currentUser.id);
  }, [userStore.currentUser]);

  useEffect(() => {
    if (!userStore.currentUser) return;
    if (profileStore.editSuccess === true) {
      setChanged(false);
      userStore.fetchCurrentUser(userStore.currentUser.id);
      profileStore.getUserProfile(userStore.currentUser.id);
    }
  }, [profileStore.editSuccess]);

  useEffect(() => {
    if (!profileStore.userOverview) return;
    if (
      profileStore.nickName === profileStore.userOverview.name &&
      profileStore.introduce === profileStore.userOverview.introduce
    ) {
      setChanged(false);
    }
  }, [profileStore.nickName, profileStore.introduce]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (!user) {
    router.replace("/login");
    return <div>Please sign in to continue</div>;
  }

  return (
    <>
      <Layout>
        <div className={`${profileStyles["page-form"]}`}>
          <div className={`${profileStyles["page-title"]}`}>
            <label
              className={`${profileStyles["title"]} typography__sub-headline`}
            >
              내 프로필
            </label>
            <div
              id={"saveButton"}
              className={`${
                profileStyles[
                  `save-button${
                    changed && profileStore.editNameErrorMessage === undefined
                      ? ""
                      : "--disabled"
                  }`
                ]
              } typography__text`}
              onClick={() => {
                profileStore.updateProfileImage();
                profileStore.updateProfile();
              }}
            >
              <label>프로필 변경사항 저장하기</label>
            </div>
            <div
              id={"undoButton"}
              className={`${
                profileStyles[`undo-button${changed ? "" : "--disabled"}`]
              } typography__text`}
              onClick={() => {
                profileStore.undoProfile();
                setChanged(false);
              }}
            >
              <label>되돌리기</label>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                className={`${profileStyles["profile-image-form"]} elevation__card__search-bar__contained-button--waiting__etc`}
              >
                <div className={`${profileStyles["title"]}`}>
                  <span className="material-symbols-sharp">image</span>
                  <label className={"typography__text--big"}>프로필 사진</label>
                </div>

                <div className={`${profileStyles["image-upload"]}`}>
                  {!profileStore.imageUrl ? (
                    <div className={`${profileStyles["image"]}`}></div>
                  ) : (
                    <Image
                      className={`${profileStyles["image"]}`}
                      alt={"selected-img"}
                      src={profileStore.imageUrl}
                      width={152}
                      height={152}
                    />
                  )}
                  <div className={`${profileStyles["precautions"]}`}>
                    <label className={"typography__text--small"}>
                      이런 프로필 사진은 안돼요
                    </label>
                    <ul className={"typography__caption"}>
                      <li>&nbsp;· &nbsp; 타인에게 불쾌감을 줄 수 있는 사진</li>
                      <li>&nbsp;· &nbsp; 5mb을 초과하는 용량의 이미지</li>
                      <li>&nbsp;· &nbsp; 자기 자신이 아닌 타인의 사진 도용</li>
                      <li>&nbsp;· &nbsp; 그 외 부적절하다고 판단되는 사진</li>
                    </ul>
                    <div className={`${profileStyles["image-upload-button"]}`}>
                      <input
                        id="roomThumbnail"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => {
                          if (e.target.files) {
                            profileStore.importProfileImage(e.target.files[0]);
                            setChanged(true);
                          }
                        }}
                        hidden
                      />
                      <div
                        onClick={() => {
                          document.getElementById("roomThumbnail")!.click();
                        }}
                      >
                        <span className="material-symbols-sharp">image</span>
                        <label className={"typography__text"}>
                          사진 업로드하기
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <IntroduceForm setChanged={setChanged} />
            </div>

            <OrganizationForm />
            <TagForm />
          </div>
        </div>
      </Layout>
      <style jsx>
        {`
          .material-symbols-sharp {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48;
          }
        `}
      </style>
    </>
  );
});

export default UserProfile;
