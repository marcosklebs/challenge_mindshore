# Imagen base: Node 20 sobre Debian ("slim", más liviana que la completa
# pero sin los problemas de compatibilidad de OpenSSL que tiene "alpine"
# con el motor de Prisma).
FROM node:20-slim

WORKDIR /app

# Prisma necesita openssl instalado en el sistema operativo de la imagen
# para poder conectarse a la base de datos.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiamos primero solo el package.json (no todo el código) para que Docker
# pueda "cachear" el paso de npm install: si después cambiás un archivo de
# código pero no las dependencias, este paso no se vuelve a ejecutar.
COPY package*.json ./
RUN npm install

# Ahora sí copiamos el resto del código
COPY . .

# Genera el cliente de Prisma dentro de la imagen (necesario para que
# funcione, ya que node_modules se instaló DENTRO del contenedor)
RUN npx prisma generate

# Compila TypeScript a JavaScript
RUN npm run build

EXPOSE 4000

# Al arrancar el contenedor: primero aplicamos las migraciones pendientes
# contra la base de datos (a diferencia de "migrate dev", "migrate deploy"
# no pide confirmación y es seguro correrlo en un entorno automatizado),
# y recién después arrancamos el servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
