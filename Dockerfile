FROM node:18-slim

# Install system dependencies required for Playwright
RUN apt-get update && apt-get install -y \
    wget curl gnupg ca-certificates fonts-liberation libappindicator3-1 \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    libgtk-3-0 libxshmfence1 libglu1 libdrm2 libgbm1 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npx playwright install --with-deps

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
