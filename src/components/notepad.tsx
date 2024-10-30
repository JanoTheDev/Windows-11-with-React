"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { Square, X } from "lucide-react";
import { AppsAtoms } from "./navbar";
import { atom, useAtom } from "jotai";
import Image from "next/image";

interface NotePadProps {
  id: number;
}

export const lastBroughtToFrontAtom = atom<number | null>(null);

export default function NotePad({ id }: NotePadProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 256, height: 200 });

  const [oldsize, setOldSize] = useState({ width: 256, height: 200 });
  const [oldposition, setOldPosition] = useState({ x: 0, y: 0 });

  const [zIndex, setZIndex] = useState(1000);
  const nodeRef = useRef(null);

  const [lastBroughtToFront, setLastBroughtToFront] = useAtom(
    lastBroughtToFrontAtom
  );

  const [apps, setApps] = useAtom(AppsAtoms);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Function to update state with new window size
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openPopup = useCallback(
    (openId?: number) => {
      const currentId = openId ?? id;
      if (apps) {
        setApps((prev) => {
          const isPositionTaken = prev.some((app) => app.id === currentId);

          if (!isPositionTaken) {
            setIsOpen(true);
            bringToFront();
            setPosition({
              x: currentId * 20,
              y: currentId * 20,
            });
            return [
              ...prev,
              {
                id: currentId,
                position: position,
                name: "Notepad",
                link: "https://i.postimg.cc/fLK4gSV6/Notepad-Win11.png",
              },
            ];
          }

          return prev;
        });
      }
    },
    [id, apps]
  );

  const closePopup = useCallback(() => {
    setApps((prev) => prev.filter((app) => app.id !== id));
    setIsOpen(false);
    setSize({ width: 256, height: 200 });
    setPosition({ x: 0, y: 0 });
    setOldSize({ width: 256, height: 200 });
    setOldPosition({ x: 0, y: 0 });
  }, [id, setApps]);

  const handleDrag = useCallback(
    (e: any, data: any) => {
      bringToFront();
      setPosition({ x: data.x, y: data.y });

      setApps((prevApps) => {
        const updatedApps = prevApps.map((app) =>
          app.id === id ? { ...app, position: position } : app
        );
        return updatedApps;
      });
    },
    [apps, id]
  );

  const bringToFront = useCallback(() => {
    setZIndex((prevZIndex) => Math.max(prevZIndex, 1000) + 1);
  }, [apps, lastBroughtToFront]);

  const FullScreenHandle = useCallback(() => {
    bringToFront();
    if (
      size.width === windowSize.width &&
      size.height === windowSize.height - 50
    ) {
      bringToFront();
      setSize(oldsize);
      setApps((prevApps) => {
        const updatedApps = prevApps.map((app) =>
          app.id === id ? { ...app, position: oldposition } : app
        );
        setPosition(oldposition);
        return updatedApps;
      });
    } else {
      bringToFront();
      setOldPosition(position);
      setOldSize(size);

      setSize({ width: windowSize.width, height: windowSize.height - 50 });
      setApps((prevApps) => {
        const updatedApps = prevApps.map((app) =>
          app.id === id ? { ...app, position: { x: 0, y: 0 } } : app
        );
        setPosition({ x: 0, y: 0 });
        return updatedApps;
      });
    }
  }, [size, position, windowSize]);

  useEffect(() => {
    if (!lastBroughtToFront || lastBroughtToFront !== id) return;
    console.log(lastBroughtToFront, id);
    const appToUpdate = apps.find((app) => app.id === id);
    if (appToUpdate) {
      setPosition(appToUpdate.position);
      bringToFront();

      setLastBroughtToFront(null);
    }
  }, [id, apps, lastBroughtToFront, bringToFront]); // Include id as a dependency

  //   const handleResize = useCallback(
  //     (
  //       e: MouseEvent | TouchEvent,
  //       direction: any,
  //       elementRef: HTMLElement,
  //       delta: { width: number; height: number }
  //     ) => {
  //       const { width, height } = delta;

  //       setSize((prevSize) => ({
  //         width: prevSize.width + width,
  //         height: prevSize.height + height,
  //       }));

  //       if (direction.includes("left")) {
  //         setPosition((prevPos) => ({
  //           x: prevPos.x - width,
  //           y: prevPos.y,
  //         }));
  //       }
  //       if (direction.includes("top")) {
  //         setPosition((prevPos) => ({
  //           x: prevPos.x,
  //           y: prevPos.y - height,
  //         }));
  //       }
  //     },
  //     []
  //   );

  return (
    <>
      <button
        onDoubleClick={() => openPopup()}
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
          bounds="parent"
          handle=".handle"
        >
          <div
            ref={nodeRef}
            style={{ position: "absolute", zIndex }}
            onMouseDown={bringToFront}
            onClick={bringToFront}
          >
            <Resizable
              size={{ width: size.width, height: size.height }}
              minWidth={200}
              minHeight={100}
              maxWidth={windowSize.width}
              maxHeight={windowSize.height}
              onResizeStart={() => {
                bringToFront();
              }}
              onResizeStop={(e, direction, ref, d) => {
                setSize({
                  width: size.width + d.width,
                  height: size.height + d.height,
                });
              }}
              className="bg-white rounded-lg shadow-lg"
            >
              <div className="flex flex-col h-full" onMouseDown={bringToFront} onClick={bringToFront}>
                <div className="handle flex justify-between items-center bg-blue-500 text-white p-2 rounded-t-lg cursor-move">
                  <h3 className="text-lg font-semibold">NotePad {id}</h3>
                  <div className="flex items-center justify-end gap-6">
                    <button
                      onClick={FullScreenHandle}
                      className="focus:outline-none hover:text-gray-200 transition-colors"
                      aria-label="FullScreen NotePad"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                    <button
                      onClick={closePopup}
                      className="focus:outline-none hover:text-gray-200 transition-colors"
                      aria-label="Close NotePad"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <p>Drag from the header</p>
                  <p>Click to bring to front</p>
                  <p>Resize from any edge or corner</p>
                </div>
              </div>
            </Resizable>
          </div>
        </Draggable>
      )}
    </>
  );
}
