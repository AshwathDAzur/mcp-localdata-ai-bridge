# MCP SQL Server Server

A Model Context Protocol (MCP) server that provides tools to interact with SQL Server databases. This server allows Cursor and other MCP clients to query, analyze, and manage SQL Server data intelligently.

## Features

- **Execute SQL Queries**: Run SELECT queries safely to retrieve data
- **List Tables**: Discover all tables in the database
- **Get Table Schema**: Inspect table structure, columns, and data types
- **Get Table Statistics**: View row counts and column information
- **Insert Data**: Add new records to tables
- **Update Data**: Modify existing records

## Prerequisites

- Node.js v22.14.0 or higher
- Docker version 28.3.3 or higher
- SQL Server running in Docker (or access to an existing SQL Server instance)

## Step-by-Step Setup Guide

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@modelcontextprotocol/sdk` - MCP SDK for building the server
- `mssql` - SQL Server driver for Node.js
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution environment

### Step 2: Start SQL Server with Docker

The project includes a `docker-compose.yml` file that will automatically:
- Start SQL Server 2022
- Create the `SampleDB` database
- Create sample tables (Customers, Products, Orders, OrderItems)
- Insert sample data

**Start the SQL Server container:**

```bash
docker-compose up -d
```

**Verify the container is running:**

```bash
docker ps
```

You should see a container named `mcp-sqlserver` running.

**Wait for initialization:**
The database initialization script runs automatically. You can check the logs:

```bash
docker logs mcp-sqlserver
```

**Note:** The default password is `YourStrong@Passw0rd`. If you need to change it, update both `docker-compose.yml` and `.env` files.

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and ensure the connection details match your Docker setup:

```env
SQL_SERVER_HOST=localhost
SQL_SERVER_PORT=1433
SQL_SERVER_DATABASE=SampleDB
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourStrong@Passw0rd
SQL_SERVER_ENCRYPT=false
```

### Step 4: Build the MCP Server

Compile the TypeScript code:

```bash
npm run build
```

This creates the `dist/` directory with the compiled JavaScript.

### Step 5: Test the MCP Server

You can test the server manually to ensure it works:

```bash
npm start
```

The server will start and listen on stdio (standard input/output). Press Ctrl+C to stop.

### Step 6: Configure Cursor IDE

To use this MCP server in Cursor, you need to add it to Cursor's MCP configuration.

#### Option A: Using Cursor Settings UI

1. Open Cursor IDE
2. Go to **Settings** (Ctrl+,)
3. Search for "MCP" or "Model Context Protocol"
4. Click on "MCP Servers" or "Add MCP Server"
5. Add a new server with these settings:
   - **Name**: `sqlserver`
   - **Command**: `node`
   - **Args**: `["dist/index.js"]`
   - **Working Directory**: `C:\OrgProjects\SkillUps\ModelContextProtocol` (or your actual project path)
   - **Environment Variables**:
     - `SQL_SERVER_HOST=localhost`
     - `SQL_SERVER_PORT=1433`
     - `SQL_SERVER_DATABASE=SampleDB`
     - `SQL_SERVER_USER=sa`
     - `SQL_SERVER_PASSWORD=YourStrong@Passw0rd`
     - `SQL_SERVER_ENCRYPT=false`

#### Option B: Using Configuration File (Windows)

1. Navigate to Cursor's configuration directory:
   ```
   %APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\
   ```

2. Edit or create `cline_mcp_settings.json` and add:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["C:\\\\OrgProjects\\\\SkillUps\\\\ModelContextProtocol\\\\dist\\\\index.js"],
      "env": {
        "SQL_SERVER_HOST": "localhost",
        "SQL_SERVER_PORT": "1433",
        "SQL_SERVER_DATABASE": "SampleDB",
        "SQL_SERVER_USER": "sa",
        "SQL_SERVER_PASSWORD": "YourStrong@Passw0rd",
        "SQL_SERVER_ENCRYPT": "false"
      }
    }
  }
}
```

**Important:** Replace `C:\\OrgProjects\\SkillUps\\ModelContextProtocol` with your actual project path.

3. Restart Cursor IDE for changes to take effect.

### Step 7: Verify MCP Server in Cursor

1. **Restart Cursor** after adding the configuration
2. Open a chat in Cursor
3. Try asking questions like:
   - "List all tables in the database"
   - "Show me the schema of the Customers table"
   - "Get statistics for the Products table"
   - "Run a query to show all customers"
   - "Show me customers from New York"

The AI should now be able to use the MCP tools to interact with your SQL Server database!

## Available MCP Tools

### 1. `execute_query`
Execute a SELECT query to retrieve data.

**Example:**
```json
{
  "query": "SELECT TOP 10 * FROM Customers"
}
```

### 2. `list_tables`
List all tables in the database.

**Example:**
```json
{}
```

### 3. `get_table_schema`
Get the schema of a specific table.

**Example:**
```json
{
  "tableName": "Customers"
}
```

### 4. `get_table_stats`
Get statistics about a table (row count, columns).

**Example:**
```json
{
  "tableName": "Products"
}
```

### 5. `execute_insert`
Insert a new record into a table.

**Example:**
```json
{
  "tableName": "Customers",
  "data": {
    "FirstName": "John",
    "LastName": "Doe",
    "Email": "john.doe@example.com",
    "City": "Seattle"
  }
}
```

### 6. `execute_update`
Update existing records in a table.

**Example:**
```json
{
  "tableName": "Customers",
  "data": {
    "City": "Portland"
  },
  "where": {
    "CustomerID": 1
  }
}
```

## Sample Database Schema

The initialization script creates a sample e-commerce database with:

- **Customers**: Customer information
- **Products**: Product catalog
- **Orders**: Customer orders
- **OrderItems**: Order line items

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `tsx watch` to automatically recompile on file changes.

### Project Structure

```
.
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── init-db/              # SQL initialization scripts
│   └── 01-init-sample-db.sql
├── docker-compose.yml    # Docker setup for SQL Server
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Troubleshooting

### SQL Server Connection Issues

1. **Check if SQL Server is running:**
   ```bash
   docker ps
   ```

2. **Check SQL Server logs:**
   ```bash
   docker logs mcp-sqlserver
   ```

3. **Verify connection details** in `.env` match your Docker setup

4. **Test connection manually:**
   ```bash
   docker exec -it mcp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT @@VERSION"
   ```

### MCP Server Not Appearing in Cursor

1. **Verify the path** in the configuration is correct and absolute
2. **Check that the build succeeded:** `npm run build`
3. **Ensure the server starts without errors:** `npm start`
4. **Restart Cursor** after configuration changes
5. **Check Cursor's developer console** for MCP-related errors

### Permission Issues

- Ensure SQL Server credentials are correct
- Verify the database exists and is accessible
- Check that the SA password matches in both `docker-compose.yml` and `.env`

## Security Notes

- **Never commit `.env` files** to version control
- The `execute_query` tool only allows SELECT queries for security
- Use strong passwords in production
- Consider using environment-specific configurations

## Next Steps

- Explore the sample data using natural language queries in Cursor
- Try asking complex questions that require joins
- Add more tables or modify the schema as needed
- Extend the MCP server with additional tools for your use case

## License

MIT

