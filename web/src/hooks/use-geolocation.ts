"use client";

import { useCallback, useState } from "react";
import type { GeoPoint } from "@/lib/attendance-geolocation";

type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; position: GeoPoint; accuracy: number }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported on this device." });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "ready",
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Enable location to mark physical attendance."
            : error.code === error.TIMEOUT
              ? "Location request timed out. Try again."
              : "Unable to read your location.";
        setState({ status: "error", message });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, requestLocation, reset };
}
