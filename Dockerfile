FROM node:20.19.5-bookworm-slim

# Work at /app for copy steps
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends git jq procps ripgrep curl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

ARG CODEX_VERSION=0.94.0

# Install Codex CLI globally for the devcontainer
RUN npm i -g @openai/codex@${CODEX_VERSION}

# Install deps using the web/ package files
COPY web/package*.json ./web/
RUN cd web && npm ci

# Needed by predev sync script
COPY ai.txt llms.txt ./

# Copy the app source
COPY web ./web

# Run from the app directory
WORKDIR /app/web
EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
