# Usa una imagen de Node.js como base
FROM node:20

# Define el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto
COPY package*.json ./
RUN npm install

COPY . .

# Expón el puerto 3000
EXPOSE 3000

# Comando para iniciar la API
CMD ["npm", "start"]

