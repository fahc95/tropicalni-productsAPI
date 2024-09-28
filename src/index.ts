import { getAzureBlobURLs } from './API/Azure/azureBlobService.API';
import { saveDataToFirestore } from './API/Firebase/firestore.API';
import { fetchDataFromSQL } from './API/SQL/SQL.API';
import { findDuplicatesByCode } from './helpers/utils.helpers';
import { Product } from './interfaces/Product';

async function main(): Promise<void> {
	try {
		console.time('Job Took');
		const azureBlobPathList = await getAzureBlobURLs();
		const data: Product[] = await fetchDataFromSQL(azureBlobPathList);

		if (!data) {
			console.error('No data fetched from SQL');
			return;
		}

		const products: Product[] = data.filter((item) => item.imageURL != null);
		//const duplicates = findDuplicatesByCode(products, "codigoProducto");
		//console.log('duplicates: ', duplicates);
		console.log(`${data.length} total products`);
		console.log(`${products.length} products with images`);
		console.log(`${data.filter((item) => item.imageURL == null).length} products without images`);
		console.log(`${data.length} total products`);
		console.log('-----------------------------------------');

		await saveDataToFirestore('products', data);
		console.timeLog('Job Took');
	} catch (error) {
		console.error('Error importing data to Firestore:', error);
	}
}

main();
