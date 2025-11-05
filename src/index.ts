#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SQL Server configuration
const sqlConfig: sql.config = {
  server: process.env.SQL_SERVER_HOST || 'localhost',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  database: process.env.SQL_SERVER_DATABASE || 'SampleDB',
  user: process.env.SQL_SERVER_USER || 'sa',
  password: process.env.SQL_SERVER_PASSWORD || 'devPass@2025',
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

// Create MCP server
const server = new Server(
  {
    name: 'mcp-sqlserver-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Database connection pool
let pool: sql.ConnectionPool | null = null;

async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(sqlConfig);
    console.error('Connected to SQL Server');
  }
  return pool;
}

// Define available tools
const tools: Tool[] = [
  {
    name: 'execute_query',
    description: 'Execute a SQL query and return results. Use for SELECT queries to retrieve data.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute (SELECT only)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_table_schema',
    description: 'Get the schema/structure of a table including column names, types, and constraints',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to get schema for',
        },
      },
      required: ['tableName'],
    },
  },
  {
    name: 'list_tables',
    description: 'List all tables in the database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_table_stats',
    description: 'Get statistics about a table including row count and column information',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to get statistics for',
        },
      },
      required: ['tableName'],
    },
  },
  {
    name: 'execute_insert',
    description: 'Insert data into a table. Returns the inserted row ID if available.',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to insert into',
        },
        data: {
          type: 'object',
          description: 'Object with column names as keys and values to insert',
        },
      },
      required: ['tableName', 'data'],
    },
  },
  {
    name: 'execute_update',
    description: 'Update data in a table. Returns the number of affected rows.',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to update',
        },
        data: {
          type: 'object',
          description: 'Object with column names as keys and new values',
        },
        where: {
          type: 'object',
          description: 'Object with column names as keys and values for WHERE clause',
        },
      },
      required: ['tableName', 'data', 'where'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const connection = await getConnection();

    switch (name) {
      case 'execute_query': {
        const query = args?.query as string;
        if (!query) {
          throw new Error('Query parameter is required');
        }

        // Security: Only allow SELECT queries
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
          throw new Error('Only SELECT queries are allowed for security reasons');
        }

        const result = await connection.request().query(query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  rows: result.recordset,
                  rowCount: result.recordset.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list_tables': {
        const result = await connection
          .request()
          .query(`
            SELECT 
              TABLE_SCHEMA as schema_name,
              TABLE_NAME as table_name
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_SCHEMA, TABLE_NAME
          `);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tables: result.recordset,
                  count: result.recordset.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_table_schema': {
        const tableName = args?.tableName as string;
        if (!tableName) {
          throw new Error('tableName parameter is required');
        }

        const result = await connection
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT 
              COLUMN_NAME as column_name,
              DATA_TYPE as data_type,
              CHARACTER_MAXIMUM_LENGTH as max_length,
              IS_NULLABLE as is_nullable,
              COLUMN_DEFAULT as default_value,
              ORDINAL_POSITION as position
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
            ORDER BY ORDINAL_POSITION
          `);

        // Get primary key information
        const pkResult = await connection
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT 
              COLUMN_NAME as column_name
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = @tableName
              AND CONSTRAINT_NAME LIKE 'PK_%'
            ORDER BY ORDINAL_POSITION
          `);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tableName,
                  columns: result.recordset,
                  primaryKeys: pkResult.recordset.map((r: any) => r.column_name),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_table_stats': {
        const tableName = args?.tableName as string;
        if (!tableName) {
          throw new Error('tableName parameter is required');
        }

        // Get row count
        const countResult = await connection
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`SELECT COUNT(*) as row_count FROM [${tableName}]`);

        // Get column information
        const columnResult = await connection
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT 
              COLUMN_NAME as column_name,
              DATA_TYPE as data_type,
              IS_NULLABLE as is_nullable
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
            ORDER BY ORDINAL_POSITION
          `);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  tableName,
                  rowCount: countResult.recordset[0].row_count,
                  columns: columnResult.recordset,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'execute_insert': {
        const tableName = args?.tableName as string;
        const data = args?.data as Record<string, any>;
        if (!tableName || !data) {
          throw new Error('tableName and data parameters are required');
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `@val${i}`).join(', ');

        const request = connection.request();
        columns.forEach((col, i) => {
          request.input(`val${i}`, data[col]);
        });

        const query = `
          INSERT INTO [${tableName}] (${columns.map((c) => `[${c}]`).join(', ')})
          OUTPUT INSERTED.*
          VALUES (${placeholders})
        `;

        const result = await request.query(query);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  insertedRow: result.recordset[0],
                  rowCount: result.rowsAffected[0],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'execute_update': {
        const tableName = args?.tableName as string;
        const data = args?.data as Record<string, any>;
        const where = args?.where as Record<string, any>;
        if (!tableName || !data || !where) {
          throw new Error('tableName, data, and where parameters are required');
        }

        const setClause = Object.keys(data)
          .map((col, i) => `[${col}] = @setVal${i}`)
          .join(', ');
        const whereClause = Object.keys(where)
          .map((col, i) => `[${col}] = @whereVal${i}`)
          .join(' AND ');

        const request = connection.request();
        Object.keys(data).forEach((col, i) => {
          request.input(`setVal${i}`, data[col]);
        });
        Object.keys(where).forEach((col, i) => {
          request.input(`whereVal${i}`, where[col]);
        });

        const query = `
          UPDATE [${tableName}]
          SET ${setClause}
          WHERE ${whereClause}
        `;

        const result = await request.query(query);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  rowsAffected: result.rowsAffected[0],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error.message || 'Unknown error occurred',
              details: error.toString(),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP SQL Server server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

