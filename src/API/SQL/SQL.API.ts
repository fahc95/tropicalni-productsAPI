import * as sql from 'mssql';
import config from '../../config/sql.config.json';
import { findStringWithKey } from '../../helpers/utils.helpers';
import { Product } from '../../interfaces/Product';

export async function fetchDataFromSQL(imagesURLs: Array<string>): Promise<Product[]> {
	try {
		await sql.connect(config);
		const { recordset } = await sql.query`EXEC GetProductsDataWebApp`;
		const mappedData: Product[] = recordset.map((item: Product) => {
			item.codigoProducto = item.codigoProducto.trim();

			if (!item.imageURL) {
				//Please check what is happning when saving images of products with this chars
				const URL = findStringWithKey(imagesURLs, item.codigoProducto.replace("/", " "));
				item.imageURL = URL ?? null;
				return item;
			}		

			return item;
		});
		return mappedData;
	} catch (err) {
		console.error('SQL error', err);
		throw err;
	}
}
