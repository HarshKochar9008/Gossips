FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npx nest build

EXPOSE 4000

CMD ["node", "dist/main"]
