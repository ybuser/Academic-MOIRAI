import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import MarkerClusterer from "@google/markerclustererplus";
import styled from 'styled-components';

const StyledMap = styled.div`
  height: 100%;
  width: 100%;
`;

const MapView = ({ setSelectePhilosopher, selectedPhilosopher, className}) => {
  const [markersData, setMarkersData] = useState([]);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  });

  // Function to adjust overlapping coordinates
  const adjustCoordinates = (markers, newMarker, adjustment = 0.001) => {
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
        label: philosopher.name
      };
    }
    return null;
  };


  useEffect(() => {
    // console.log("1 in useeffect");
    const fetchPhilosopherDetails = async (id) => {
      // console.log("2. getting detailes in ", id);
      const response = await fetch(`data/detail_json/Q${id}.json`);
      console.log("3. response is ", response);
      return await response.json();
    };

    // console.log("4. in useeffect selected", selectedPhilosopher);

    const loadPhilosophers = async () => {
      let markers = [];
      const mainPhilosopher = await fetchPhilosopherDetails(selectedPhilosopher);
      let mainMarker = extractLocationData(mainPhilosopher);
      if (mainMarker) {
        adjustCoordinates(markers, mainMarker);
        markers.push(mainMarker);
      }

      const edgePromises = [];
      for (let edgeType in mainPhilosopher.edges) {
        Object.values(mainPhilosopher.edges[edgeType]).forEach(edge => {
          edgePromises.push(fetchPhilosopherDetails(edge.id.replace('Q', '')));
        });
      }

      const edgeDetails = await Promise.all(edgePromises);
      edgeDetails.forEach(details => {
        let marker = extractLocationData(details);
        if (marker) {
          adjustCoordinates(markers, marker);
          markers.push(marker);
        }
      });

      // console.log("7. in useeffect");

      setMarkersData(markers.filter(marker => marker)); // Filter out undefined markers


      // console.log("8. loadphilosophers, selected ", selectedPhilosopher);
    };

    loadPhilosophers();
  }, [selectedPhilosopher]);
  
  const mapRef = useRef(null);
  const onMapLoad = (map) => mapRef.current = map;
  const defaultCenter = { lat: 48.8566, lng: 2.3522 };

  useEffect(() => {
    if (isLoaded && mapRef.current && markersData.length > 0) {
      new MarkerClusterer(mapRef.current, markersData.map(marker => new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        label: marker.label,
      })), {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      });
    }
  }, [markersData, isLoaded]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>...loading</div>;

  return (
    <StyledMap className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter} 
        zoom={2}
      >
      </GoogleMap>
    </StyledMap>
  )
}

export default MapView