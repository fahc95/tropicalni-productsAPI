import * as sql from 'mssql';
import config from '../../config/sql.config.json';

async function executeStoredProcedure<T>(procedureName: string): Promise<T> {
	try {
		await sql.connect(config);
		const request = new sql.Request();
		const result = await request.execute(procedureName);
		console.log(`Executed ${procedureName} successfully`);
		return result.recordset as T;
	} catch (err) {
		console.error('SQL error', err);
		throw err;
	}
}

export { executeStoredProcedure };
