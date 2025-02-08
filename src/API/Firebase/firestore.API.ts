import * as admin from 'firebase-admin';
import serviceAccount from '../../config/firebase.config.json';
import { Buffer } from 'buffer';
import { Product } from '../../interfaces/Product';
import { extractProductCodeFromUrl } from '../../helpers/utils.helpers';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const db = admin.firestore();

export async function saveDataToFirestore(collectionName: string, data: Product[]): Promise<void> {
	const collectionRef = db.collection(collectionName);
	try {
		const productsData = Buffer.from(JSON.stringify(data)).toString('base64');
		await collectionRef.add({ productsData, createdAt: new Date() });
		console.log('Filtered data imported successfully to Firestore.');
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function syncProductsToFirestore(products: Product[]) {
	try {
		const productsCollection = db.collection('products2');

		for (const product of products) {
			const docRef = productsCollection.doc(product.codigoProducto); // Using codigoProducto as the document ID

			const doc = await docRef.get();

			if (doc.exists) {
				// Update existing document
				await docRef.update({
					...product,
					updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Optional: track updates
				});
				console.log(`Updated product: ${product.codigoProducto}`);
			} else {
				// Create new document
				await docRef.set({
					...product,
					createdAt: admin.firestore.FieldValue.serverTimestamp(), // Optional: track creation
				});
				console.log(`Created product: ${product.codigoProducto}`);
			}
		}

		console.log('Synchronization complete.');
	} catch (error) {
		console.error('Error syncing products to Firestore:', error);
	}
}

export async function fetchDocumentsFromFirestore(
	collectionName: string
): Promise<Map<string, FirebaseFirestore.DocumentData>> {
	const documentSnap = await db.collection(collectionName).get();
	const firestoreProductsMap = new Map<string, FirebaseFirestore.DocumentData>();

	documentSnap.forEach((doc) => {
		firestoreProductsMap.set(doc.id, doc.data());
	});

	return firestoreProductsMap;
}

function hasProductChanged(sqlProduct: Product, firestoreProduct: FirebaseFirestore.DocumentData): boolean {
	// Simple deep comparison of fields - can be optimized further depending on the structure
	return JSON.stringify(sqlProduct) !== JSON.stringify(firestoreProduct);
}

// export async function syncProductsWithFirestoreOptimized(products: Product[]) {
// 	const firestoreProductsMap = await fetchProductsFromFirestore();

// 	for (const product of products) {
// 		const firestoreProduct = firestoreProductsMap.get(product.codigoProducto);

// 		if (firestoreProduct) {
// 			if (hasProductChanged(product, firestoreProduct)) {
// 				// Update only if the product has changed
// 				await db
// 					.collection('products2')
// 					.doc(product.codigoProducto)
// 					.update({ ...product, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
// 				console.log(`Updated product: ${product.codigoProducto}`);
// 			}
// 		} else {
// 			// Create a new document if it doesn't exist
// 			await db.collection('products2').doc(product.codigoProducto).set(product);
// 			console.log(`Created product: ${product.codigoProducto}`);
// 		}
// 	}
// 	console.log('Synchronization complete.');
// }

// IMPORTANT: UPDATING PRODUCTS FN

export async function updateFirestoreDocuments(blobPaths: string[]) {
	try {
		for (const path of blobPaths) {
			const productCode = extractProductCodeFromUrl(path);

			if (productCode) {
				// Query Firestore for the document containing the product code
				const querySnapshot = await db
					.collection('products2') // Replace with actual collection name
					.where('codigoProducto', '==', productCode) // Adjust field if needed
					.get();

				querySnapshot.forEach(async (doc) => {
					const data = doc.data();

					// Check if imageURL is null and update it if so
					if (!data.imageURL) {
						await doc.ref.update({ imageURL: path });
						console.log(`Set imageURL for document with codigoProducto: ${productCode}`);
					}
				});
			}
		}
		console.log('Documents updated successfully.');
	} catch (error) {
		console.error('Error updating documents:', error);
	}
}

export async function setOnSaleField() {
	try {
		const snapshot = await db.collection('products2').get(); // Replace with your collection name

		snapshot.forEach(async (doc) => {
			const data = doc.data();

			// Check if "precioLocal2" exists and is greater than 0
			const onSale = typeof data.precioLocal2 === 'number' && data.precioLocal2 > 0;

			// Update the document with the new "onSale" field
			await doc.ref.update({ onSale });
			console.log(`Set onSale to ${onSale} for document with ID: ${doc.id}`);
		});

		console.log('Documents updated successfully.');
	} catch (error) {
		console.error('Error updating documents:', error);
	}
}

export async function insertDataToCollection(collectionName: string, data: any[]) {
	for (const item of data) {
		await db.collection(collectionName).add(item);
		console.log(`Added document`);
	}
	console.log('Data upload completed.');
}

export async function insertClasesImages(blobPaths: string[]) {
	try {
		// Fetch all documents from the collection
		const snapshot = await db.collection('clases').get();

		// Iterate through each document
		for (const docSnap of snapshot.docs) {
			const documentData = docSnap.data();
			const { nombre } = documentData;

			// Check if 'nombre' is included in any item of the string array
			const matchingString = blobPaths.find((item) => item.includes(nombre));

			if (matchingString) {
				// Update the document with the new field
				await docSnap.ref.update({ imageURL: matchingString });
				console.log(`Updated document ${docSnap.id} with imageURL: ${matchingString}`);
			}
		}

		console.log('Update process completed.');
	} catch (error) {
		console.error('Error updating documents:', error);
	}
}

function generateSearchIndex(value: string): string[] {
	const tokens = new Set<string>();
	const words = value.toLowerCase().split(' ');

	words.forEach((word) => {
		for (let i = 1; i <= word.length; i++) {
			tokens.add(word.substring(0, i));
		}
	});

	return Array.from(tokens);
}

export async function updateSearchIndexForAllDocuments() {
	const collectionRef = db.collection('products2');
	let batch = db.batch();
	const BATCH_SIZE = 500; // Firestore limits batch writes to 500
	let counter = 0;

	try {
		const snapshot = await collectionRef.get();

		if (snapshot.empty) {
			console.log('No documents found.');
			return;
		}

		console.log(`Found ${snapshot.size} documents. Starting updates...`);

		for (const doc of snapshot.docs) {
			const data = doc.data();

			// Skip if searchIndex already exists
			if (data.searchIndex) continue;

			// Generate search index
			const searchIndex = generateSearchIndex(data.nombreProducto || '');

			// Add update to batch
			batch.update(doc.ref, { searchIndex });

			counter++;

			// Commit batch after reaching BATCH_SIZE
			if (counter % BATCH_SIZE === 0) {
				await batch.commit();
				console.log(`Updated ${counter} documents so far...`);
				batch = db.batch();
			}
		}

		// Commit remaining updates
		if (counter % BATCH_SIZE !== 0) {
			await batch.commit();
		}

		console.log(`Successfully updated ${counter} documents.`);
	} catch (error) {
		console.error('Error updating documents:', error);
	}
}
