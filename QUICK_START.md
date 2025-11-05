# Quick Start Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
copy .env.example .env

# Or manually create .env with:
# SQL_SERVER_HOST=localhost
# SQL_SERVER_PORT=1433
# SQL_SERVER_DATABASE=SampleDB
# SQL_SERVER_USER=sa
# SQL_SERVER_PASSWORD=YourStrong@Passw0rd
# SQL_SERVER_ENCRYPT=false
```

### 3. Start SQL Server
```bash
docker-compose up -d
```

Wait ~30 seconds for initialization.

### 4. Build & Test
```bash
npm run build
npm start
```

Press Ctrl+C to stop.

### 5. Configure Cursor

Add to Cursor's MCP settings:

**Path:** `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Config:**
```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\OrgProjects\\SkillUps\\ModelContextProtocol",
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

**Update the `cwd` path to your actual project directory!**

### 6. Restart Cursor & Test

Restart Cursor, then try:
- "List all tables in the database"
- "Show me the Customers table schema"
- "Query all customers from New York"

## Troubleshooting

**SQL Server not starting?**
```bash
docker logs mcp-sqlserver
docker-compose down
docker-compose up -d
```

**Connection errors?**
- Verify SQL Server is running: `docker ps`
- Check password matches in `.env` and `docker-compose.yml`
- Test connection: `docker exec -it mcp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT 1"`

**MCP not working in Cursor?**
- Verify path is absolute and correct
- Ensure `npm run build` succeeded
- Restart Cursor completely
- Check Cursor's developer console for errors

