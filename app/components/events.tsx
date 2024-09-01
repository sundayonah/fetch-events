'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
// import { Pool } from '../types/interfaces';
import { db } from '@/firebase';
import { ethers } from 'ethers';
import priceOracleAbi from '@/app/components/contract/priceOracleAbi.json';
import openPositionAbi from '@/app/components/contract/openPosition.json';

// Function to shorten Ethereum address
const shortenAddress = (address: string) => {
   return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

type Pool = {
   poolId: string;
   startBlock: string;
   endBlock: string;
   leverageLong: string;
   leverageShort: string;
   isLong: boolean;
   price: number;
};

type Price = {
   price: string;
};

type CombinedData = {
   pools: Pool[];
   prices: Price[];
};

type Pools = {
   poolId: string;
   startBlock: number;
   endBlock: number;
   leverageLong: number;
   leverageShort: number;
};

type Prices = {
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

type CombinedDatas = {
   items: CombinedDataItem[];
};

const Events = () => {
   // Initialize state with the Pool type
   const [data, setData] = useState<CombinedDatas | null>(null);

   const [trades, setTrades] = useState<Pool[]>([]);
   const [oraclePrice, setOraclePrice] = useState('');
   const [tradeStates, setTradeStates] = useState<
      { isLong: boolean; amount: string }[]
   >([]);

   const priceOracleContractAddress =
      '0xcDC7cB917bE249A1ff5F623D5CF590eDA36236a7';

   const openPositionContractAddress =
      '0x248e4730C9e1Fce6512F2082dd73d48a6CaA318a';

   // useEffect(() => {
   //    const fetchTrades = async () => {
   //       try {
   //          // trades
   //          const tradesCollection = collection(db, 'pools');
   //          const tradesSnapshot = await getDocs(tradesCollection);
   //          const tradesList: Pool[] = tradesSnapshot.docs.map(
   //             (doc) => doc.data() as Pool
   //          );
   //          setTrades(tradesList);

   //          ////price
   //          const pricesCollection = collection(db, 'prices');
   //          const pricesSnapshot = await getDocs(pricesCollection);
   //          const priceList = pricesSnapshot.docs.map((doc) => doc.data());
   //          console.log(priceList, 'price list');

   //          // Initialize tradeStates based on the fetched trades
   //          const initialTradeStates = tradesList.map(() => ({
   //             isLong: true,
   //             amount: '',
   //          }));
   //          setTradeStates(initialTradeStates);
   //       } catch (error) {
   //          console.error('Error fetching trades:', error);
   //       }
   //    };

   //    fetchTrades();
   // }, []);

   useEffect(() => {
      const fetchTradesAndPrices = async () => {
         try {
            // Fetch trades
            const tradesCollection = collection(db, 'pools');
            const tradesSnapshot = await getDocs(tradesCollection);
            const tradesList: Pool[] = tradesSnapshot.docs.map(
               (doc) => doc.data() as Pool
            );

            // Fetch prices
            const pricesCollection = collection(db, 'prices');
            const pricesSnapshot = await getDocs(pricesCollection);
            const priceList = pricesSnapshot.docs.map((doc) => doc.data());
            // const priceList = pricesSnapshot.docs.map((doc) => ({
            //    blockNumber: doc.get('blockNumber'),
            //    price: doc.get('price'),
            // }));

            const combinedList = priceList.map((priceItem, index) => {
               const tradeItem = tradesList[index];
               return {
                  ...priceItem,
                  ...tradeItem,
               };
            });

            // console.log(combinedList, 'PRICE LIST AND TRADE LIST combine');

            // // Combine trades and prices
            // const combinedList = tradesList.map((trade) => {
            //    const matchingPrice = priceList.find(
            //       (price) => price.blockNumber > trade.endBlock
            //    );
            //    console.log(matchingPrice, 'matching');
            //    return {
            //       ...trade,
            //       price: matchingPrice
            //          ? {
            //               amount: matchingPrice.price.toString(),
            //               blockNumber: matchingPrice.blockNumber,
            //            }
            //          : null,
            //    };
            // });

            // Sort the combined list by endBlock
            // combinedList.sort((a, b) => parseInt(a.endBlock) - parseInt(b.endBlock));

            // Set trades and trade states

            // console.log(combinedList, 'combined List');
            setTrades(combinedList);
            const initialTradeStates = combinedList.map((trade) => ({
               isLong: trade.isLong,
               amount: '',
            }));
            setTradeStates(initialTradeStates);

            // console.log(initialTradeStates, 'Combined list with prices');
         } catch (error) {
            console.error('Error fetching trades and prices:', error);
         }
      };

      fetchTradesAndPrices();
   }, []);

   function formatTimestamp(startBlock: number, endBlock: number): string {
      const difference = endBlock - startBlock;

      // Convert block difference to a human-readable format
      const seconds = difference % 60;
      const minutes = Math.floor((difference % 3600) / 60);
      const hours = Math.floor(difference / 3600);

      return `${hours}h ${minutes}m ${seconds}s`;
   }

   useEffect(() => {
      const getOraclePrice = async () => {
         console.log('Hello oracle');
         try {
            const alchemyApiKey =
               'https://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ';
            const provider = new ethers.JsonRpcProvider(alchemyApiKey);
            // console.log(provider);

            const oracleInstance = new ethers.Contract(
               priceOracleContractAddress,
               priceOracleAbi,
               provider
            );
            // console.log(oracleInstance);

            const price = await oracleInstance.getLatestPrice();
            // console.log('Raw price from contract:', price.toString());

            // Format the price (assuming it's in wei)
            const formattedPrice = ethers.formatUnits(price, 18);
            // console.log('Formatted price:', formattedPrice);

            setOraclePrice(formattedPrice);
         } catch (error) {
            console.log('Failed to fetch oracle price:', error);
         }
      };

      getOraclePrice();
   }, []);

   // console.log(oraclePrice);

   const handleDirectionChange = (index: number, direction: boolean) => {
      setTradeStates((prevStates) =>
         prevStates.map((state, i) =>
            i === index ? { ...state, isLong: direction } : state
         )
      );
   };

   const handleAmountChange = (index: number, value: string) => {
      setTradeStates((prevStates) =>
         prevStates.map((state, i) =>
            i === index ? { ...state, amount: value } : state
         )
      );
   };

   const getProviderAndSigner = async () => {
      if (!window.ethereum) {
         console.error('No Ethereum provider detected');
         return { provider: null, signer: null };
      }

      // Cast window.ethereum as unknown first, then to ethers.Eip1193Provider
      const provider = new ethers.BrowserProvider(
         (window.ethereum as unknown) as ethers.Eip1193Provider
      );

      try {
         const signer = await provider.getSigner();
         return { provider, signer };
      } catch (error) {
         console.error('Failed to connect to wallet:', error);
         return { provider: null, signer: null };
      }
   };

   const OpenPosition = async (poolId: string, index: number) => {
      const { isLong, amount } = tradeStates[index];
      try {
         const minShares = 0;
         const amountInWei = ethers.parseUnits(amount, 18);
         console.log({ poolId, isLong, amountInWei, minShares });

         const { provider, signer } = await getProviderAndSigner();

         // Connect to the contract using the signer
         const positionContract = new ethers.Contract(
            openPositionContractAddress,
            openPositionAbi,
            signer
         );

         const valueAmount = amount.toString();

         const tx = await positionContract.openPosition(
            poolId,
            isLong,
            amountInWei,
            minShares,
            {
               // value: amount.toString(),
               value: valueAmount,
               gasPrice: ethers.parseUnits('1', 'gwei'),
               gasLimit: 200000,
            }
         );
         await tx.wait();
         console.log('Position opened successfully:', tx);
      } catch (error) {
         console.error('Failed to open position:', error);
      }
   };

   useEffect(() => {
      async function fetchData() {
         try {
            const response = await fetch('/api/pools-prices');
            const result = await response.json();
            console.log(result, 'POOLS AND PRICES');
            setData(result);
         } catch (error) {
            console.error('Error fetching data:', error);
            //   setData(null);
         }
      }

      fetchData();
   }, []);

   return (
      <div className="mt-8">
         <div className="max-w-5xl flex mx-auto space-x-8 p-4">
            {/* {trades.map((trade, index) => ( */}
            {data?.items?.map((trade, index) => (
               <div
                  key={trade.poolId}
                  className="w-full p-4 px-5 rounded-3xl shadow-xl bg-gradient-to-b from-[#f87b7a] via-red-100 to-red-50"
               >
                  <div className="">
                     <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-12"
                           >
                              <path
                                 fillRule="evenodd"
                                 d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                                 clipRule="evenodd"
                              />
                           </svg>
                           <div>
                              <span className="font-bold">
                                 {/* {shortenAddress(trade.trader)} */}
                                 0x00...0987
                              </span>
                              {/* <p>{trade.trades}</p> */}
                              <p>13 trades</p>
                           </div>
                        </div>
                        <div>
                           <span>
                              {formatTimestamp(
                                 Number(trade.startBlock),
                                 Number(trade.endBlock)
                              )}
                           </span>
                        </div>
                     </div>
                     <div>
                        <div className="flex items-center justify-between mt-5">
                           <div>
                              <div className="space-x-3 pb-1">
                                 <span className="font-bold">
                                    {/* {trade.platform} */}
                                    ETH
                                 </span>
                                 <span className="bg-gray-100 p-1 rounded-xl">
                                    eth
                                 </span>
                              </div>
                              {/* <p>${trade.entryPrice}</p> */}
                              <p>${oraclePrice}</p>
                           </div>
                           <div>
                              <div className="space-x-3 pb-1">
                                 <span>Entry Price</span>

                                 {/* <p>{trade.price.toString()}</p> */}
                                 <p>{ethers.formatUnits(trade.price, 18)}</p>
                              </div>
                              {/* <p>${ PoolsPrice(trade.poolId)}</p> */}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Long/Short Selection */}
                  <div className="flex items-center justify-between mt-6 mx-4 px-8 py-2 rounded-xl border border-gray-600">
                     <div
                        onClick={() => handleDirectionChange(index, true)}
                        className={`cursor-pointer p-2 rounded ${
                           tradeStates[index]?.isLong ? 'bg-green-300' : ''
                        }`}
                     >
                        <p className="font-bold">Long</p>
                     </div>
                     <div className="w-0.5 h-8 bg-black" />
                     <div>
                        <p>Duration</p>
                     </div>
                     <div className="w-0.5 h-8 bg-black" />
                     <div
                        onClick={() => handleDirectionChange(index, false)}
                        className={`cursor-pointer p-2 rounded ${
                           !tradeStates[index]?.isLong ? 'bg-red-300' : ''
                        }`}
                     >
                        <p className="font-bold">Short</p>
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <input
                        type="text"
                        className="pt-2 m-2 p-2"
                        value={tradeStates[index]?.amount || ''}
                        onChange={(e) =>
                           handleAmountChange(index, e.target.value)
                        }
                        placeholder="Enter amount"
                     />
                     <button
                        onClick={() => OpenPosition(trade.poolId, index)}
                        className="bg-pink-300 p-2"
                     >
                        Open Position
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Events;

//   <div className="flex items-center justify-between mt-6 mx-4 px-8 py-2 rounded-xl border border-gray-600">
//                      <div
//                         onClick={() => handleDirectionChange(index, true)}
//                         className={`cursor-pointer p-2 rounded ${
//                            tradeStates[index]?.isLong ? 'bg-green-300' : ''
//                         }`}
//                      >
//                         <p className="font-bold">Long</p>
//                         <p>Direction</p>
//                      </div>
//                      <div className="w-0.5 h-8 bg-black" />
//                      <div>
//                         <p>Duration</p>
//                      </div>
//                      <div className="w-0.5 h-8 bg-black" />
//                      <div
//                         onClick={() => handleDirectionChange(index, false)}
//                         className={`cursor-pointer p-2 rounded ${
//                            !tradeStates[index]?.isLong ? 'bg-red-300' : ''
//                         }`}
//                      >
//                         <p>Short</p>
//                         <p>Direction</p>
//                      </div>
//                   </div>
