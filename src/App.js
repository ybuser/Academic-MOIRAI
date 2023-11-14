import styled, {ThemeProvider} from 'styled-components'
import TimelineView from './views/TimelineView'
import MapView from './views/MapView'
import DetailView from './views/DetailView'

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

  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1.5fr 1fr 1fr;
  grid-template-areas:
      "main main main"
      "content1 content2 content2";
  text-align: center;
  grid-gap: 2rem;
`

const TimelineWrapper = styled.div`
  grid-area: main;
  padding: 0.25rem;
  align-items: center;
  justify-content: center;
`
const MapWrapper = styled.div`
  grid-area: content1;
  padding: 0.25rem;
  align-items: center;
  justify-content: center;
`
const DetailWrapper = styled.div`
  grid-area: content2;
  padding: 0.25rem;
  align-items: center;
  justify-content: center;
`

function App() {
  return (
    <ThemeProvider theme={baseTheme}>
      <Container>
        {/* <H1> Academic MOIRAI </H1> */}
        <TimelineWrapper>
          <TimelineView/>
        </TimelineWrapper>

        <MapWrapper>
          <MapView/>
        </MapWrapper>

        <DetailWrapper>
          <DetailView/>
        </DetailWrapper>
      </Container>
    </ThemeProvider>
  );
}

export default App;