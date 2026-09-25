# --- Etapa 1: compilar la app de React ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# La URL del backend se "hornea" adentro de los archivos estáticos en este
# paso (Vite reemplaza import.meta.env.VITE_API_URL por este valor literal
# al compilar). Por eso no alcanza con un .env en runtime, tiene que
# pasarse como ARG de build. Usamos localhost porque quien abre la página
# es el NAVEGADOR del usuario, que le pega directo al puerto publicado del
# backend en su propia máquina, no a la red interna de Docker.
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Etapa 2: servir los archivos ya compilados con nginx ---
# Usamos una imagen nueva y liviana solo para servir archivos estáticos,
# en vez de dejar todo Node.js instalado en la imagen final (que pesaría
# mucho más de lo necesario).
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
