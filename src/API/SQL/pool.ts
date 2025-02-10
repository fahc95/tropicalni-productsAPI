// dbPool.ts
import * as sql from 'mssql';
import config from '../../config/sql.config.json';

let pool: sql.ConnectionPool | null = null;

export const getConnectionPool = async (): Promise<sql.ConnectionPool> => {
	if (pool) {
		// Reuse the existing pool
		return pool;
	}
	// Create a new pool if one doesn't exist
	pool = await sql.connect(config);
	return pool;
};
