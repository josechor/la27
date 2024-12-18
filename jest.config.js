const transform = {
    "^.+\\.[t|j]sx?$": "babel-jest", // Esto asegura que Jest transpile los archivos con Babel
};
const testEnvironment = "node";

export default { transform, testEnvironment };
