<p align="center"><img src="https://github.com/Foundy-LLC/camstudy-web/assets/56541313/c64b25b1-1df9-4550-88b0-eab7f2fad6a2" height="40px"></p>

<div align="center">  
  
  [![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FFoundy-LLC%2Fcamstudy-web&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)  
  
</div>  

# camstudy_web  

캠 스터디 서비스인 "공부하는 농부"의 웹 서비스 입니다. Next.js와 Typescript로 구현되었으며 node.js를 이용해 구축된 api 서버를 포함하고 있습니다. ([API 명세서](https://www.notion.so/siroo/API-d29bb558f5d648ef850160cf9ea78845?pvs=4)를 참고)
공부하는 농부 서비스는 공부방, 작물 심기, 랭킹 기능을 포함하고 있으며 이를 통해 동기 부여 증진을 기대할 수 있습니다.  

공부방에서는 [미디어 서버](https://github.com/Foundy-LLC/camstudy-webrtc-server)를 통해 상대방과 미디어 통신을 합니다. WebRTC 라이브러리인 mediasoup을 이용하여 공부방 기능을 개발했습니다. Mesh 구조의 경우 피어가 3명 이상이 되면 클라이언트의 부하가 심해지기 때문에 P2P로 개발하지 않고 SFU 방식으로 개발했습니다.
<br/>
<br/>  

# 셋업 
- firebase에 프로젝트를 생성, 필요한 키 값(apiKey, authDomain, projectId, 등)을 firebase.ts 파일의 `firebaseConfig`에 대입해준다.
- Prisma에 DB를 연결하기 위한 URL 값을 env에 `DATABASE_URL`로 추가해준다.
- Naver Object Storage 연결을 위한 환경 변수를 env에 추가해준다.
- 소속 이메일 전송을 위한 mailgun의 `Domain URL`과 `API key`를 env에 추가해준다.  
<br/>  

# 실행 방법
- 터미널 창에 `npm run build`를 입력해 빌드해준뒤, `npm run start`로 실행
<br/>  

# 기술
- React, Next.js
- firebase
- Mobx
- Prisma
- Mediasoup, Socket.io
- mailgun, multer
- ts-mockito
<br/>  

# 스크린샷
- 홈 화면  
  
<img src="https://github.com/Foundy-LLC/camstudy-web/assets/56541313/0c716d7d-4586-4422-bc4e-bc370af4fe7b"  height="600px">  
<br/>
<br/>  

- 공부방 화면  
<img src="https://github.com/Foundy-LLC/camstudy-web/assets/56541313/67d3430a-061f-4699-bfcf-8a9d1b1723c9"  height="600px">  
<br/>
<br/>  

- 작물 관리 화면  
  
<img src="https://github.com/Foundy-LLC/camstudy-web/assets/56541313/8bd11760-259d-4cc1-8791-94160d7b1b8d"  height="600px">  
<br/>
<br/>  

- 랭킹 화면  
  
<img src="https://github.com/Foundy-LLC/camstudy-web/assets/56541313/52cc7808-48f1-4351-a5f1-bdc968d54e82"  height="600px">  
