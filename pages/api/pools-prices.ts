// pages/api/pools-prices.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Pool = {
   poolId: string;
   startBlock: number;
   endBlock: number;
   leverageLong: number;
   leverageShort: number;
};

type Price = {
   price: string;
};

type CombinedDataItem = {
   poolId: string;
   startBlock: number;
   endBlock: number;
   leverageLong: number;
   leverageShort: number;
   price: string;
};

type CombinedData = {
   items: CombinedDataItem[];
};

export default async function PoolsPrices(
   req: NextApiRequest,
   res: NextApiResponse<CombinedData | { error: string }>
) {
   try {
      // Fetch pools data
      const poolsResponse = await fetch('http://localhost:8080/api/pools');
      if (!poolsResponse.ok) {
         throw new Error(
            `Error fetching pools data: ${poolsResponse.statusText}`
         );
      }
      const poolsData: Pool[] = await poolsResponse.json();
      // console.log(poolsData, 'pools data');

      // Fetch prices data
      const pricesResponse = await fetch('http://localhost:8080/api/prices');
      if (!pricesResponse.ok) {
         throw new Error(
            `Error fetching prices data: ${pricesResponse.statusText}`
         );
      }
      const pricesData: Price[] = await pricesResponse.json();
      // console.log(pricesData, 'prices data');

      // Combine the data
      const combinedData: CombinedData = {
         items: poolsData.map((pool) => ({
            poolId: pool.poolId,
            startBlock: pool.startBlock,
            endBlock: pool.endBlock,
            leverageLong: pool.leverageLong,
            leverageShort: pool.leverageShort,
            price: pricesData[0].price,
         })),
      };

      // console.log(combinedData, 'combined');

      // Send the combined data as the response
      res.status(200).json(combinedData);
   } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
         error: 'Failed to fetch data from the Go backend',
      });
   }
}
