'use client';

import { useState } from 'react';

const Header = () => {
   const [activeNav, setActiveNav] = useState(1); // Default active nav item
   const nav = [
      { id: 1, name: 'All' },
      { id: 2, name: 'Bettable' },
      { id: 3, name: 'Sport' },
      { id: 4, name: 'Perpetuals' },
      { id: 5, name: 'X(Twitter)' },
   ];

   return (
      <div className="max-w-5xl mx-auto p-4 mt-24">
         <div className="flex space-x-12">
            {nav.map((e) => (
               <ul key={e.id}>
                  <li
                     className={` px-4 rounded-2xl ${
                        activeNav === e.id
                           ? 'bg-[#f3940d] text-black font-bold'
                           : 'text-gray-500'
                     } cursor-pointer`}
                     onClick={() => setActiveNav(e.id)}
                  >
                     {e.name}
                  </li>
               </ul>
            ))}
         </div>
      </div>
   );
};

export default Header;
