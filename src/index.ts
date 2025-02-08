import { updateDocument, createDocument } from './API/Firebase/firestore';
import { executeStoredProcedure } from './API/SQL/SQL.API';
import { mapProductChangesToProduct, Product, ProductChangesResult } from './interfaces/Product';

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
			return createDocument<Product>(product.codigoProducto, 'products', product);
		});

		const results = await Promise.allSettled(updatePromises);

		console.log(`${results.filter((result) => result.status === 'fulfilled').length} products imported successfully`);
		console.log(`${results.filter((result) => result.status === 'rejected').length} products failed to import`);
		console.log('Total Results:', results.length);
	} catch (error) {
		console.error('Error:', error);
	}
}

ProductUpdateProcessSequence();
//importAllProducts();

