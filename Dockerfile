FROM node:20

# Work at /app for copy steps
WORKDIR /app

# Install Codex CLI globally for the devcontainer
RUN npm i -g @openai/codex@latest

# Install deps using the web/ package files
COPY web/package*.json ./web/
RUN cd web && npm install

# Copy the app source
COPY web ./web

# Run from the app directory
WORKDIR /app/web
EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]
