FROM node:22-alpine

LABEL org.opencontainers.image.title="The Lounge Fork"
LABEL org.opencontainers.image.description="Docker image for The Lounge fork, a modern web IRC client designed for self-hosting."
LABEL org.opencontainers.image.licenses="MIT"

EXPOSE 9000
ENV THELOUNGE_HOME="/var/opt/thelounge"
ENV NODE_ENV="production"

# Install build dependencies (Python 3.12 needed for sqlite3 native module)
RUN apk --update --no-cache --virtual build-deps add python3 py3-setuptools build-base git yarn

# Copy source code
WORKDIR /app
COPY package.json yarn.lock ./
COPY server/ server/
COPY client/ client/
COPY shared/ shared/
COPY defaults/ defaults/
COPY index.js ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY webpack.config.ts ./
COPY babel.config.cjs ./
COPY postcss.config.js ./

# Install dependencies including dev deps for build, then build and clean up
RUN PYTHON=/usr/bin/python3 NODE_ENV=development yarn install --frozen-lockfile && \
    yarn build:server && \
    yarn build:client && \
    yarn install --production --frozen-lockfile && \
    yarn cache clean

# Clean up build dependencies but keep runtime deps
RUN apk del --purge build-deps && \
    rm -rf /root/.cache /tmp

# Create thelounge user directory
RUN install -d -o node -g node "${THELOUNGE_HOME}"
VOLUME "${THELOUNGE_HOME}"

USER node:node
ENTRYPOINT ["node", "index.js"]
CMD ["start"]
