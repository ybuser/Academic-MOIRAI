import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import MarkerClusterer from "@google/markerclustererplus";
import styled from 'styled-components';

const StyledMap = styled.div`
  height: 100%;
  width: 100%;
`;

const MapView = ({ setSelectedPhilosopher, selectedPhilosopher, className}) => {
  const [markersData, setMarkersData] = useState([]);
  const [linesData, setLinesData] = useState([]);
  const [mapKey, setMapKey] = useState(Date.now()); // New state to track map key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  // Function to adjust overlapping coordinates
  const adjustCoordinates = (markers, newMarker, adjustment = 0.03) => {
    while (newMarker && markers.some(marker => marker.lat === newMarker.lat && marker.lng === newMarker.lng)) {
      newMarker.lat += adjustment;
      newMarker.lng += adjustment;
    }
  };

  const extractLocationData = (philosopher) => {
    const location = philosopher.residence || philosopher.educatedAt || philosopher.employer;
    if (location && location[0] && location[0].coordinates) {
      return {
        lat: location[0].coordinates.latitude,
        lng: location[0].coordinates.longitude,
        label: philosopher.name,
        id: philosopher.id
      };
    }
    return null;
  };


  useEffect(() => {
    // console.log("1 in useeffect");
    const fetchPhilosopherDetails = async (id) => {
      // console.log("2. getting detailes in ", id);
      const response = await fetch(`data/detail_json/Q${id}.json`);
      // console.log("3. response is ", response);
      return await response.json();
    };

    // console.log("4. in useeffect selected", selectedPhilosopher);

    const loadPhilosophers = async () => {
      // Clear previous data
      setMarkersData([]);
      setLinesData([]);
      
      let markers = [];
      const lines = [];
      const mainPhilosopher = await fetchPhilosopherDetails(selectedPhilosopher);
      let mainMarker = extractLocationData(mainPhilosopher);
    
      if (mainMarker) {
        adjustCoordinates(markers, mainMarker);
        markers.push(mainMarker);
    
        const edgePromises = [];
        for (let edgeType in mainPhilosopher.edges) {
          const edgesArray = Object.values(mainPhilosopher.edges[edgeType]);
          edgesArray.forEach(edge => {
            edgePromises.push(fetchPhilosopherDetails(edge.id.replace('Q', '')).then(details => {
              let marker = extractLocationData(details);
              if (marker) {
                adjustCoordinates(markers, marker);
                markers.push(marker);
                
                // Set default line color and then adjust based on edge type
                let lineColor = "#0000FF"; // Default blue
                if (edgeType === "taught") {
                  lineColor = "#ADD8E6"; // Light blue for taught
                } else if (edgeType === "learnedFrom") {
                  lineColor = "#FFB6C1"; // Light red for learnedFrom
                }
                
                lines.push({
                  from: { lat: mainMarker.lat, lng: mainMarker.lng },
                  to: { lat: marker.lat, lng: marker.lng },
                  options: {
                    strokeColor: lineColor,
                    strokeWeight: 2
                  }
                });
              }
            }));
          });
        }

        await Promise.all(edgePromises);
      }

      // console.log("7. in useeffect");

      setMarkersData(markers.filter(marker => marker)); // Filter out undefined markers
      setLinesData(lines);

      // console.log("8. loadphilosophers, selected ", selectedPhilosopher);
    };

    loadPhilosophers();
  }, [selectedPhilosopher]);

  useEffect(() => {
    setMapKey(Date.now()); // Update map key when selectedPhilosopher changes
  }, [selectedPhilosopher]);
  
  const mapRef = useRef(null);
  const onMapLoad = (map) => mapRef.current = map;
  const defaultCenter = { lat: 48.8566, lng: 2.3522 };
  const markerClustererRef = useRef(null);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }

      // Create new markers
      const googleMarkers = markersData.map(marker => {
        const googleMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          label: marker.label,
          clickable: true
        });
  
        googleMarker.addListener('click', () => {
          const philosopherId = marker.id.replace('Q', '');
          setSelectedPhilosopher(philosopherId); // Change to use marker.id
        });
  
        return googleMarker;
      });

      markerClustererRef.current = new MarkerClusterer(mapRef.current, googleMarkers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      });
    }
  }, [markersData, isLoaded, setSelectedPhilosopher]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>...loading</div>;

  return (
    <StyledMap className={className}>
      <GoogleMap
        key={mapKey} // Use the mapKey as a key for the GoogleMap component
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter}
        zoom={2}
      >
        {linesData.map((line, index) => (
          <Polyline
            key={index}
            path={[line.from, line.to]}
            options={line.options}
          />
        ))}
      </GoogleMap>
    </StyledMap>
  )
}

export default MapView