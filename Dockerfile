FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm install pnpm -g

EXPOSE 3002

CMD ["pnpm", "dev"]
