import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import DetailFacts from '../components/DetailFacts';

const DetailContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  height: 100%;
  max-width: 100%;
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

  const splitNameIntoTspan = (d, textElement, fontSize) => {
    const words = d.name.split(' ');
    const lineHeight = 1.2; // Adjust based on line height in em
    const lineCount = words.length;
    const totalHeight = lineCount * lineHeight; // Total height in em
    const startY = -(totalHeight - 1) / 3 + "em"; // Centering adjustment
  
    textElement.text('');
  
    for (let i = 0; i < words.length; i++) {
      textElement.append('tspan')
        .text(words[i])
        .attr('x', 0)
        .attr('dy', i === 0 ? startY : lineHeight + "em");
    }
  };

  const calculateDistance = (similarity) => {
    // Adjust these values as needed for your specific use case
    const maxDistance = 300; // maximum distance for low similarity
    const minDistance = 10; // minimum distance for high similarity

    return maxDistance - similarity * (maxDistance - minDistance);
  };

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
      const width = d3Container.current.clientWidth;
      const height = d3Container.current.clientHeight;

      const svg = d3.select(d3Container.current)
        .attr('width', width)
        .attr('height', height);
      svg.selectAll("*").remove(); // Clear SVG to avoid duplication
      
      const nodes = [{
        id: philosopherDetails.id,
        name: philosopherDetails.name
      }]

      const edges = [];

      // Extract edges and similarity scores
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
              similarity: edge.similarity // Add similarity score to the edge
            });
          });
        }
      });
      // console.log("edges are ", edges);

      // Remove duplicate nodes
      const uniqueNodes = Array.from(new Map(nodes.map(node => [node.id, node])).values());

      const fontSize = uniqueNodes.length < 5 ? '1.8rem' : '1.3rem';

      // Render links (lines) first
      const link = svg.append("g")
        .selectAll("line")
        .data(edges)
        .join("line")
        .attr("stroke-width", 8)
        .attr("stroke", "#999");

      // Add a group for each node which will contain the circle and the text
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(uniqueNodes)
        .enter().append("g");

      // First add the text
      const labels = nodeGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", fontSize)
        .each(function(d) {
          splitNameIntoTspan(d, d3.select(this), fontSize);
        });

      
      const handleNodeClick = (philosopherNode) => {
        const newSelectedPhilosopher = philosopherNode.srcElement.__data__.id.replace('Q', '') ; // Remove 'Q' if present
        setSelectedPhilosopher(newSelectedPhilosopher);
      };  


      // Use a small timeout to allow the browser to render the text and calculate the bounding boxes
      setTimeout(() => {
        labels.each(function(d) {
          const bbox = this.getBBox();
          d.width = bbox.width; // Add some padding
          d.height = bbox.height; // Add some padding
        });

        // Now add the circles
        const node = nodeGroup.insert("circle", "text")
          .attr("r", d => Math.sqrt(d.width * d.height)/1.2) // Calculate radius based on text size
          .attr("fill", "white")
          .attr("stroke", "black")
          .on("click", d => handleNodeClick(d)); 

        const centralNode = nodes.find(node => node.id === philosopherDetails.id);
        const otherNodes = nodes.filter(node => node.id !== philosopherDetails.id);
        const radialForce = d3.forceRadial(150, 400, 320).strength(0.8);
        
        // Set up the simulation
        const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(edges).id(d => d.id)
            .distance(d => calculateDistance(d.similarity))) // Use similarity to determine distance
          .force("charge", d3.forceManyBody().strength(-2000))
          .force("center", d3.forceCenter(width/2 + 200, height/2 + 150));


        // Apply the radial force only to the non-central nodes
        // simulation.force("radial").initialize(otherNodes);

        
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
    setSelectedPhilosopher(859);
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
        <DetailFacts philosopherDetails={philosopherDetails} />
        <GraphWrapper>
            <svg ref={d3Container} />
        </GraphWrapper>
    </DetailContainer>
  )
}

export default DetailView;