import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

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
  max-height:100%;
`;

const GraphWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 50%;
  // max-height:100%;
  height:100%;
`;

const DetailView = ({setSelectedPhilosopher, selectedPhilosopher, className}) => {
  const[philosopherDetails, setPhilosopherDetails] = useState(null);
  const d3Container = useRef(null);

  useEffect(() => {
    const loadPhilosopherDetails = async () => {
      try {
        const response = await fetch(`data/detail_json/Q${selectedPhilosopher}.json`);
        if (!response.ok) {
          console.log(await response.text());
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setPhilosopherDetails(data);
      } catch (error) {
        console.error("Error fetching philosopher details:", error);
      }
    };

    if (selectedPhilosopher) {
      loadPhilosopherDetails();
    }
  }, [selectedPhilosopher]);

  useEffect(() => {
    if (d3Container.current && philosopherDetails && philosopherDetails.edges) {
      const svg = d3.select(d3Container.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 920 690')
        .attr('preserveAspectRatio', 'xMidYMid meet');
      svg.selectAll("*").remove(); // Clear SVG to avoid duplication
      
      const nodes = [{
        id: philosopherDetails.id,
        name: philosopherDetails.name
      }]

      const edges = [];

      ['influenced', 'influencedBy'].forEach(edgeType => {
        if (philosopherDetails.edges[edgeType]) {
          Object.values(philosopherDetails.edges[edgeType]).forEach(edge => {
            nodes.push({
              id: edge.id,
              name: edge.name
            });
            edges.push({
              source: edgeType === 'influenced' ? philosopherDetails.id : edge.id,
              target: edgeType === 'influenced' ? edge.id : philosopherDetails.id,
            });
          });
        }
      });
      // console.log("edges are ", edges);

      // Remove duplicate nodes
      const uniqueNodes = Array.from(new Map(nodes.map(node => [node.id, node])).values());

      const fontSize = uniqueNodes.length < 5 ? '1.5rem' : '1rem';

      // Render links (lines) first
      const link = svg.append("g")
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke-width", 6)
        .attr("stroke", "#999");

      // Add a group for each node which will contain the circle and the text
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(uniqueNodes)
        .enter().append("g");

      // First add the text
      const labels = nodeGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .style("font-size", fontSize)
        .text(d => d.name);

      
      const handleNodeClick = (philosopherNode) => {
        const newSelectedPhilosopher = philosopherNode.srcElement.__data__.id.replace('Q', '') ; // Remove 'Q' if present
        setSelectedPhilosopher(newSelectedPhilosopher);
      };  


      // Use a small timeout to allow the browser to render the text and calculate the bounding boxes
      setTimeout(() => {
        labels.each(function(d) {
          const bbox = this.getBBox();
          d.width = bbox.width + 20; // Add some padding
          d.height = bbox.height + 12; // Add some padding
        });

        // Now add the circles
        const node = nodeGroup.insert("circle", "text")
          .attr("r", d => Math.sqrt(d.width * d.height)/1.5) // Calculate radius based on text size
          .attr("fill", "white")
          .attr("stroke", "black")
          .on("click", d => handleNodeClick(d)); 
        
        // Set up the simulation
        const simulation = d3.forceSimulation(uniqueNodes)
          .force("link", d3.forceLink(edges).id(d => d.id).distance(300))
          .force("charge", d3.forceManyBody().strength(-100))
          .force("center", d3.forceCenter(400, 320));

        
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
  }, [philosopherDetails, setSelectedPhilosopher]); // Dependency array

  const handleSetPhilosopher = () => {
    // Assuming you have a way to get philosopher data by ID
    setSelectedPhilosopher(448);
  };

  if (!philosopherDetails) {
    return <div>
      Loading philosopherDetails...
      <button onClick={handleSetPhilosopher}>Set Philosopher to 448</button>
      hi
    </div>;
  }

  return (
    <DetailContainer className={className}>
        <InfoWrapper>
            <h2>{philosopherDetails.name}</h2>
            <h3>Key Ideas</h3>
            {/* <ul>
              {philosophers[0].keyIdeas.map(idea => <li key={idea}>{idea}</li>)}
            </ul>
            <h3>Historical Context</h3>
            <p>{philosophers[0].historicalContext.join(', ')}</p> */}
            
        </InfoWrapper>
        <GraphWrapper>
            <svg ref={d3Container} />
        </GraphWrapper>
    </DetailContainer>
  )
}

export default DetailView;