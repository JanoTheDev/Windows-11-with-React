"use client";

import Image from "next/image";
import Navbar, { AppsAtoms } from "../components/navbar";
import { useAtom } from "jotai";
import NotePad from "@/components/notepad";

export default function Home() {
  const [apps, setApps] = useAtom(AppsAtoms);
  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="flex flex-col gap-3 m-2 absolute inset-0">
        <NotePad id={1} />
        <NotePad id={2}/>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0">
        <Navbar />
      </div>
    </div>
  );
}
