"use client";

import React, { useCallback, useState } from "react";
import { Folder as FolderIcon } from "lucide-react";
import { AppsAtoms } from "../navbar";
import { useAtom } from "jotai";
import FileExplorer from "../file-explorer";

interface FolderProps {
  id: number;
  name: string;
}

const Folder: React.FC<FolderProps> = ({ id, name }) => {
  const [apps, setApps] = useAtom(AppsAtoms);
  const [isOpen, setIsOpen] = useState(false);

  const openFolder = useCallback(() => {
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
                name: name,
                link: "https://i.postimg.cc/pVqg4GQr/file-explorer-folder-libraries-icon-18298.png",
                zIndex: Math.max(...prev.map((app) => app.zIndex), 1000) + 1,
              },
            ]
      );
    }
  }, [id, name, apps, setApps]);

  return (
    <>
      <button
        onDoubleClick={openFolder}
        className="w-[70px] px-1 py-2 focus:outline-none focus:bg-white rounded-md focus:bg-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
        aria-label={`Open ${name} folder`}
      >
        <div className="flex flex-col items-center justify-between">
          <FolderIcon size={30} className="mb-1 text-yellow-500" />
        </div>
        <p className="text-white text-[15px] text-center">{name}</p>
      </button>
      {isOpen && <FileExplorer id={id} initialFolder={name.toLowerCase()} />}
    </>
  );
}

export default Folder;