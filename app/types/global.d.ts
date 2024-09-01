import { ethers } from 'ethers';

declare global {
   interface Window {
      ethereum: unknown; // Declare it as unknown first
   }
}

export {};
