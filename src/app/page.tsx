"use client";

import React from "react";
import Navbar from "../components/navbar";
import NotePad from "@/components/apps/notepad";
import FileExplorer from "@/components/file-explorer";
import RecycleBin from "@/components/apps/recycle-bin";
import Folder from "@/components/apps/folder";
import { useAtom } from "jotai";
import { AppsAtoms } from "@/components/navbar";
import FileExplore from "@/components/apps/file explorer";

export default function Home() {
  // const [apps] = useAtom(AppsAtoms);

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <div className="flex flex-col gap-3 m-2 absolute inset-0">
        <FileExplore id={1} name="Desktop" />
        <RecycleBin id={2} />
        <Folder id={3} name="Documents" />
        <Folder id={4} name="Downloads" />
        <Folder id={5} name="Pictures" />
        <NotePad id={6} />
        <NotePad id={7} />
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <Navbar />
      </div>
    </div>
  );
}