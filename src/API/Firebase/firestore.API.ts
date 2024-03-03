import * as admin from 'firebase-admin';
import serviceAccount from '../../config/firebase.config.json';
import { Buffer } from 'buffer';
import { Product } from '../../interfaces/Product';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

export async function saveDataToFirestore(collectionName: string, data: Product[]): Promise<void> {
	console.time('saveDataToFirestore took');
	const collectionRef = db.collection(collectionName);
	try {
		const productsData = Buffer.from(JSON.stringify(data)).toString('base64');
		await collectionRef.add({ productsData });
		console.log('Filtered data imported successfully to Firestore.');
		console.timeEnd('saveDataToFirestore took');
	} catch (error) {
		console.error(error);
		throw error;
	}
}
