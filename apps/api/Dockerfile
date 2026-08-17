FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && if [ \"${SEED_DATABASE:-false}\" = \"true\" ]; then npx tsx prisma/seed.ts; fi && node dist/index.js"]
