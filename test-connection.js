// Quick test script to verify SQL Server connection
// Run with: node test-connection.js

import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
  server: process.env.SQL_SERVER_HOST || 'localhost',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  database: process.env.SQL_SERVER_DATABASE || 'SampleDB',
  user: process.env.SQL_SERVER_USER || 'sa',
  password: process.env.SQL_SERVER_PASSWORD || 'YourStrong@Passw0rd',
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

async function testConnection() {
  try {
    console.log('Attempting to connect to SQL Server...');
    console.log(`Server: ${sqlConfig.server}:${sqlConfig.port}`);
    console.log(`Database: ${sqlConfig.database}`);
    console.log(`User: ${sqlConfig.user}`);
    
    const pool = await sql.connect(sqlConfig);
    console.log('✓ Connected successfully!');
    
    // Test query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('\nSQL Server Version:');
    console.log(result.recordset[0].version);
    
    // List databases
    const dbResult = await pool.request().query('SELECT name FROM sys.databases');
    console.log('\nAvailable Databases:');
    dbResult.recordset.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // Test sample database
    if (sqlConfig.database) {
      const tableResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      console.log(`\nTables in ${sqlConfig.database}:`);
      tableResult.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }
    
    await pool.close();
    console.log('\n✓ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

