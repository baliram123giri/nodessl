FROM node:latest

WORKDIR /home/api

COPY . .

EXPOSE 4000

RUN npm install

CMD ["node","index.js"]
