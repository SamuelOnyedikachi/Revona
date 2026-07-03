FROM node:20-alpine

WORKDIR /app

# Install deps first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
