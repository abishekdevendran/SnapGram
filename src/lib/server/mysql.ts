import { MYSQL_URI } from '$env/static/private';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  uri:MYSQL_URI
});

export default connection;
