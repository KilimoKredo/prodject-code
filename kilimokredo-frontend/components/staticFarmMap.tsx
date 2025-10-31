"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface StaticFarmMapProps {
  /** The location string from the farmer's profile, e.g., "\"-1.1900,36.9400\"" */
  locationString: string;
  /** Optional: CSS width (e.g., "100%", "500px"). Defaults to "100%". */
  width?: string;
  /** Optional: CSS height (e.g., "400px", "50vh"). Defaults to "250px". */
  height?: string;
}

export function StaticFarmMap({ 
  locationString, 
  width = "100%", 
  height = "250px" 
}: StaticFarmMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Store props in refs to prevent useEffect re-triggering on parent re-renders
  const locationRef = useRef(locationString);

  useEffect(() => {
    // Keep refs up to date without re-running the map init
    locationRef.current = locationString;
  }, [locationString]);

  useEffect(() => {
    const initMap = () => {
      if (!window.google?.maps) {
        console.log("[v0] StaticMap: Google Maps not ready, retrying...");
        setTimeout(initMap, 500);
        return;
      }

      if (!mapRef.current) {
        console.log("[v0] StaticMap: Map container not found");
        return;
      }
      
      // DO NOT DO THIS: mapRef.current.innerHTML = "";
      // This line causes the conflict with React's DOM management.
      // We will let React handle the loading text removal.

      try {
        // --- 1. Parse Inputs ---
        const [latStr, lngStr] = locationRef.current.replace(/"/g, '').split(',');
        const mapCenter = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };

        // --- 2. Initialize Map ---
        const map = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          mapTypeId: 'satellite', // Satellite view is better for farms
          disableDefaultUI: true, // This is a display-only map
          gestureHandling: 'cooperative', // Allow scroll/pan without 'ctrl'
          zoom: 15, // Set a fixed, reasonable zoom
        });

        // --- 3. Draw Marker (Replaces Circle) ---
        const marker = new window.google.maps.Marker({
          position: mapCenter,
          map: map,
          title: "Farmer's Location",
        });

        // Signal to React that the map is ready and the loading text can be removed
        setIsReady(true);
        
      } catch (err: any) {
        console.error("[v0] StaticMap initialization error:", err);
        setError(`Failed to load map. Invalid location: ${locationRef.current}`);
      }
    };

    initMap();
  }, []); // Run ONLY ONCE

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  // Use a relative container to stack the map and the loading overlay
  return (
    <div
      className="relative w-full rounded-md border border-gray-300 shadow-sm bg-gray-100 overflow-hidden"
      style={{ 
        width: width, 
        height: height
      }}
    >
      {/* 1. The map container div. Google Maps will attach to this. */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 2. The loading overlay. React will remove this when isReady=true. */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p className="text-xs text-gray-500 text-center">Loading farm map...</p>
        </div>
      )}
    </div>
  )
}

