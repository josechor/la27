import mysql from 'mysql2';

export const pool = mysql.createPool({
    host: 'database',
    user: 'user',
    password: 'userpassword',
    database: 'mi_base_de_datos',
    port: 3306
}).promise();
