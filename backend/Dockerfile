FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npx tsc -p tsconfig.json
RUN cp -r src/generated dist/src/generated

EXPOSE 4000

CMD ["node", "dist/src/main"]
