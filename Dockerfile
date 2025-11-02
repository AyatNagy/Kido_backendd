FROM node:22.21-alpine

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

RUN npx prisma generate

RUN npx prisma migrate deploy

CMD npm run start