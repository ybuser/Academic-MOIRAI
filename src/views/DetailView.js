import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import philosophers from '../data/philosophers.json';

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
        target: r.name,
        strength: r.relationshipStrength
      }));

      const svg = d3.select(d3Container.current)
        .attr('width', 800)
        .attr('height', 600);
      svg.selectAll("*").remove(); // Clear SVG to avoid duplication
  
      // Set up the simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.name))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(100, 300));
  
      // Render links (lines)
      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => d.strength / 10) // Scale the strength value as needed
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