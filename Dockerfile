# Use Node.js 18 on Debian Bullseye (a newer version)
FROM node:18-bullseye

# Set working directory inside container
WORKDIR /app

# Install Linux dependencies required by Electron
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libx11-xcb1 \
    libxss1 \
    libasound2 \
    libnss3 \
    libxrandr2 \
    libxkbfile1 \
    libsecret-1-0 \
    ca-certificates \
    fonts-liberation \
    wget \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run Linux build
RUN npm run dist -- --linux

# Default command to confirm build
CMD ["echo", "Linux build finished"]