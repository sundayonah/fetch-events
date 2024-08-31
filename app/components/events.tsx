'use client';

// import { db } from '@/firebase';
// import { collection, getDocs } from 'firebase/firestore';
// import Image from 'next/image';
// import { useEffect } from 'react';

// const Events = () => {
//    const trades = [
//       {
//          address: '0x3B553...87676',
//          trades: '13 trades',
//          time: '3 hours ago',
//          platform: 'SOL',
//          entryPrice: '$145.162',
//          direction: 'Long',
//          duration: '3h 17min',
//          move: '-0.17%',
//       },
//       {
//          address: '0x7A3C7...98765',
//          trades: '8 trades',
//          time: '5 hours ago',
//          platform: 'ETH',
//          entryPrice: '$235.250',
//          direction: 'Short',
//          duration: '2h 45min',
//          move: '-0.35%',
//       },
//    ];

//    useEffect(() => {
//       const fetchTrades = async () => {
//          try {
//             const tradesCollection = collection(db, 'trades');
//             const tradesSnapshot = await getDocs(tradesCollection);
//             const tradesList = tradesSnapshot.docs.map((doc) => doc.data());
//             console.log(tradesList);
//             //   setTrades(tradesList);
//          } catch (error) {
//             console.error('Error fetching trades:', error);
//          }
//       };

//       fetchTrades();
//    }, []);

//    return (
//       <div className="mt-8">
//          <div className="max-w-5xl flex mx-auto space-x-8 p-4">
//             {trades.map((trade, index) => (
//                <div
//                   key={index}
//                   className="w-full  p-4 px-5 rounded-3xl shadow-xl bg-gradient-to-b from-[#f87b7a] via-red-100   to-red-50"
//                >
//                   <div className="">
//                      <div className="flex items-center justify-between">
//                         <div className="flex space-x-3">
//                            <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               viewBox="0 0 24 24"
//                               fill="currentColor"
//                               className="size-12"
//                            >
//                               <path
//                                  fillRule="evenodd"
//                                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
//                                  clipRule="evenodd"
//                               />
//                            </svg>
//                            <div>
//                               <span className="font-bold">{trade.address}</span>
//                               <p>{trade.trades}</p>
//                            </div>
//                         </div>
//                         <div>
//                            <span>{trade.time}</span>
//                         </div>
//                      </div>
//                      <div>
//                         <div className="flex items-center justify-between mt-5">
//                            <div>
//                               <div className="space-x-3 pb-1">
//                                  <span className="font-bold">
//                                     {trade.platform}
//                                  </span>
//                                  <span className="bg-gray-100 p-1 rounded-xl">
//                                     Platform
//                                  </span>
//                               </div>
//                               <p>{trade.entryPrice}</p>
//                            </div>
//                            <div>
//                               <div className="space-x-3 pb-1">
//                                  <span>Entry Price</span>
//                               </div>
//                               <p>{trade.entryPrice}</p>
//                            </div>
//                         </div>
//                      </div>
//                   </div>
//                   <div className="flex items-center justify-between mt-6 mx-4 px-8 py-2 rounded-xl border border-gray-600">
//                      <div>
//                         <p className="font-bold">{trade.direction}</p>
//                         <p>Direction</p>
//                      </div>
//                      <div className="w-0.5 h-8 bg-black" />
//                      <div>
//                         <p className="font-bold">{trade.duration}</p>
//                         <p>Duration</p>
//                      </div>
//                      <div className="w-0.5 h-8 bg-black" />
//                      <div>
//                         <p className="text-red-600">{trade.move}</p>
//                         <p>Move</p>
//                      </div>
//                   </div>
//                </div>
//             ))}
//          </div>
//       </div>
//    );
// };

// export default Events;

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Trade } from '../types/interfaces';
import { db } from '@/firebase';

// Function to shorten Ethereum address
const shortenAddress = (address: string) => {
   return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Function to convert timestamp to human-readable format
const formatTimestamp = (timestamp: number | string) => {
   let date: Date;

   // Convert timestamp to milliseconds
   if (typeof timestamp === 'string') {
      const parsedTimestamp = parseInt(timestamp, 10);
      date = new Date(parsedTimestamp * 1000); // Convert from seconds to milliseconds
   } else if (typeof timestamp === 'number') {
      date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
   } else {
      console.error('Invalid timestamp type:', timestamp);
      return 'Invalid date';
   }

   // Check if the date is valid
   if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid date';
   }

   // Format the date to human-readable
   return formatDistanceToNow(date, { addSuffix: true });
};

// Example usage
const exampleTimestamp = 1666638380; // Example timestamp in seconds
console.log(formatTimestamp(exampleTimestamp));

const Events = () => {
   // Initialize state with the Trade type
   const [trades, setTrades] = useState<Trade[]>([]);

   useEffect(() => {
      const fetchTrades = async () => {
         try {
            const tradesCollection = collection(db, 'trades');
            const tradesSnapshot = await getDocs(tradesCollection);
            const tradesList: Trade[] = tradesSnapshot.docs.map(
               (doc) => doc.data() as Trade
            );
            console.log(tradesList);
            setTrades(tradesList);
         } catch (error) {
            console.error('Error fetching trades:', error);
         }
      };

      fetchTrades();
   }, []);

   return (
      <div className="mt-8">
         <div className="max-w-5xl flex mx-auto space-x-8 p-4">
            {trades.map((trade, index) => (
               <div
                  key={index}
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
                                 {shortenAddress(trade.trader)}
                              </span>
                              {/* <p>{trade.trades}</p> */}
                              <p>13 trades</p>
                           </div>
                        </div>
                        <div>
                           <span>{formatTimestamp(trade.timestamp)}</span>
                        </div>
                     </div>
                     <div>
                        <div className="flex items-center justify-between mt-5">
                           <div>
                              <div className="space-x-3 pb-1">
                                 <span className="font-bold">
                                    {trade.platform}
                                 </span>
                                 <span className="bg-gray-100 p-1 rounded-xl">
                                    Platform
                                 </span>
                              </div>
                              <p>${trade.entryPrice}</p>
                           </div>
                           <div>
                              <div className="space-x-3 pb-1">
                                 <span>Entry Price</span>
                              </div>
                              <p>{trade.entryPrice}</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 mx-4 px-8 py-2 rounded-xl border border-gray-600">
                     <div>
                        <p className="font-bold">{trade.direction}</p>
                        <p>Direction</p>
                     </div>
                     <div className="w-0.5 h-8 bg-black" />
                     <div>
                        <p className="font-bold">{trade.duration}</p>
                        <p>Duration</p>
                     </div>
                     <div className="w-0.5 h-8 bg-black" />
                     <div>
                        <p className="text-red-600">{trade.move}</p>
                        <p>Move</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Events;
