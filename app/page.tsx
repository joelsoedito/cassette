import Image from "next/image";

import { Player} from "@/components/composition/Player";

import TapePlayer from '@/components/composition/TapePlayer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Player />
      {/* <TapePlayer /> */}
    </main>
  );
}
