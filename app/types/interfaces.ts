export interface Trade {
   trader: string;
   platform: string;
   entryPrice: string;
   direction: string;
   duration: string;
   move: string;
   timestamp: string;
}

export interface Pool {
   poolId: string;
   startBlock: string;
   endBlock: string;
   leverageLong: string;
   leverageShort: string;
}
