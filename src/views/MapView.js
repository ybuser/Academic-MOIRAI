import React, { useState, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from "@react-google-maps/api";
import Loading from '../components/Loading';
import styled from 'styled-components';


const StyledMap = styled.div`
  height: 100%;
  width: 100%;
`;

const MapView = ({className}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, // Ensure you have the API key in your environment
  });

  const philosophers = [
    {
      "name": "Immanuel Kant",
      "country": "Prussia",
      "latLng": { "lat": 54.7104, "lng": 20.4522 }, // Kaliningrad, Russia (formerly Königsberg, Prussia)
      "birth": "1724-04-22",
      "death": "1804-02-12",
      "keyIdeas": [
        "Categorical imperative",
        "Universal moral principle",
        "Transcendental idealism"
      ],
      "historicalContext": [
        "18th-century Enlightenment"
      ],
      "relationships": [
        { "name": "David Hume", "relationshipStrength": 90, "relationshipType": "influenced by" },
        { "name": "Georg Wilhelm Friedrich Hegel", "relationshipStrength": 75, "relationshipType": "influenced" },
        { "name": "Arthur Schopenhauer", "relationshipStrength": 70, "relationshipType": "influenced" },
        { "name": "Johann Gottlieb Fichte", "relationshipStrength": 65, "relationshipType": "influenced" },
        { "name": "Friedrich Schelling", "relationshipStrength": 60, "relationshipType": "influenced" },
        { "name": "Søren Kierkegaard", "relationshipStrength": 55, "relationshipType": "critical engagement" },
        { "name": "Friedrich Nietzsche", "relationshipStrength": 50, "relationshipType": "critical engagement" },
        { "name": "Jean-Paul Sartre", "relationshipStrength": 45, "relationshipType": "influenced" }
      ]
    },
    {
      "name": "David Hume",
      "country": "Scotland",
      "latLng": { "lat": 55.9533, "lng": -3.1883 }, // Edinburgh, Scotland
      "birth": "1711-05-07",
      "death": "1776-08-25",
      "keyIdeas": [
        "Empiricism",
        "Skepticism",
        "Naturalism"
      ],
      "historicalContext": [
        "Scottish Enlightenment"
      ],
      "relationships": [
        { "name": "Immanuel Kant", "relationshipStrength": 85, "relationshipType": "influenced" },
        { "name": "Jean-Jacques Rousseau", "relationshipStrength": 65, "relationshipType": "contemporaries" }
      ],
    },
    {
      "name": "Friedrich Nietzsche",
      "country": "Germany",
      "latLng": { "lat": 50.7374, "lng": 7.0982 }, // Bonn, Germany
      "birth": "1844-10-15",
      "death": "1900-08-25",
      "keyIdeas": [
        "Existentialism",
        "Nihilism",
        "Will to power"
      ],
      "historicalContext": [
        "19th-century philosophy"
      ],
      "relationships": [
        { "name": "Arthur Schopenhauer", "relationshipStrength": 80, "relationshipType": "influenced by" },
        { "name": "Søren Kierkegaard", "relationshipStrength": 70, "relationshipType": "shared ideas" }
      ],
    },
    {
      "name": "Jean-Paul Sartre",
      "country": "France",
      "latLng": { "lat": 48.8566, "lng": 2.3522 }, // Paris, France
      "birth": "1905-06-21",
      "death": "1980-04-15",
      "keyIdeas": [
        "Existentialism",
        "Phenomenology",
        "Existential psychoanalysis"
      ],
      "historicalContext": [
        "20th-century philosophy"
      ],
      "relationships": [
        { "name": "Simone de Beauvoir", "relationshipStrength": 90, "relationshipType": "partner" },
        { "name": "Albert Camus", "relationshipStrength": 75, "relationshipType": "contemporaries" }
      ],
    },
    {
      "name": "Simone de Beauvoir",
      "country": "France",
      "latLng": { "lat": 48.8566, "lng": 2.3522 }, // Paris, France
      "birth": "1908-01-09",
      "death": "1986-04-15",
      "keyIdeas": [
        "Feminist existentialism",
        "Ethics of ambiguity"
      ],
      "historicalContext": [
        "20th-century philosophy"
      ],
      "relationships": [
        { "name": "Jean-Paul Sartre", "relationshipStrength": 90, "relationshipType": "partner" },
        { "name": "Friedrich Nietzsche", "relationshipStrength": 65, "relationshipType": "influenced by" }
      ],
    },
    // ... add other philosopher objects
  ];
  
  const mapRef = useRef(null);
  const onMapLoad = map => mapRef.current = map;
  const defaultCenter = useMemo(() => ({ lat: 48.8566, lng: 2.3522 }), []);

  // Function to get LatLngBounds for fitting the map to markers
  const getBounds = (philosophers) => {
    const bounds = new window.google.maps.LatLngBounds();
    philosophers.forEach(({ latLng }) => {
      bounds.extend(new window.google.maps.LatLng(latLng));
    });
    return bounds;
  };

  if (!isLoaded) return <div>{Loading}</div>;


  return (
    <StyledMap className={className}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
        center={defaultCenter}
        zoom={2}
      >
        {philosophers.map((philosopher, idx) => (
          <Marker 
            key={idx} 
            position={philosopher.latLng} 
            label={philosopher.name}
          />
        ))}
        {philosophers.map((philosopher, idx) => (
          philosopher.relationships.map((relationship, relIdx) => {
            const targetPhilosopher = philosophers.find(p => p.name === relationship.name);
            if (targetPhilosopher) {
              return (
                <Polyline 
                  key={`${idx}-${relIdx}`} 
                  path={[philosopher.latLng, targetPhilosopher.latLng]} 
                  options={{ strokeColor: "#FF0000" }} 
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