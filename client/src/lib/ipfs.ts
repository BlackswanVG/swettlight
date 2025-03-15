import { Web3Storage } from 'web3.storage';

let client: Web3Storage | null = null;

export async function getIPFSClient() {
  if (!client) {
    const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN;
    if (!token) {
      throw new Error('Web3.Storage token not configured');
    }
    client = new Web3Storage({ token });
  }
  return client;
}

export async function uploadToIPFS(file: File): Promise<string> {
  const client = await getIPFSClient();
  
  // Create a root directory for the file
  const rootCid = await client.put([file], {
    name: file.name,
    maxRetries: 3,
  });

  return rootCid;
}

export function getIPFSUrl(cid: string): string {
  return `https://${cid}.ipfs.w3s.link`;
}

export async function uploadJSON(data: any): Promise<string> {
  const client = await getIPFSClient();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'data.json');
  return await uploadToIPFS(file);
}
