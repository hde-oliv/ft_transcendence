FROM node:lts AS builder
WORKDIR /app
COPY . .
RUN yarn install && yarn build

FROM node:lts
WORKDIR /root
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# RUN npm rebuild bcrypt --update-binary
RUN npm install pm2 -g
CMD ["production=true", "pm2-runtime", "dist/main.js"]
