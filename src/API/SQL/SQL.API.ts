import * as sql from 'mssql';
import { getConnectionPool } from './pool';

export interface StoredProcedureParameter {
	name: string;
	type:
		| sql.ISqlTypeFactoryWithNoParams
		| sql.ISqlTypeFactoryWithLength
		| sql.ISqlTypeFactoryWithScale
		| sql.ISqlTypeFactoryWithPrecisionScale;
	value: any;
}

/**
 * Executes a stored procedure with optional parameters.
 * @param procedureName - The name of the stored procedure.
 * @param params - An optional array of parameters for the stored procedure.
 * @returns The recordset returned from executing the stored procedure.
 */
async function executeStoredProcedure<T>(procedureName: string, params?: StoredProcedureParameter[]): Promise<T> {
	try {
		const pool = await getConnectionPool();
		const request = pool.request();

		// If parameters are provided, add each one to the request.
		if (params) {
			params.forEach((param) => {
				request.input(param.name, param.type, param.value);
			});
		}

		const result = await request.execute(procedureName);
		console.log(`Executed ${procedureName} successfully`);
		return result.recordset as T;
	} catch (err) {
		console.error('SQL error', err);
		throw err;
	}
}

export { executeStoredProcedure };
