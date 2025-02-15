"use client";
import {useEffect, useState} from "react";
import {pusherClient} from "@/libs/pusher/client";
import {ReturnDataType} from "@/app/api/color/route";

export default function Client() {
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF")
  useEffect(() => {
    const channel = pusherClient
        .subscribe("selected-color-channel")
        .bind("evt::color", (data: ReturnDataType) => {
          console.log("received_from_pusher", data);
          setBackgroundColor(() => data.selectedColor);
        });

    return () => {
      channel.unbind();
    };
  }, []);
  return (
    <div
        className={`w-full h-screen`}
        style={{ backgroundColor: `${backgroundColor}` }}
    ></div>
  );
}
