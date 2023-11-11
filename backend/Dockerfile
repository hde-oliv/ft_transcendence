FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN yarn
COPY . .
RUN yarn build

FROM node:lts

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

WORKDIR /root
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma/
# RUN npm rebuild bcrypt --update-binary

CMD [  "npm", "run", "start:prod" ]
