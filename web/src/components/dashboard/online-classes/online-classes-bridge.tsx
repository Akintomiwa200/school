"use client";

import { useEffect } from "react";
import { connectOnlineClassesStream, disconnectOnlineClassesStream } from "./online-classes-live-store";

export function OnlineClassesStreamBridge() {
  useEffect(() => {
    connectOnlineClassesStream();
    return () => disconnectOnlineClassesStream();
  }, []);

  return null;
}
