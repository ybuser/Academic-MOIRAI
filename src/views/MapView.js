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
  const [philosophersData, setPhilosophersData] = useState([]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, // Ensure you have the API key in your environment
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('data/philosophers.json');
      const data = await response.json();
      setPhilosophersData(data);
      console.log("123philosoher data is ", data);
    };

    fetchData();
  }, []);
  
  const mapRef = useRef(null);
  const onMapLoad = map => mapRef.current = map;
  const defaultCenter = useMemo(() => ({ lat: 48.8566, lng: 2.3522 }), []);

  if (!isLoaded) return <div>...loading</div>;

  console.log("Philosophers data: ", philosophersData);

  return (
    <StyledMap className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter} 
        zoom={2}
      >
        {philosophersData.map((philosopher, idx) => {
          // Ensure the latLng values are numbers
          const position = {
            lat: Number(philosopher.latLng.lat),
            lng: Number(philosopher.latLng.lng)
          };

          console.log("Marker position: ", position);

          return (
            <Marker 
              key={idx} 
              position={position} 
              label={philosopher.name}
            />
          );
        })}
        {/* {console.log("philosophers in map view ", philosophers)} */}
        {philosophersData.flatMap((philosopher, idx) => (
          philosopher.relationships.map((relationship, relIdx) => {
            const targetPhilosopher = philosophersData.find(p => p.name === relationship.name);
            if (targetPhilosopher) {
              const strokeWeight = relationship.relationshipStrength / 10;
              return (
                <Polyline 
                  key={`${idx}-${relIdx}`} 
                  path={[philosopher.latLng, targetPhilosopher.latLng]} 
                  options={{ 
                    strokeColor: "#FF0000",
                    strokeWeight: Math.max(1, strokeWeight), // Ensure that the stroke weight is at least 1
                  }} 
                />
              );
            }
            return null;
          })
        ))}
      </GoogleMap>
    </StyledMap>
  )
}

export default MapView