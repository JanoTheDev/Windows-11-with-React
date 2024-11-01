"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import {
  Maximize2,
  Minimize2,
  X,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { AppsAtoms, lastBroughtToFrontAtom } from "./navbar";
import { atom, useAtom } from "jotai";
import Image from "next/image";

interface FileExplorerProps {
  id: number;
  initialFolder?: string;
}

interface FileSystemItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileSystemItem[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  id,
  initialFolder = "desktop",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [oldsize, setOldSize] = useState({ width: 800, height: 600 });
  const [oldposition, setOldPosition] = useState({ x: 20, y: 20 });
  const [zIndex, setZIndex] = useState(1000);
  const [isMaximized, setIsMaximized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState(initialFolder);
  const nodeRef = useRef(null);

  const [lastBroughtToFront, setLastBroughtToFront] = useAtom(
    lastBroughtToFrontAtom
  );
  const [apps, setApps] = useAtom(AppsAtoms);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const fileSystem: FileSystemItem[] = [
    {
      id: "desktop",
      name: "Desktop",
      type: "folder",
      children: [{ id: "recycle-bin", name: "Recycle Bin", type: "file" }],
    },
    {
      id: "documents",
      name: "Documents",
      type: "folder",
      children: [
        {
          id: "work",
          name: "Work",
          type: "folder",
          children: [
            { id: "work2", name: "Work.txt", type: "file", children: [] },
          ],
        },
        {
          id: "personal",
          name: "Personal",
          type: "folder",
          children: [
            {
              id: "personal2",
              name: "Personal2.txt",
              type: "file",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "downloads",
      name: "Downloads",
      type: "folder",
      children: [
        { id: "music", name: "Music.mp3", type: "file" },
        { id: "document", name: "Document.docx", type: "file" },
      ],
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "folder",
      children: [],
    },
  ];

  const openPopup = useCallback(() => {
    if (apps) {
      setApps((prev) => {
        const isPositionTaken = prev.some((app) => app.id === id);

        if (!isPositionTaken) {
          setIsOpen(true);
          const newPosition = { x: id * 20, y: id * 20 };
          setPosition(newPosition);
          const newZIndex =
            Math.max(...prev.map((app) => app.zIndex), 1000) + 1;
          setZIndex(newZIndex);
          return [
            ...prev,
            {
              id,
              position: newPosition,
              name: "File Explorer",
              link: "https://i.postimg.cc/pVqg4GQr/file-explorer-folder-libraries-icon-18298.png",
              zIndex: newZIndex,
            },
          ];
        }

        return prev;
      });
    }
  }, [id, apps, setApps]);

  useEffect(() => {
    if (lastBroughtToFront === id) {
      const appToUpdate = apps.find((app) => app.id === id);
      if (appToUpdate) {
        setPosition(appToUpdate.position);
        setZIndex(appToUpdate.zIndex);
      }
      setLastBroughtToFront(null);
    }
  }, [id, apps, lastBroughtToFront, setLastBroughtToFront]);

  const closePopup = useCallback(() => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    setIsOpen(false);
    setSize({ width: 800, height: 600 });
    setPosition({ x: 20, y: 20 });
    setOldSize({ width: 800, height: 600 });
    setOldPosition({ x: 20, y: 20 });
    setIsMaximized(false);
  }, [id, setApps]);

  const handleDrag = useCallback(
    (e: any, data: any) => {
      bringToFront();
      const newPosition = { x: data.x, y: data.y };
      setPosition(newPosition);

      setApps((prevApps) => {
        const updatedApps = prevApps.map((app) =>
          app.id === id ? { ...app, position: newPosition } : app
        );
        return updatedApps;
      });
    },
    [id, setApps]
  );

  const bringToFront = useCallback(() => {
    setApps((prevApps) => {
      const maxZIndex = Math.max(...prevApps.map((app) => app.zIndex), 1000);
      const newZIndex = maxZIndex + 1;
      setZIndex(newZIndex);
      return prevApps.map((app) =>
        app.id === id ? { ...app, zIndex: newZIndex } : app
      );
    });
  }, [id, setApps]);

  const FullScreenHandle = useCallback(() => {
    bringToFront();
    setIsMaximized((prev) => {
      if (!prev) {
        setOldPosition(position);
        setOldSize(size);
        setSize({ width: windowSize.width, height: windowSize.height - 50 });
        setPosition({ x: 0, y: 0 });
      } else {
        setSize(oldsize);
        setPosition(oldposition);
      }
      return !prev;
    });
    setApps((prevApps) =>
      prevApps.map((app) => (app.id === id ? { ...app, position, size } : app))
    );
  }, [size, position, windowSize, oldsize, oldposition, id, setApps]);

  useEffect(() => {
    if (lastBroughtToFront === id) {
      const appToUpdate = apps.find((app) => app.id === id);
      if (appToUpdate) {
        setPosition(appToUpdate.position);
        setZIndex(appToUpdate.zIndex);
      }
      setLastBroughtToFront(null);
    }
  }, [id, apps, lastBroughtToFront, setLastBroughtToFront]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFileSystem = (items: FileSystemItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ paddingLeft: `${depth * 20}px` }}>
        {item.type === "folder" ? (
          <div
            className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
            onClick={() => toggleFolder(item.id)}
          >
            {expandedFolders.has(item.id) ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <Folder size={16} className="mr-2 text-blue-500" />
            <span>{item.name}</span>
          </div>
        ) : (
          <div className="flex items-center p-1 hover:bg-gray-100 rounded-md">
            {item.name === "Recycle Bin" ? (
              <Trash2 size={16} className="mr-2 text-gray-500" />
            ) : (
              <File size={16} className="mr-2 text-blue-500" />
            )}
            <span>{item.name}</span>
          </div>
        )}
        {item.type === "folder" &&
          expandedFolders.has(item.id) &&
          item.children && (
            <div>{renderFileSystem(item.children, depth + 1)}</div>
          )}
      </div>
    ));
  };

  useEffect(() => {
    if (initialFolder) {
      setActiveTab(initialFolder);
      setIsOpen(true);
    }
  }, [initialFolder]);

  return (
    <>
      {isOpen && (
        <Draggable
          nodeRef={nodeRef}
          position={position}
          onDrag={handleDrag}
          bounds="parent"
          handle=".handle"
          disabled={isMaximized}
        >
          <div
            ref={nodeRef}
            style={{
              position: "absolute",
              zIndex,
              transition: "all 0.3s ease-in-out",
              width: isMaximized ? "100%" : `${size.width}px`,
              height: isMaximized ? "100%" : `${size.height}px`,
              left: isMaximized ? "0" : `${position.x}px`,
              top: isMaximized ? "0" : `${position.y}px`,
            }}
            onMouseDown={bringToFront}
            onClick={bringToFront}
          >
            <Resizable
              size={
                isMaximized
                  ? { width: windowSize.width, height: windowSize.height - 50 }
                  : size
              }
              minWidth={400}
              minHeight={300}
              maxWidth={windowSize.width}
              maxHeight={windowSize.height}
              onResizeStart={bringToFront}
              enable={
                !isMaximized
                  ? {
                      top: true,
                      right: true,
                      bottom: true,
                      left: true,
                      topRight: true,
                      bottomRight: true,
                      bottomLeft: true,
                      topLeft: true,
                    }
                  : false
              }
              onResizeStop={(e, direction, ref, d) => {
                const newSize = {
                  width: size.width + d.width,
                  height: size.height + d.height,
                };
                setSize(newSize);

                setApps((prevApps) =>
                  prevApps.map((app) =>
                    app.id === id ? { ...app, size: newSize } : app
                  )
                );
              }}
              className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
            >
              <div className="handle flex justify-between items-center bg-gray-100 text-black p-2 rounded-t-lg cursor-move">
                <div className="flex items-center space-x-2">
                  <Image
                    src="https://i.postimg.cc/pVqg4GQr/file-explorer-folder-libraries-icon-18298.png"
                    alt="File Explorer"
                    width={16}
                    height={16}
                  />
                  <h3 className="text-sm font-semibold">File Explorer - {initialFolder}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={FullScreenHandle}
                    className="focus:outline-none hover:bg-gray-200 p-1 rounded"
                    aria-label="Maximize File Explorer"
                  >
                    {size.width === windowSize.width &&
                    size.height === windowSize.height - 50 ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                  </button>
                  <button
                    onClick={closePopup}
                    className="focus:outline-none hover:bg-red-500 hover:text-white p-1 rounded"
                    aria-label="Close File Explorer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex border-b border-gray-200">
                {[
                  "desktop",
                  "documents",
                  "downloads",
                  "pictures",
                  "recycle-bin",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 focus:outline-none ${
                      activeTab === tab ? "border-b-2 border-blue-500" : ""
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-4">
                {renderFileSystem(
                  fileSystem.find((item) => item.id === activeTab)?.children ||
                    []
                )}
              </div>
            </Resizable>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default FileExplorer;
