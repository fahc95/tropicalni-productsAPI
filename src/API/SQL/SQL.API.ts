import * as sql from 'mssql';
import config from '../../config/sql.config.json';
import { findStringWithKey } from '../../helpers/utils.helpers';
import { Product } from '../../interfaces/Product';

export async function fetchDataFromSQL(imagesURLs: Array<string>): Promise<Product[]> {
	console.time('fetchDataFromSQL took');
	try {
		await sql.connect(config);
		const result = await sql.query`EXEC GetProductosData`;
		const mappedData: Product[] = result.recordset.map((item: Product) => {
			if (!item.imageURL) {
				const URL = findStringWithKey(imagesURLs, item.codigoProducto);
				item.imageURL = URL ?? null;
				return item;
			}
			return item;
		});
		console.timeEnd('fetchDataFromSQL took');
		return mappedData;
	} catch (err) {
		console.error('SQL error', err);
		throw err;
	}
}
