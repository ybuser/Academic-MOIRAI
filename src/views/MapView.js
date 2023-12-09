import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import styled from 'styled-components';
import Loading from '../components/Loading';
// import philosophers from '../data/philosophers.json';

const StyledMap = styled.div`
  height: 100%;
  width: 100%;
`;

const MapView = ({ setSelectePhilosopher, selectedPhilosopher, className}) => {
  const [markersData, setMarkersData] = useState([]);
  const [philosophersData, setPhilosophersData] = useState([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, // Ensure you have the API key in your environment
  });

  useEffect(() => {
    console.log("1 in useeffect");
    const fetchPhilosopherDetails = async (id) => {
      console.log("2. getting detailes in ", id);
      const response = await fetch(`data/detail_json/Q${id}.json`);
      console.log("3. response is ", response);
      return await response.json();
    };

    console.log("4. in useeffect selected", selectedPhilosopher);

    const extractLocationData = (philosopher) => {
      const location = philosopher.residence || philosopher.educatedAt || philosopher.employer;
      if (location && location[0] && location[0].coordinates) {
        return {
          lat: location[0].coordinates.latitude,
          lng: location[0].coordinates.longitude,
          label: philosopher.name
        };
      }
    };

    const loadPhilosophers = async () => {
      let markers = [];
      console.log("5. now before fetch");
      const mainPhilosopher = await fetchPhilosopherDetails(selectedPhilosopher);
      markers.push(extractLocationData(mainPhilosopher));
      console.log("6. fetched");

      for (let edgeType in mainPhilosopher.edges) {
        for (let edge of Object.values(mainPhilosopher.edges[edgeType])) {
          const philosopherDetails = await fetchPhilosopherDetails(edge.id.replace('Q', ''));
          markers.push(extractLocationData(philosopherDetails));
        }
      }

      console.log("7. in useeffect");

      setMarkersData(markers.filter(marker => marker)); // Filter out undefined markers


      console.log("8. loadphilosophers, selected ", selectedPhilosopher);
    };

    loadPhilosophers();
  }, [selectedPhilosopher]);
  
  const mapRef = useRef(null);
  const onMapLoad = map => mapRef.current = map;
  const defaultCenter = useMemo(() => ({ lat: 48.8566, lng: 2.3522 }), []);

  if (!isLoaded) return <div>...loading</div>;

  console.log("9. Philosophers data: ", philosophersData);

  return (
    <StyledMap className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter} 
        zoom={2}
      >
        {markersData.map((marker, idx) => (
          <Marker
            key={idx}
            position={{lat: marker.lat, lng: marker.lng}}
            label={marker.label}
          />
        ))}
      </GoogleMap>
    </StyledMap>
  )
}

export default MapView