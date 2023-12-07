import React, { useState } from 'react';
import styled, {ThemeProvider} from 'styled-components';

import TimelineView from './views/TimelineView';
import MapView from './views/MapView';
import DetailView from './views/DetailView';
import importedData from './data/sample_data.json';
import relationships from './data/relationships.json';
import philosophers from './data/philosophers.json';

const baseTheme = {
  background: '#fff',
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
  height: 100vh;

  grid-template-rows: 1fr 1.5fr;
  grid-template-columns: 1.5fr 1fr 1fr;
  grid-template-areas:
      "main main main"
      "content1 content2 content2";
  text-align: center;
  grid-gap: 2rem;
`

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

const TimelineContainer = styled.div`
  grid-area: main;
  max-height: 50vh;
`
const MapContainer = styled.div`
  grid-area: content1;
  max-height: 50vh;
`
const DetailContainer = styled.div`
  grid-area: content2;
  max-height: 50vh;
`

function App() {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState(307);
  return (
    <ThemeProvider theme={baseTheme}>
      <Container>
        {/* <H1> Academic MOIRAI </H1> */}
        <TimelineContainer>
          <SubTitle>
          Timeline View
          </SubTitle>
          <Wrapper>
            <TimelineView
              data={importedData}
              relationships={relationships}
              setSelectedPhilosopher={setSelectedPhilosopher}
              selectedPhilosopher={selectedPhilosopher}
            />
          </Wrapper>
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
          <Wrapper>
            <DetailView
              setSelectedPhilosopher={setSelectedPhilosopher}
              selectedPhilosopher={selectedPhilosopher}
            />
          </Wrapper>
        </DetailContainer>
      </Container>
    </ThemeProvider>
  );
}

export default App;