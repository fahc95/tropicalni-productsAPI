import { getAzureBlobURLs } from './API/Azure/azureBlobService.API';
import { saveDataToFirestore } from './API/Firebase/firestore.API';
import { fetchDataFromSQL } from './API/SQL/SQL.API';
import { Product } from './interfaces/Product';

async function main(): Promise<void> {
	try {
		const azureBlobPathList: Array<string> = await getAzureBlobURLs();
		console.log(`${azureBlobPathList.length} Azure Blobs`);
		console.log('-----------------------------------------');

		const data: Product[] = await fetchDataFromSQL(azureBlobPathList);

		if (!data) {
			console.error('No data fetched from SQL');
			return;
		}

		const products: Product[] = data.filter((item) => item.imageURL != null);
		console.log(`${data.length} total products`);
		console.log(`${products.length} products with images`);
		console.log(`${data.filter((item) => item.imageURL == null).length} products without images`);
		console.log('-----------------------------------------');

		await saveDataToFirestore('products', products);
	} catch (error) {
		console.error('Error importing data to Firestore:', error);
	}
}

main();
