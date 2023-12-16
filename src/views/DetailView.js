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
  
    textElement.text('');
  
    if (words.length === 1) {
      // For a single-word name, simply set the text without adding tspans
      textElement.text(words[0]);
    } else {
      // Calculate the total height of all lines
      const totalHeight = words.length * lineHeight;
  
      words.forEach((word, index) => {
        // Check if the word is an initial
        if (word.endsWith('.') && word.length <= 2 && index < words.length - 1) {
          word += ' '; // Add a space for initials, except for the last word
        }
  
        // Calculate startY for each line
        let startY;
        if (index === 0) {
          // Adjust startY for the first line to center the text block vertically
          startY = `-${(totalHeight / 2 - lineHeight / 2 - 0.4).toFixed(1)}em`;
        } else {
          // For subsequent lines, simply move down by lineHeight
          startY = `${lineHeight}em`;
        }
  
        // Add each word as a separate tspan
        textElement.append('tspan')
          .text(word)
          .attr('x', 0)
          .attr('dy', startY);
      });
    }
  };
  
  const calculateDistance = (similarity) => {
    // Adjust these values as needed for your specific use case
    const maxDistance = 300; // maximum distance for low similarity
    const minDistance = 0; // minimum distance for high similarity

    return maxDistance - similarity * (maxDistance - minDistance);
  };

  const getLineColor = (edgeType) => {
    switch (edgeType) {
      case "taught":
        return "#0015D1"; // Blue for "taught"
      case "learnedFrom":
        return "#D1000A"; // Red for "learnedFrom"
      case "influenced":
        return "#3399FF"; // Light blue for "influenced"
      case "influencedBy":
        return "#E66369"; // Light red for "influencedBy"
      default:
        return "#0000FF"; // Default blue
    }
  };

  useEffect(() => {
    if (!selectedPhilosopher) {
      // If no selected philosopher, clear details and do not proceed further
      setPhilosopherDetails(null);
      return;
    }

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
    if (!philosopherDetails || !philosopherDetails.edges) {
      // If no philosopher details or edges, do not proceed with graph rendering
      return;
    }

    if (d3Container.current) {
      const svg = d3.select(d3Container.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 920 720')
        .attr('preserveAspectRatio', 'xMidYMid meet');
      svg.selectAll("*").remove(); // Clear SVG to avoid duplication

      // Define arrow markers for each edge type
      svg.append('defs').selectAll('marker')
      .data(['taught', 'learnedFrom', 'influenced', 'influencedBy'])
      .enter().append('marker')
        .attr('id', d => `arrow-${d}`) 
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5) // Adjust this value to move the arrow position
        .attr('refY', 0)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', d => getLineColor(d));
      
      const nodes = [{
        id: philosopherDetails.id,
        name: philosopherDetails.name
      }]
      const edges = [];
      const addedEdges = new Map(); // Tracks which edges have been added

      const addEdge = (source, target, similarity, edgeType) => {
        const edgeKey = `${source}->${target}`;
        if (!addedEdges.has(edgeKey)) {
          edges.push({
            source,
            target,
            similarity,
            edgeType,

            arrow: (edgeType === 'influencedBy' || edgeType === 'learnedFrom') ? 'to' : 'from'
          });
          addedEdges.set(edgeKey, true);
        }
      };

      // Prioritize "taught" and "learnedFrom"
      ['taught', 'learnedFrom'].forEach(edgeType => {
        if (philosopherDetails.edges[edgeType]) {
          Object.values(philosopherDetails.edges[edgeType]).forEach(edge => {
            nodes.push({ id: edge.id, name: edge.name });
            addEdge(
              edgeType === 'taught' ? philosopherDetails.id : edge.id,
              edgeType === 'taught' ? edge.id : philosopherDetails.id,
              edge.similarity,
              edgeType // Pass the edge type
            );
          });
        }
      });

      // Then add "influenced" and "influencedBy" if not already added
      ['influenced', 'influencedBy'].forEach(edgeType => {
        if (philosopherDetails.edges[edgeType]) {
          Object.values(philosopherDetails.edges[edgeType]).forEach(edge => {
            const edgeKey = `${philosopherDetails.id}->${edge.id}`;
            const reverseEdgeKey = `${edge.id}->${philosopherDetails.id}`;
            // Check if the edge or its reverse has not already been added
            if (!addedEdges.has(edgeKey) && !addedEdges.has(reverseEdgeKey)) {
              nodes.push({ id: edge.id, name: edge.name });
              addEdge(
                edgeType === 'influenced' ? philosopherDetails.id : edge.id,
                edgeType === 'influenced' ? edge.id : philosopherDetails.id,
                edge.similarity,
                edgeType // Pass the edge type
              );
            }
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
        .attr("stroke", d => getLineColor(d.edgeType)) // Set the color based on the edge type
        .attr("marker-end" , d => `url(#arrow-${d.edgeType})`); // Use the arrow marker based on the direction

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
          d.width = bbox.width + 20;
          d.height = bbox.height + 12;
          // Calculate the radius based on node size, and store it in the node data.
          d.radius = Math.sqrt(d.width * d.height) / 1.6; // Update this formula as needed
        });

        // Now add the circles
        const node = nodeGroup.insert("circle", "text")
          .attr("r", d => Math.sqrt(d.width * d.height)/1.6) // Calculate radius based on text size
          .attr("fill", "white")
          .attr("stroke", "black")

        node.on("click", handleNodeClick); 
        labels.on("click", handleNodeClick); 

        const centralNode = nodes.find(node => node.id === philosopherDetails.id);
        const otherNodes = nodes.filter(node => node.id !== philosopherDetails.id);
        
        // Set up the simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id)
          .distance(d => calculateDistance(d.similarity)))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(400, 320))
        .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.width * d.height)/1.2 + 10)) // Prevent overlap
        .force("radial", d3.forceRadial(300, 400, 320).strength(0.8));

        // Apply the radial force only to the non-central nodes
        simulation.force("radial").initialize(otherNodes);

        
        // Define the tick function for the simulation
        simulation.on("tick", () => {
          link
            .attr("x1", d => d.source.x + (d.target.x - d.source.x) * d.source.radius / Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y))
            .attr("y1", d => d.source.y + (d.target.y - d.source.y) * d.source.radius / Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y))
            .attr("x2", d => {
              // Subtract the radius from the line's length so the arrowhead is visible
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const gamma = Math.atan2(dy, dx); // Calculate the angle of the line
              const offsetX = Math.cos(gamma) * (d.target.radius + 10); // Add some padding if needed
              const offsetY = Math.sin(gamma) * (d.target.radius + 10); // Add some padding if needed
              return d.target.x - offsetX;
            })
            .attr("y2", d => {
              // Subtract the radius from the line's length so the arrowhead is visible
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const gamma = Math.atan2(dy, dx); // Calculate the angle of the line
              const offsetX = Math.cos(gamma) * (d.target.radius + 10); // Add some padding if needed
              const offsetY = Math.sin(gamma) * (d.target.radius + 10); // Add some padding if needed
              return d.target.y - offsetY;
            });


          nodeGroup
            .attr("transform", d => `translate(${d.x},${d.y})`);
        });
      });
    }
  }, [philosopherDetails, setSelectedPhilosopher]); // Dependency array

  if (!selectedPhilosopher) {
    return <DetailContainer className={className}>
      <GraphWrapper>
        {/* Display a message or leave empty as per your design */}
        <div>Select a philosopher to view details.</div>
      </GraphWrapper>
    </DetailContainer>;
  }

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
      중심 철학자와 유사할수록 노드 사이의 거리가 가깝습니다.
        <DetailFacts philosopherDetails={philosopherDetails} />
        
        <GraphWrapper>
            
            <svg ref={d3Container} />
        </GraphWrapper>
    </DetailContainer>
  )
}

export default DetailView;