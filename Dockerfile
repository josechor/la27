# Usa una imagen de Node.js como base
FROM node:20

# Define el directorio de trabajo
WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

# Copia los archivos del proyecto
COPY package*.json ./

RUN npm install -g nodemon


# Instala las dependencias (incluso las de desarrollo)
RUN npm install

# Copia el resto del código del proyecto
COPY . .

# Expón el puerto 3000
EXPOSE 3000
