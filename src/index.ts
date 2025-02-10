import { createDocument, updateDocument } from './API/Firebase/firestore';
import { executeStoredProcedure, StoredProcedureParameter } from './API/SQL/SQL.API';
import { logPromisesResults } from './helpers/utils.helpers';
import { mapProductChangesToProduct, Product, ProductChangesResult } from './interfaces/Product';
import { SalesByMonthResult, SalesDocument } from './interfaces/Sale';
import { startScheduler } from './scheduler';
import * as sql from 'mssql';

async function ProductUpdateProcessSequence(): Promise<void> {
	try {
		await executeStoredProcedure<void>('TakeProductSnapshot');
		const changes = await executeStoredProcedure<ProductChangesResult[]>('CompareFirstAndLastProductSnapshots');

		if (changes.length < 1) {
			console.log('No changes found');
			// await executeStoredProcedure<void>('UpdateSnapShotTable');
			return;
		}

		const productsToUpdate = changes.map((change) => mapProductChangesToProduct(change));

		const updatePromises = productsToUpdate.map((product) =>
			updateDocument<Partial<Product>>(product.codigoProducto!, 'products2', product)
		);

		const results = await Promise.allSettled(updatePromises);

		results.forEach((result, index) => {
			const productId = productsToUpdate[index].codigoProducto;
			if (result.status === 'fulfilled') {
				console.log(`Successfully updated product: ${productId}`);
			} else {
				console.error(`Failed to update product: ${productId}`, result.reason);
			}
		});
	} catch (error) {
		console.error('Error:', error);
	}
}

async function importAllProducts(): Promise<void> {
	try {
		const allProducts = await executeStoredProcedure<Product[]>('GetProductsDataWebApp');
		const updatePromises = allProducts.map((product) => {
			return createDocument<Product>(product.codigoProducto, 'products', product);
		});

		const results = await Promise.allSettled(updatePromises);
	} catch (error) {
		console.error('Error:', error);
	}
}

async function salesUpdateProcess(year: number): Promise<void> {
	try {
		const params: StoredProcedureParameter[] = [{ name: 'Year', type: sql.Int, value: year }];

		const sales = (await executeStoredProcedure<SalesByMonthResult[]>('GetMonthlySalesByYear', params)).map(
			(sale) => new SalesDocument(sale)
		);

		const updatePromises = sales.map((sale) => {
			return createDocument<SalesByMonthResult>(sale.id, 'sales', sale.dataTableResult);
		});

		const results = await Promise.allSettled(updatePromises);
		logPromisesResults(results);
	} catch (error) {
		console.error('Error:', error);
	}
}

// startScheduler(60, 8, ProductUpdateProcessSequence);

for (let index = 2015; index < 2018; index++) {
	salesUpdateProcess(index);
}
