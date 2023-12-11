import React, { useState } from 'react';
import styled, {ThemeProvider} from 'styled-components'
import TimelineView from './views/TimelineView'
import MapView from './views/MapView'
import DetailView from './views/DetailView'
import importedData from './data/data.json';
import relationships from './data/relationships.json';

const baseTheme = {
  background: '#ccc',
  color: '#222',
}
const darkTheme = {
  background: '#222',
  color: '#fff',
}

const Container = styled.div`
  color: ${(props) => props.theme.color};
  background-color: ${(props) => props.theme.background};
  display: grid;
  height: 95vh;
  padding: 1rem; // Add padding around the entire container for a spacious feel
  grid-template-rows: auto auto auto; // Adjust this as needed for your layout
  grid-template-columns: repeat(3, 1fr); // 3 equal columns
  grid-template-areas:
    "timeline timeline timeline"
    "map detail detail";
  gap: 1rem; // Space between grid items
  font-family: 'Roboto', sans-serif; // Example modern font
  border-radius: 8px;

  @media screen and (max-width: 768px) {
    grid-template-rows: auto auto auto;
    grid-template-columns: 1fr;
    grid-template-areas:
      "timeline"
      "map"
      "detail";
  }
`;

const SubTitle = styled.div`
  text-align: left;
  font-weight: bold;
`

const Wrapper = styled.div`
  align-items: center;
  justify-content: center;
  border: 2px solid #b1c8de; 
  border-radius: 2px;
  max-height: 100%;
`

const ViewContainer = styled.div`
  background: #fff; // Card background
  border-radius: 8px; // Rounded corners for the card
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); // Subtle shadow for depth
  overflow: auto;
  display: flex;
  flex-direction: column; // Stack children vertically
  padding: 5px;
`;

const TimelineContainer = styled(ViewContainer)`
  grid-area: timeline;
`;

const MapContainer = styled(ViewContainer)`
  grid-area: map;
`;

const DetailContainer = styled(ViewContainer)`
  grid-area: detail;
`;

function App() {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState(58586);
  return (
    <ThemeProvider theme={baseTheme}>
      <Container>
        {/* <H1> Academic MOIRAI </H1> */}
        <TimelineContainer>
          {/* <SubTitle>
          Timeline View
          </SubTitle> */}
          {/* <Wrapper> */}
            <TimelineView
              data={importedData}
              relationships={relationships}
              setSelectedPhilosopher={setSelectedPhilosopher}
              selectedPhilosopher={selectedPhilosopher}
            />
          {/* </Wrapper> */}
        </TimelineContainer>

        <MapContainer>
          <SubTitle>
            Map View
          </SubTitle>
          {/* <Wrapper> */}
            <MapView
              setSelectedPhilosopher={setSelectedPhilosopher}
              selectedPhilosopher={selectedPhilosopher}
            />
          {/* </Wrapper> */}
        </MapContainer>

        <DetailContainer>
          <SubTitle>
            Detail View
          </SubTitle>
          {/* <Wrapper> */}
            <DetailView
              setSelectedPhilosopher={setSelectedPhilosopher}
              selectedPhilosopher={selectedPhilosopher}
            />
          {/* </Wrapper> */}
        </DetailContainer>
      </Container>
    </ThemeProvider>
  );
}

export default App;