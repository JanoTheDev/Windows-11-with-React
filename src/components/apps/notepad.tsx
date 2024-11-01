import React, { useState, useCallback, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { Resizable, Enable } from "re-resizable"; // Import the correct type for Enable
import { Maximize2, Minimize2, X, Plus } from "lucide-react";
import { AppsAtoms, lastBroughtToFrontAtom } from "../navbar";
import { atom, useAtom } from "jotai";
import Image from "next/image";

interface NotePadProps {
  id: number;
}

interface Tab {
  id: number;
  title: string;
  content: string;
}

export default function NotePad({ id }: NotePadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [oldsize, setOldSize] = useState({ width: 600, height: 400 });
  const [oldposition, setOldPosition] = useState({ x: 20, y: 20 });
  const [zIndex, setZIndex] = useState(1000);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: "Untitled", content: "" },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const nodeRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
              name: "Notepad",
              link: "https://i.postimg.cc/fLK4gSV6/Notepad-Win11.png",
              zIndex: newZIndex,
            },
          ];
        }

        return prev;
      });
    }
  }, [id, apps, setApps]);

  const closePopup = useCallback(() => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    setIsOpen(false);
    setSize({ width: 600, height: 400 });
    setPosition({ x: 20, y: 20 });
    setOldSize({ width: 600, height: 400 });
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

  const handleStop = useCallback((e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  }, []);

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

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, activeTab]);

  const addNewTab = () => {
    const newTabId = Math.max(...tabs.map((tab) => tab.id), 0) + 1;
    setTabs([
      ...tabs,
      { id: newTabId, title: `Untitled ${newTabId}`, content: "" },
    ]);
    setActiveTab(newTabId);
  };

  const closeTab = (tabId: number) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
    }
  };

  const updateTabContent = (content: string) => {
    setTabs(
      tabs.map((tab) => (tab.id === activeTab ? { ...tab, content } : tab))
    );
  };

  return (
    <>
      <button
        onDoubleClick={openPopup}
        className="w-[70px] px-1 py-2 focus:outline-none focus:bg-white rounded-md focus:bg-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
        aria-label="Open NotePad"
      >
        <div className="flex flex-col items-center justify-between">
          <Image
            src="https://i.postimg.cc/fLK4gSV6/Notepad-Win11.png"
            alt="Notepad"
            width={30}
            height={30}
            className="mb-1"
          />
        </div>
        <p className="text-white text-[15px] text-center">Notepad</p>
      </button>

      {isOpen && (
        <Draggable
          nodeRef={nodeRef}
          position={position}
          onDrag={handleDrag}
          onStop={handleStop} // Add the onStop handler
          bounds="parent"
          handle=".handle"
          disabled={isMaximized}
        >
          <div
            ref={nodeRef}
            style={{
              position: "absolute",
              zIndex,
              transition: "transform 0.2s ease-in-out",
              width: isMaximized ? "100%" : `${size.width}px`,
              height: isMaximized ? "100%" : `${size.height}px`,
              left: isMaximized ? "0" : `${position.x}px`,
              top: isMaximized ? "0" : `${position.y}px`,
            }}
            onMouseDown={bringToFront}
            onClick={bringToFront}
          >
            <Resizable
              size={size}
              onResizeStop={(e, direction, ref, d) => {
                setSize((prevSize) => ({
                  width: prevSize.width + d.width,
                  height: prevSize.height + d.height,
                }));
              }}
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
            >
              <div className="flex flex-col h-full">
                <div className="handle flex justify-between items-center bg-gray-200 text-black p-1 rounded-t-lg cursor-move">
                  <div className="flex items-center space-x-2 px-2">
                    <Image
                      src="https://i.postimg.cc/fLK4gSV6/Notepad-Win11.png"
                      alt="Notepad"
                      width={16}
                      height={16}
                    />
                    <h3 className="text-sm font-semibold">Notepad</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={FullScreenHandle}
                      className="focus:outline-none hover:bg-gray-300 p-1 rounded"
                      aria-label="Maximize NotePad"
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
                      aria-label="Close NotePad"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex bg-gray-100 border-b border-gray-300">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`flex items-center px-3 py-1 border-r border-gray-300 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="mr-2">{tab.title}</span>
                      {tabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                          }}
                          className="focus:outline-none hover:bg-gray-300 rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addNewTab}
                    className="px-3 py-1 hover:bg-gray-200 focus:outline-none"
                    aria-label="Add new tab"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={
                      tabs.find((tab) => tab.id === activeTab)?.content || ""
                    }
                    onChange={(e) => updateTabContent(e.target.value)}
                    className="w-full h-full resize-none p-2 focus:outline-none bg-white text-black"
                    style={{ fontFamily: "Consolas, monospace" }}
                  />
                </div>
              </div>
            </Resizable>
          </div>
        </Draggable>
      )}
    </>
  );
}
