"use client";

import React, { useEffect, useState, useCallback } from "react";
import { atom, useAtom } from "jotai";
import Image from "next/image";

export interface AppInterface {
  id: number;
  position: { x: number; y: number };
  name: string;
  link: string;
  zIndex: number;
}

export const lastBroughtToFrontAtom = atom<number | null>(null);

export const AppsAtoms = atom<AppInterface[]>([]);

export default function Navbar() {
  const [apps, setApps] = useAtom(AppsAtoms);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [, setLastBroughtToFront] = useAtom(lastBroughtToFrontAtom);

  useEffect(() => {
    const updateDateTime = () => {
      const format = getFormattedDateTime();
      if (format.formattedTime !== time) setTime(format.formattedTime);
      if (format.formattedDate !== date) setDate(format.formattedDate);
    };
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, [time, date]);

  const handleAppClick = useCallback((id: number) => {
    setLastBroughtToFront(id);
    setApps((prevApps) => {
      const maxZIndex = Math.max(...prevApps.map((app) => app.zIndex), 1000);
      return prevApps.map((app) =>
        app.id === id
          ? { ...app, zIndex: maxZIndex + 1 }
          : app
      );
    });
  }, [setLastBroughtToFront, setApps]);

  return (
    <div className="bg-blue-950 bg-opacity-30 backdrop-blur-md w-screen h-[50px] fixed bottom-0">
      <div className="flex items-center justify-between h-full px-4">
        {/* Center Icons */}
        <div className="flex items-center justify-center flex-grow ml-[75px]">
          {/* Windows 11 Logo */}
          <div className="flex justify-center items-center hover:rounded hover:bg-white hover:bg-opacity-20 h-[45px] w-[45px] transition-all duration-200 relative overflow-hidden">
            <Image
              src="https://i.postimg.cc/x1d460B8/dgkrji2-dcceb33c-b702-4613-9c87-84295aa358c4.png"
              alt="W11"
              width={60}
              height={60}
              style={{
                objectFit: "contain",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              }}
            />
          </div>

          {/* Search Icon */}
          <div className="flex justify-center items-center hover:rounded hover:bg-white hover:bg-opacity-20 h-[45px] w-[45px] transition-all duration-200 relative overflow-hidden mx-1">
            <Image
              src="https://i.postimg.cc/FRxbtSL4/icons8-search-144.png"
              alt="Search"
              width={30}
              height={30}
              style={{
                objectFit: "contain",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              }}
            />
          </div>

          {/* Apps Display */}
          {apps.map((data: AppInterface) => (
            <div
              onClick={() => handleAppClick(data.id)}
              key={data.id}
              className="flex justify-center items-center hover:rounded hover:bg-white hover:bg-opacity-20 h-[45px] w-[45px] transition-all duration-200 relative overflow-hidden mx-1"
            >
              <Image
                src={data.link}
                alt={data.name}
                width={20}
                height={20}
                style={{
                  objectFit: "contain",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) scale(1)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Right Aligned Time Display */}
        <div className="flex flex-col justify-center items-end hover:rounded hover:bg-white hover:bg-opacity-5 h-[45px] px-2 py-2 transition-all duration-200 relative overflow-hidden cursor-default">
          <p className="text-[12px] text-white font-bold text-right">{time}</p>
          <p className="text-[12px] text-white font-bold text-right">{date}</p>
        </div>
      </div>
    </div>
  );
}

function getFormattedDateTime() {
  const currentDate = new Date();
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const formattedTime = currentDate.toLocaleTimeString("en-US", timeOptions);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);
  return { formattedTime, formattedDate };
}