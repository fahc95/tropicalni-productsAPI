import { BlobServiceClient } from '@azure/storage-blob';
import azureServiceConfig from '../../config/azure.config.json';

const { azureStorageURL, containerName, connectionString } = azureServiceConfig;
// Create a BlobServiceClient object using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Get a reference to the container
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function getAzureBlobURLs(): Promise<Array<string>> {
	try {
		// Get a list of all the blobs in the container
		const blobList = containerClient.listBlobsFlat();

		// Map each blob to its URL and return an array of URLs
		const blobUrls = [];
		for await (const blob of blobList) {
			const blobUrl = `${azureStorageURL}/${containerName}/${blob.name}`;
			blobUrls.push(blobUrl);
		}

		return blobUrls;
	} catch (error) {
		console.error('Error fetching blob URLs:', error);
		throw error; // or return [];
	}
}
