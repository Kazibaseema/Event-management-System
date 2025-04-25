// src/contract.js
import { ethers } from 'ethers';
import EventContractABI from './EventContractABI.json';

const contractAddress = "0x313B065D98D47F5369DBb07999E29e96AdF54152";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed!");
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, EventContractABI, signer);
};