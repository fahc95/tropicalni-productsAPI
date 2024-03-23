import * as admin from 'firebase-admin';
import serviceAccount from '../../config/firebase.config.json';
import { Buffer } from 'buffer';
import { Product } from '../../interfaces/Product';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

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
