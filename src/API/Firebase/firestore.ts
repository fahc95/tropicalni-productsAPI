import { db } from './firestore.API';

async function updateDocument<T>(docId: string, collection: string, data: T): Promise<T> {
	try {
		const docRef = db.collection(collection).doc(docId);
		const snapshot = await docRef.get();

		if (!snapshot.exists) throw new Error(`Document ${docId} not found in ${collection}`);
		const existingData = snapshot.data() as T;
		const updatePayload: Partial<T> = { ...existingData, ...data };

		await docRef.update(updatePayload);
		console.log(`Updated document: ${docId}`);
		return { ...existingData, ...data };
	} catch (error) {
		console.error('Error updating document:', error);
		throw error;
	}
}

async function createDocument<T extends { [x: string]: any }>(docId: string, collection: string, data: T): Promise<T> {
	try {
		const docRef = db.collection(collection).doc(docId);
		await docRef.set(data);
		console.log(`Created document: ${docId}`);
		return data;
	} catch (error) {
		console.error('Error creating document:', error);
		throw error;
	}
}

export { updateDocument, createDocument };
