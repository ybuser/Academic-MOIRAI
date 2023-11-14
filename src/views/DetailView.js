import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';


const philosophers = [
  {
    "name": "Immanuel Kant",
    "country": "Prussia",
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



const DetailContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  height: 100%;
  max-width: 100%;
`;

const InfoWrapper = styled.div`
  flex: 1; 
  max-width: 50%; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 1rem;
`;

const GraphWrapper = styled.div`
  flex: 1;
  max-width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const DetailView = ({className}) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (d3Container.current && philosophers.length > 0) {
      const selectedPhilosopher = philosophers[0];
      
      // Preparing the nodes and links for the D3 graph
      const nodes = [selectedPhilosopher].concat(
        selectedPhilosopher.relationships.map(r => ({ name: r.name }))
      );

      const links = selectedPhilosopher.relationships.map(r => ({
        source: selectedPhilosopher.name,
        target: r.name
      }));

      const svg = d3.select(d3Container.current)
        .attr('width', 800)
        .attr('height', 600);
      svg.selectAll("*").remove(); // Clear SVG to avoid duplication
  
      // Set up the simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.name))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(400, 300)); // Adjust center based on SVG size
  
      // Render links (lines)
      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 2)
        .attr("stroke", "#999");
  
      // Render nodes (circles)
      const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5) // Radius of the circle
        .attr("fill", "blue"); // Change as needed

      // Render labels (text)
      const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.name);

      // Define the tick function for the simulation
      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);

          labels
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });
    }
  }, []); // Dependency array


  return (
    <DetailContainer className={className}>
        <InfoWrapper>
            <h2>{philosophers[0].name}</h2>
            <h3>Key Ideas</h3>
            <ul>
              {philosophers[0].keyIdeas.map(idea => <li key={idea}>{idea}</li>)}
            </ul>
            <h3>Historical Context</h3>
            <p>{philosophers[0].historicalContext.join(', ')}</p>
        </InfoWrapper>
        <GraphWrapper>
            <svg ref={d3Container} />
        </GraphWrapper>
    </DetailContainer>
  )
}

export default DetailView;