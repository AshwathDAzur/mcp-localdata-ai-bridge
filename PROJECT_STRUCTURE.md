# Project Structure

This document describes all the files in the MCP SQL Server Server project.

## Root Directory Files

### Configuration Files
- **`package.json`** - Node.js project configuration with dependencies and scripts
- **`tsconfig.json`** - TypeScript compiler configuration
- **`docker-compose.yml`** - Docker Compose configuration for SQL Server
- **`.gitignore`** - Git ignore patterns
- **`.cursorrules`** - Cursor IDE rules (optional)

### Documentation
- **`README.md`** - Complete setup and usage guide
- **`QUICK_START.md`** - Quick reference guide for fast setup
- **`PROJECT_STRUCTURE.md`** - This file

### Setup & Configuration
- **`setup.ps1`** - PowerShell automation script for setup
- **`cursor-mcp-config.json`** - Example Cursor MCP configuration (reference)
- **`.env.example`** - Environment variables template (create `.env` from this)

### Source Code
- **`src/index.ts`** - Main MCP server implementation
- **`test-connection.js`** - Standalone script to test SQL Server connection

### Database Initialization
- **`init-db/01-init-sample-db.sql`** - SQL script that creates sample database, tables, and data

## Generated Files (After Build)

- **`dist/`** - Compiled JavaScript output (created by `npm run build`)
- **`node_modules/`** - NPM dependencies (created by `npm install`)
- **`.env`** - Your local environment variables (create from `.env.example`)

## Key Files Explained

### `src/index.ts`
The main MCP server implementation that:
- Connects to SQL Server
- Exposes 6 MCP tools (execute_query, list_tables, get_table_schema, etc.)
- Handles MCP protocol communication via stdio

### `docker-compose.yml`
Defines the SQL Server container with:
- SQL Server 2022 image
- Port 1433 exposed
- Automatic database initialization
- Volume for data persistence

### `init-db/01-init-sample-db.sql`
Creates:
- SampleDB database
- 4 tables: Customers, Products, Orders, OrderItems
- Sample data for testing

## Environment Variables

Create a `.env` file with:
```env
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DATABASE=SampleDB
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourStrong@Passw0rd
SQL_SERVER_ENCRYPT=false
```

## Typical Workflow

1. **Setup**: Run `npm install` and `setup.ps1` (or follow manual steps)
2. **Start SQL Server**: `docker-compose up -d`
3. **Build**: `npm run build`
4. **Test**: `npm test-connection` or `npm start`
5. **Configure Cursor**: Add MCP server to Cursor settings
6. **Use**: Ask questions in Cursor about your database!

## Next Steps

After setup, you can:
- Query data using natural language in Cursor
- Analyze database schema
- Get table statistics
- Insert and update data (through MCP tools)

See `README.md` for detailed instructions.

