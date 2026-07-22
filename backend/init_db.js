const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    try {
        console.log('Connecting to MySQL Server (127.0.0.1:3306) with user root...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            ssl: process.env.NODE_ENV === 'production' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
            multipleStatements: true // VERY IMPORTANT for running SQL scripts
        });

        console.log('Successfully connected to MySQL Server!');

        // Ensure database exists
        const dbName = process.env.DB_NAME || 'abpharma_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`✅ Database '${dbName}' created or already exists.`);

        await connection.query(`USE \`${dbName}\`;`);

        // Read the SQL schema file
        const sqlFilePath = path.join(__dirname, 'config', 'database.sql');
        console.log(`Reading SQL from: ${sqlFilePath}`);
        const sqlSchema = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing database schema. This may take a moment...');
        await connection.query(sqlSchema);

        console.log('✅ Success! The AB Pharma database schema has been imported.');

        await connection.end();
        console.log('Connection closed. Database initialization is complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed to initialize database: ', err);
        process.exit(1);
    }
}

initDB();
