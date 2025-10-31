// "use client"

// import { useEffect, useRef, useState } from "react"
// import { AlertCircle } from "lucide-react"

// interface LocationPickerProps {
//   onLocationSelect: (location: { lat: number; lng: number }) => void
// }

// export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
//   const mapRef = useRef<HTMLDivElement>(null)
//   const mapInstanceRef = useRef<any>(null)
//   const markerRef = useRef<any>(null)
//   const [error, setError] = useState("")
//   const [isReady, setIsReady] = useState(false)

//   useEffect(() => {
//     const initMap = () => {
//       // Check if Google Maps is available
//       if (!window.google?.maps) {
//         console.log("[v0] Google Maps not ready yet, retrying...")
//         setTimeout(initMap, 500)
//         return
//       }

//       if (!mapRef.current) {
//         console.log("[v0] Map container not found")
//         return
//       }

//       try {
//         const defaultLocation = { lat: 1.2921, lng: 36.8219 } // Center of India

//         const map = new window.google.maps.Map(mapRef.current, {
//           zoom: 6,
//           center: defaultLocation,
//           mapTypeControl: true,
//           fullscreenControl: true,
//           streetViewControl: false,
//         })

//         mapInstanceRef.current = map

//         // Add click listener to place marker
//         map.addListener("click", (event: any) => {
//           const lat = event.latLng.lat()
//           const lng = event.latLng.lng()

//           // Remove old marker if exists
//           if (markerRef.current) {
//             markerRef.current.setMap(null)
//           }

//           // Create new marker
//           const marker = new window.google.maps.Marker({
//             position: { lat, lng },
//             map: map,
//             title: "Your Farm Location",
//           })

//           markerRef.current = marker
//           onLocationSelect({ lat, lng })
//           console.log("[v0] Location selected:", { lat, lng })
//         })

//         setIsReady(true)
//         setError("")
//       } catch (err) {
//         console.error("[v0] Map initialization error:", err)
//         setError("Failed to load map. Please refresh the page.")
//       }
//     }

//     initMap()
//   }, [onLocationSelect])

//   if (error) {
//     return (
//       <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
//         <AlertCircle className="w-4 h-4 flex-shrink-0" />
//         <span>{error}</span>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-2">
//       <div
//         ref={mapRef}
//         className="w-full h-64 rounded-md border border-gray-300 shadow-sm bg-gray-100"
//         style={{ minHeight: "300px" }}
//       />
//       {isReady && <p className="text-xs text-gray-500">Click on the map to select your farm location</p>}
//       {!isReady && <p className="text-xs text-gray-500">Loading map...</p>}
//     </div>
//   )
// }


"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [error, setError] = useState("")
  const [isReady, setIsReady] = useState(false)

  // --- FIX for Re-rendering ---
  // Store the onLocationSelect prop in a ref.
  // This ensures the initMap (which runs only once)
  // always has access to the *latest* onLocationSelect function
  // without re-triggering the useEffect.
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);
  // --- END FIX ---

  useEffect(() => {
    const initMap = () => {
      // Check if Google Maps is available
      if (!window.google?.maps) {
        console.log("[v0] Google Maps not ready yet, retrying...")
        setTimeout(initMap, 500)
        return
      }

      if (!mapRef.current) {
        console.log("[v0] Map container not found")
        return
      }

      try {
        const defaultLocation = { lat: 1.2921, lng: 36.8219 } // Center of Nairobi

        // Define the custom map icon (a green pin) first
        const mapIcon = {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: '#FF0000', // red
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff', // White border
          scale: 1.5, // Make it a bit larger
          anchor: new window.google.maps.Point(12, 22), // Anchor at the pin's bottom center
        };
        
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 6,
          center: defaultLocation,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
        })

        mapInstanceRef.current = map

        // --- UPDATED LOGIC ---
        
        // 1. Create the marker immediately on load
        const marker = new window.google.maps.Marker({
          position: defaultLocation,
          map: map,
          icon: mapIcon, // Use the custom icon
          draggable: true, // Make the icon draggable
          title: "Drag me to your farm location!",
        })
        
        // 2. Store the marker reference
        markerRef.current = marker

        // 3. Helper function to update position and call callback
        const updatePosition = (latLng: any) => {
          const lat = latLng.lat()
          const lng = latLng.lng()

          // Move the existing marker
          marker.setPosition(latLng);
          
          // Update the hover title
          marker.setTitle(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)
          
          // --- FIX ---
          // Call the function from the ref
          onLocationSelectRef.current({ lat, lng })
          // --- END FIX ---
          
          console.log("[v0] Location selected:", { lat, lng })
        }

        // 4. Add listener for when the user finishes dragging the pin
        marker.addListener("dragend", (event: any) => {
          updatePosition(event.latLng)
        })

        // 5. Add a click listener to the map to "jump" the pin
        map.addListener("click", (event: any) => {
          updatePosition(event.latLng)
        })
        // --- END UPDATED LOGIC ---

        setIsReady(true)
        setError("")
      } catch (err) {
        console.error("[v0] Map initialization error:", err)
        setError("Failed to load map. Please refresh the page.")
      }
    }

    initMap()
  // --- FIX: Change dependency to empty array ---
  // This ensures the map is created ONLY ONCE
  }, []) 
  // --- END FIX ---

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        className="w-full h-64 rounded-md border border-gray-300 shadow-sm bg-gray-100"
        style={{ minHeight: "300px" }}
      />
      {isReady && <p className="text-xs text-gray-500">Drag the green pin to your farm location, or click on the map to move it.</p>}
      {!isReady && <p className="text-xs text-gray-500">Loading map...</p>}
    </div>
  )
}

