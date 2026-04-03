ARG NODE_VERSION=20.20.2
FROM node:${NODE_VERSION}-bookworm-slim@sha256:1e85773c98c31d4fe5b545e4cb17379e617b348832fb3738b22a08f68dec30f3

# Work at /app for copy steps
WORKDIR /app

ARG CODEX_VERSION=0.118.0
ARG PLAYWRIGHT_BROWSERS=chromium,webkit
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		ca-certificates \
		curl \
		fonts-freefont-ttf \
		fonts-ipafont-gothic \
		fonts-liberation \
		fonts-noto-color-emoji \
		fonts-tlwg-loma-otf \
		fonts-unifont \
		fonts-wqy-zenhei \
		git \
		gstreamer1.0-libav \
		gstreamer1.0-plugins-bad \
		gstreamer1.0-plugins-base \
		gstreamer1.0-plugins-good \
		iproute2 \
		jq \
		libasound2 \
		libatk-bridge2.0-0 \
		libatk1.0-0 \
		libatomic1 \
		libatspi2.0-0 \
		libavif15 \
		libcairo2 \
		libcups2 \
		libdbus-1-3 \
		libdrm2 \
		libegl1 \
		libenchant-2-2 \
		libepoxy0 \
		libevent-2.1-7 \
		libevdev2 \
		libfontconfig1 \
		libfreetype6 \
		libgbm1 \
		libgdk-pixbuf-2.0-0 \
		libgles2 \
		libglib2.0-0 \
		libglx0 \
		libgstreamer-gl1.0-0 \
		libgstreamer-plugins-base1.0-0 \
		libgstreamer1.0-0 \
		libgtk-4-1 \
		libgudev-1.0-0 \
		libharfbuzz-icu0 \
		libharfbuzz0b \
		libhyphen0 \
		libicu72 \
		libjpeg62-turbo \
		liblcms2-2 \
		libmanette-0.2-0 \
		libnotify4 \
		libnspr4 \
		libnss3 \
		libopenjp2-7 \
		libopengl0 \
		libopus0 \
		libpango-1.0-0 \
		libpng16-16 \
		libproxy1v5 \
		libsecret-1-0 \
		libsoup-3.0-0 \
		libvips \
		libwayland-client0 \
		libwayland-egl1 \
		libwayland-server0 \
		libwebp7 \
		libwebpdemux2 \
		libwoff1 \
		libx11-6 \
		libxcomposite1 \
		libxdamage1 \
		libxcb1 \
		libxext6 \
		libxfixes3 \
		libxkbcommon0 \
		libxml2 \
		libxrandr2 \
		libxslt1.1 \
		poppler-utils \
		procps \
		ripgrep \
		xfonts-scalable \
		xvfb \
	&& rm -rf /var/lib/apt/lists/*

# Install Codex CLI globally for the devcontainer
RUN npm i -g @openai/codex@${CODEX_VERSION} \
	&& npm cache clean --force

# Install deps using the web/ package files
COPY web/package*.json ./web/
RUN cd web \
	&& npm ci \
	&& npm cache clean --force

# Bake Playwright runtime dependencies and browsers into the image so e2e tests
# work in fresh devcontainers without manual install steps.
RUN mkdir -p "${PLAYWRIGHT_BROWSERS_PATH}" \
	&& cd web \
	&& set -- $(printf '%s' "${PLAYWRIGHT_BROWSERS}" | tr ',' ' ') \
	&& npm exec playwright install "$@"

# Needed by predev sync script
COPY ai.txt llms.txt ./

# Copy the app source
COPY web ./web

# Run from the app directory
WORKDIR /app/web
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD curl -fsS http://127.0.0.1:5173/ >/dev/null || exit 1

CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
