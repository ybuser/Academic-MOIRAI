import React, { useState, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import styled from 'styled-components';
import Loading from '../components/Loading';
import philosophers from '../data/philosophers.json';

const StyledMap = styled.div`
  height: 100%;
  width: 100%;
`;

const MapView = ({className}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, // Ensure you have the API key in your environment
  });
  
  const mapRef = useRef(null);
  const onMapLoad = map => mapRef.current = map;
  const defaultCenter = useMemo(() => ({ lat: 48.8566, lng: 2.3522 }), []);

  if (!isLoaded) return <div>...loading</div>;


  return (
    <StyledMap className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter} 
        zoom={2}
      >
        {philosophers.map((philosopher, idx) => {
          // Ensure the latLng values are numbers
          const position = {
            lat: Number(philosopher.latLng.lat),
            lng: Number(philosopher.latLng.lng)
          };
          return (
            <Marker 
              key={idx} 
              position={position} 
              label={philosopher.name}
            />
          );
        })}
        {console.log("philosophers in map view ", philosophers)}
        {philosophers.flatMap((philosopher, idx) => (
          philosopher.relationships.map((relationship, relIdx) => {
            const targetPhilosopher = philosophers.find(p => p.name === relationship.name);
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