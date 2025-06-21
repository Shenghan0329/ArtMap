"use client"
import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import ZoomButtons from "@/components/Buttons/ZoomButtons/ZoomButtons";
import CloseButton from "@/components/Buttons/CloseButton/CloseButton";
import SwitchButton from "@/components/Buttons/SwitchButton/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import { useState } from "react";

export default function Home() {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState(2025);
  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <ZoomButtons 
          handleZoomIn={async () => {
            console.log("Zoom In")
          }}
          handleZoomOut={async () => {
            console.log("Zoom Out")
          }}
        />

        <SwitchButton onClick={async () => {
          console.log("Switch")
        }} />
        <button 
          className="bg-gray-100 dark:bg-gray-800 rounded-full w-32 h-32 flex items-center justify-center absolute top-5 right-5"
          onClick={async () => {
            "use client"
            setVisible(true);
          }}
        >Open Left Panel</button>
        <LeftPanel visible={visible} setVisible={setVisible}>
          <div className="flex flex-row">
            <TimeLine time={time} setTime={setTime}/>
            <CloseButton onClick={async () => {
              "use client"
              setVisible(false);
            }} />
          </div>
          <div className="mb-2">Year: {time}</div>
          <div className="flex flex-row flex-wrap gap-2">
            {[0,0,0,0,0,0,0,0].map((item, index) => {
              return (
                <div className="relative basis-19/40 aspect-square bg-gray-100 overflow-hidden" key={index}>
                  <Image
                    className="dark:invert"
                    src="/sample-img.jpg"
                    alt="Sample Image"
                    layout="fill"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              )
            })}
          </div>
        </LeftPanel>
    </div>
  );
}
