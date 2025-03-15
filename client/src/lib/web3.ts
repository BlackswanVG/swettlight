import { ethers } from "ethers";

const DAOTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to use this feature");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

export async function getDAOTokenBalance(address: string) {
  const { provider } = await connectWallet();

  // For development, return a mock balance if token address is not set
  const tokenAddress = import.meta.env.VITE_DAO_TOKEN_ADDRESS;
  if (!tokenAddress) {
    console.warn('DAO token address not configured, returning mock balance');
    // Add artificial delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 2000));
    return '100.00';
  }

  const contract = new ethers.Contract(tokenAddress, DAOTokenABI, provider);
  const balance = await contract.balanceOf(address);

  return ethers.formatEther(balance);
}

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}