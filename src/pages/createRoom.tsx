import { NextPage } from "next";
import { observer } from "mobx-react";
import {
  CreateRoomDialog,
  CreateRoomDialogContainer,
} from "@/components/CreateStudyRoomDialog";
import React from "react";

const CreateRoom: NextPage = observer(() => {
  return (
    <>
      <CreateRoomDialogContainer onClick={() => {}} />
      <CreateRoomDialog />
    </>
  );
});

export default CreateRoom;
