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

      // Render links (lines) first
      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => d.strength / 10)
        .attr("stroke", "#999");

      // Add a group for each node which will contain the rectangle and the text
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .enter().append("g");

      // First add the text so we can compute the bounding box and thus the width of the rectangle
      const labels = nodeGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .style("font-size", "10px")
        .text(d => d.name);

      // Use a small timeout to allow the browser to render the text and calculate the bounding boxes
      setTimeout(() => {
        labels.each(function(d) {
          const bbox = this.getBBox();
          d.width = bbox.width + 8; // Add some padding
          d.height = bbox.height + 4; // Add some padding
        });

        // Now add the rectangles with the computed width
        const node = nodeGroup.insert("rect", "text")
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("width", d => d.width)
          .attr("height", d => d.height)
          .attr("x", d => -d.width / 2)
          .attr("y", d => -d.height / 2);
        
        // Set up the simulation
        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.name).distance(100)) // Set a fixed distance between nodes
          .force("charge", d3.forceManyBody().strength(-200)) // Repel nodes from each other
          .force("center", d3.forceCenter(200, 300)); 
        
        // Define the tick function for the simulation
        simulation.on("tick", () => {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          nodeGroup
          .attr("transform", d => `translate(${d.x},${d.y})`);
        });
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