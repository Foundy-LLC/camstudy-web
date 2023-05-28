FROM node:17.1.0

ARG PORT

ENV PORT=$PORT
ENV TZ="Asia/Seoul"

RUN apt-get -y update

WORKDIR /usr/src/app

COPY ./ ./

RUN npm install

RUN npm run build

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
