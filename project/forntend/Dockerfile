# FROM node:18-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm install --legacy-peer-deps

# COPY . .
# RUN npm run build

# FROM node:18-alpine AS runner

# WORKDIR /app

# ENV NODE_ENV production

# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static

# EXPOSE 3000

# ENV PORT 3000
# ENV HOSTNAME "0.0.0.0"

# CMD ["node", "server.js"]


FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV development

# Use either of these commands:
CMD ["npm", "run", "dev"]
# Or
# CMD ["npx", "next", "dev", "--hostname", "0.0.0.0"]