import { create } from 'domain';
import { updateDocument } from './API/Firebase/firestore';
import { executeStoredProcedure } from './API/SQL/SQL.API';
import { mapProductChangesToProduct, Product, ProductChangesResult } from './interfaces/Product';
import cron from 'node-cron';

async function ProductUpdateProcessSequence(): Promise<void> {
	try {
		await executeStoredProcedure<void>('TakeProductSnapshot');
		const changes = await executeStoredProcedure<ProductChangesResult[]>('CompareFirstAndLastProductSnapshots');

		if (changes.length < 1) {
			console.log('No changes found');
			await executeStoredProcedure<void>('UpdateSnapShotTable');
			return;
		}

		const productsToUpdate = changes.map((change) => mapProductChangesToProduct(change));

		const updatePromises = productsToUpdate.map((product) => {
			return updateDocument<Partial<Product>>(product.codigoProducto!, 'products2', product);
		});

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
			return createDocument<Product>(product.codigoProducto!, 'products2', product);
		});

		const results = await Promise.allSettled(updatePromises);

		if (results.find((result) => result.status === 'rejected')) {
			console.error('Some products failed to import');
		} else {
			console.log('All products imported successfully');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

function createDocument<T>(arg0: string, arg1: string, product: Product): any {
	throw new Error('Function not implemented.');
}
// ProductUpdateProcessSequence();
