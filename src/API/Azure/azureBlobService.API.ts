import { BlobServiceClient } from '@azure/storage-blob';
import azureServiceConfig from '../../config/azure.config.json';

// Create a BlobServiceClient object using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(azureServiceConfig.connectionString);

// Get a reference to the container
const containerClient = blobServiceClient.getContainerClient(azureServiceConfig.containerName);

export async function getAzureBlobURLs(): Promise<Array<string>> {
	try {
		console.time('getAzureBlobURLs Took');

		// Get a list of all the blobs in the container
		const blobList = containerClient.listBlobsFlat();

		// Map each blob to its URL and return an array of URLs
		const blobUrls = [];
		for await (const blob of blobList) {
			const blobUrl = containerClient.url + '/' + blob.name;
			blobUrls.push(blobUrl);
		}

		console.timeEnd('getAzureBlobURLs Took');
		return blobUrls;
	} catch (error) {
		console.error('Error fetching blob URLs:', error);
		throw error; // or return [];
	}
}
