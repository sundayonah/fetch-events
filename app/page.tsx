import Image from 'next/image';
import Events from './components/events';
import Header from './components/header';

export default function Home() {
   return (
      <div>
         <Header />
         <Events />
      </div>
   );
}
