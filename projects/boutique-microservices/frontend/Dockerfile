# =============================================================================
# Frontend — multi-stage build
#
# The previous image shipped the full Node toolchain plus `serve` and every
# devDependency into the runtime layer. That is a large attack surface for
# what is ultimately a folder of static files. This builds with Node and
# serves with nginx, so the runtime image contains no build tooling at all.
# =============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# `npm install`, not `npm ci`: this is an npm workspace and the only lockfile
# lives at the workspace root, outside this build context. `npm ci` would fail
# with "no package-lock.json found". Generate a lockfile in frontend/ and
# switch to `npm ci` for reproducible builds.
RUN npm install

COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Runtime
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine

# Serve on 8080 rather than 80 so the process never needs the
# NET_BIND_SERVICE capability and can run as an unprivileged user.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

# The nginx:alpine image already contains the `nginx` user (uid 101). Give it
# ownership of the paths nginx must write to, so the container works with
# readOnlyRootFilesystem + emptyDir mounts.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
