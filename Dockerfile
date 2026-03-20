FROM node:20.19.5-bookworm-slim

# Work at /app for copy steps
WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		git jq procps ripgrep curl ca-certificates libvips \
		libatk1.0-0 libatk-bridge2.0-0 libdbus-1-3 libcups2 libxkbcommon0 \
		libatspi2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
	&& rm -rf /var/lib/apt/lists/*

ARG CODEX_VERSION=0.94.0

# Install Codex CLI globally for the devcontainer
RUN npm i -g @openai/codex@${CODEX_VERSION}

# Install deps using the web/ package files
COPY web/package*.json ./web/
RUN cd web && npm ci

# Bake Playwright runtime dependencies and browsers into the image so e2e tests
# work in fresh devcontainers without manual install steps.
RUN cd web && npm exec playwright install --with-deps chromium webkit

# Needed by predev sync script
COPY ai.txt llms.txt ./

# Copy the app source
COPY web ./web

# Run from the app directory
WORKDIR /app/web
EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
