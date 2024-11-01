"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { AppsAtoms } from "../navbar";
import { useAtom } from "jotai";
import FileExplorer from "../file-explorer";

interface RecycleBinProps {
  id: number;
}

const RecycleBin: React.FC<RecycleBinProps> = ({ id }) => {
  const [apps, setApps] = useAtom(AppsAtoms);
  const [isOpen, setIsOpen] = useState(false);

  const openRecycleBin = useCallback(() => {
    setIsOpen(true);
    if (apps) {
      setApps((prev) => 
        prev.some((app) => app.id === id)
          ? prev
          : [
              ...prev,
              {
                id,
                position: { x: id * 20, y: id * 20 },
                name: "Recycle Bin",
                link: "https://i.postimg.cc/pVqg4GQr/file-explorer-folder-libraries-icon-18298.png",
                zIndex: Math.max(...prev.map((app) => app.zIndex), 1000) + 1,
              },
            ]
      );
    }
  }, [id, apps, setApps]);

  return (
    <>
      <button
        onDoubleClick={openRecycleBin}
        className="w-[70px] px-1 py-2 focus:outline-none focus:bg-white rounded-md focus:bg-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
        aria-label="Open Recycle Bin"
      >
        <div className="flex flex-col items-center justify-between">
          <Image
            src="https://i.postimg.cc/qRXqUxXC/Recycle-Bin.png"
            alt="Recycle Bin"
            width={30}
            height={30}
            className="mb-1"
          />
        </div>
        <p className="text-white text-[15px] text-center">Recycle Bin</p>
      </button>
      {isOpen && <FileExplorer id={id} initialFolder="recycle-bin" />}
    </>
  );
}

export default RecycleBin;