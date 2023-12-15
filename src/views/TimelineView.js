import React, { useState, useEffect, useRef } from 'react'
import * as d3 from "d3";
import { act } from 'react-dom/test-utils';
import Button from '@mui/material/Button';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const TimelineView = (props) => {
  
  const svgContainerRef = useRef(null); 
  const splotSvg = useRef(null);
  const [zoomScale, setZoomScale] = useState(1);
  const minScale = 0.05;
  const maxScale = 1;
  const [desiredVisiblePercentage, setDesiredVisiblePercentage] = useState(80); // Initial value set to 100%
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  let data = props.data;
  let relationships = props.relationships; 
  let display = 1;

  const legendDataBackup = [
    { color: "#0015D1", text: "Taught" },
    { color: "#3399FF", text: "Influenced" },
    { color: "#D1000A", text: "LearnedFrom" },
    { color: "#E66369", text: "InfluencedBy" }
  ];

  const legendData = [
    { color: "#0015D1", text: "Taught" },
    { color: "#66CCFF", text: "Influenced" },
    { color: "#D1000A", text: "LearnedFrom" },
    { color: "#EEA3B1", text: "InfluencedBy" }
  ];

  const buttonStyle = {
    width: '30px', 
    height: '30px', 
    fontSize: '20px',
    padding: '5px', 
    margin: '5px', 
    cursor: 'pointer' 
  };

  const computeBarYPosition = (data, direction = "center") => {
    const xOverlaps = (a, b) => {
      let offset = d3.scaleLinear().domain([minScale, maxScale]).range([(a.name.length + b.name.length) * 4, 1])(zoomScale);
      return a.birth < b.death + offset && a.death + offset > b.birth;
    }
  
    const yPos = [];
    const lastBars = {};
  
    let minRow = 0;
    let maxRow = 0;
  
    data.sort((a, b) => a.birth - b.birth);
  
    data.forEach((d, i) => {
      if (i === 0) {
        yPos[i] = 0;
        lastBars[0] = d;
        return;
      }
  
      let optimalRow;
      let minDeathYear = Infinity;
  
      for (const row of Object.keys(lastBars).map(Number)) {
        if (!xOverlaps(lastBars[row], d) && lastBars[row]?.death < minDeathYear) {
          optimalRow = row;
          minDeathYear = lastBars[row]?.death;
        }
      }
  
      if (optimalRow === undefined) {
        if (direction === "top") {
          optimalRow = maxRow + 1;
        } else if (direction === "bottom") {
          optimalRow = minRow - 1;
        } else {
          optimalRow = Math.abs(minRow - 1) < maxRow + 1 ? minRow - 1 : maxRow + 1;
        }
      }
  
      yPos[i] = optimalRow;
      lastBars[optimalRow] = d;
  
      if (optimalRow < minRow) {
        minRow = optimalRow;
      }
      if (optimalRow > maxRow) {
        maxRow = optimalRow;
      }
    });
  
    return yPos;
  }

  const findConnectedNodes = (selectedId) => {
    const connectedNodes = relationships
      .filter(rel => rel.source === selectedId || rel.target === selectedId)
      .map(rel => rel.source === selectedId ? rel.target : rel.source);
    return [selectedId, ...new Set(connectedNodes)];
  };

  const centerAlignment = (selectedId) => {
    if (selectedId == null) return;
    const nodeX = xScale((selectedId.birth + selectedId.death) / 2);
    const nodeIndex = data.indexOf(selectedId);
    const nodeY = yScale(yPos[nodeIndex]);

    const containerWidth = svgContainerRef.current.clientWidth;
    const containerHeight = svgContainerRef.current.clientHeight;

    const scrollX = nodeX - containerWidth / 2;
    const scrollY = nodeY - containerHeight / 2;

    svgContainerRef.current.scrollLeft = scrollX;
    svgContainerRef.current.scrollTop = scrollY;

  };

  // Initialize activeNode with selected philosopher and connected nodes
  const [activeNode, setActiveNode] = useState([]);

  const margin = ({ top: 10, right: 20, bottom: 50, left: 20 }); 
  const barHeight = 20;
  const maxYear = Math.max(...data.map(d => d.death)) + 20;
  const minYear = Math.min(...data.map(d => d.birth)) - 20;
  const timelineLength = maxYear - minYear;
  const extraHeightForXAxis = 30; 


  let widthPerYear = 10;
  let width = widthPerYear * timelineLength + margin.left + margin.right;

  let yPos = computeBarYPosition(data);
  let yPosMax = Math.max(...yPos);
  let yPosMin = Math.min(...yPos);
  let chartHeight = (yPosMax - yPosMin) * barHeight * 2;
  let height = chartHeight + margin.top + margin.bottom;
  let svgHeight = chartHeight + margin.top + margin.bottom;
  let containerHeight = svgHeight + extraHeightForXAxis;

  let xScale = d3.scaleLinear().domain([minYear, maxYear]).range([margin.left, width - margin.right]);
  let yScale = d3.scalePoint().domain(d3.range(yPosMin, yPosMax + 1)).range([height - margin.bottom, margin.top]).padding(1.5);
  
  useEffect(() => {
    const svg = d3.select(splotSvg.current);
    svg.selectAll(".arrow-layer").remove();
    svg.selectAll(".lines-layer").remove();
    svg.selectAll(".x-axis").remove();

    if (props.selectedPhilosopher != null) {
      setActiveNode(findConnectedNodes('Q' + props.selectedPhilosopher.toString()));
    }
    else {
      setActiveNode([]);
    }

  }, [props.selectedPhilosopher, desiredVisiblePercentage]);

  useEffect(() => {
    widthPerYear = 10*zoomScale;
    width = widthPerYear * timelineLength + margin.left + margin.right;

    // desiredVisiblePercentage = d3.scaleLinear().domain([minScale, maxScale]).range([80, 0])(zoomScale);
    data = props.data.filter(d => d.priority >= desiredVisiblePercentage/100);
    relationships = props.relationships.filter(rel => data.find(d => d.id === rel.source) && data.find(d => d.id === rel.target));

    yPos = computeBarYPosition(data);
    yPosMax = Math.max(...yPos);
    yPosMin = Math.min(...yPos);
    chartHeight = (yPosMax - yPosMin) * barHeight * 2;
    height = chartHeight + margin.top + margin.bottom;
    svgHeight = chartHeight + margin.top + margin.bottom;
    containerHeight = svgHeight + extraHeightForXAxis;
  
    xScale = d3.scaleLinear().domain([minYear, maxYear]).range([margin.left, width - margin.right]);
    yScale = d3.scalePoint().domain(d3.range(yPosMin, yPosMax + 1)).range([height - margin.bottom, margin.top]).padding(1.5);

    if (activeNode.length > 0) {
      centerAlignment(data.find(d => d.id === activeNode[0]));
    }

    const svg = d3.select(splotSvg.current)
      .attr("width", width)
      .attr("height", svgHeight);


    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "black");

    const centuryStart = Math.ceil(minYear / 100) * 100;
    const centuries = d3.range(centuryStart, maxYear, 100);
  
    const linesLayer = svg.append("g").attr("class", "lines-layer");
  
    linesLayer.append("g")
      .selectAll("line")
      .data(centuries)
      .join("line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", margin.bottom)
        .attr("y2", chartHeight)
        .style("stroke", "rgba(0,0,0,0.2)")
        .style("stroke-dasharray", "2,2");

    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(xScale)
        .tickValues(d3.range(Math.floor(minYear / 20) * 20, maxYear, Math.ceil(200 / widthPerYear / 10) * 10))
        .tickFormat(d3.format(".0f"))
        .tickSizeOuter(0));

    const arrowLayer = svg.append("g").attr("class", "arrow-layer");

    relationships.forEach(rel => {
      const sourceNode = data.find(d => d.id === rel.source);
      const targetNode = data.find(d => d.id === rel.target);
    
      if (sourceNode && targetNode) {
        const sourceIndex = data.indexOf(sourceNode);
        const targetIndex = data.indexOf(targetNode);
        
        // let arrowStrokeDasharray;
        // switch (rel.type) {
        //   case 'influenced':
        //     arrowStrokeDasharray = "5,5"; // Dashed line
        //     break;
        //   case 'taught':
        //     arrowStrokeDasharray = "0"; // Solid line
        //     break;
        //   default:
        //     arrowStrokeDasharray = "0";
        // }     
        
        let arrowColor;
        if (activeNode[0] == sourceNode.id && rel.type == 'taught') {
          arrowColor = "#0015D1";
        } else if (activeNode[0] == sourceNode.id && rel.type == 'influenced') {
          arrowColor = "#66CCFF";
        } else if (activeNode[0] == targetNode.id && rel.type == 'taught') {
          arrowColor = "#D1000A";
        } else if (activeNode[0] == targetNode.id && rel.type == 'influenced') {
          arrowColor = "#EEA3B1";
        }

        arrowLayer.append("line")
          .data([rel])
          .attr("x1", xScale((sourceNode.death+sourceNode.birth)/2))
          .attr("y1", yPos[sourceIndex] < yPos[targetIndex] ? yScale(yPos[sourceIndex]) : yScale(yPos[sourceIndex]) + barHeight)
          .attr("x2", xScale((targetNode.birth+targetNode.death)/2))
          .attr("y2", yPos[sourceIndex] > yPos[targetIndex] ? yScale(yPos[targetIndex]) : yScale(yPos[targetIndex]) + barHeight)
          .attr("stroke", arrowColor)
          // .attr("stroke-dasharray", arrowStrokeDasharray)
          .attr("opacity", activeNode[0] == sourceNode.id || activeNode[0] == targetNode.id ? 1 : 0)
          .attr("marker-end", "url(#arrowhead)");
      }
    });

    // Create bars and labels
    svg.selectAll("rect").remove();
    svg.selectAll(".label").remove();

    const bars = svg.append("g")
      .selectAll("g")
      .data(data)
      .join("g");

    // Create bars

    bars.append("rect")
      .attr("x", d => xScale(d.birth))
      .attr("width", d => xScale(d.death) - xScale(d.birth))
      .attr("y", (d, i) => yScale(yPos[i]))
      .attr("height", barHeight)
      .attr("fill", "steelblue")
      .attr("opacity", d => activeNode.includes(d.id) ? 1 : 0.1);

    // Create labels displaying only name
    bars.append("text")
    .text(d => d.name)
    .attr("class", "label")
    .attr("x", d => xScale((d.birth + d.death) / 2)) // Center the text
    .attr("y", (d, i) => yScale(yPos[i]) + barHeight / 2)
    .attr("alignment-baseline", "central")
    .attr("font-size", 12)
    .attr("fill", "black")
    .attr("text-anchor", "middle"); // Center the text anchor

    // Mouseover and mouseout events for scrolling labels and showing dates on the timeline
    bars.on("mouseover", function (event, d) {
      const bar = d3.select(this);

      // Show vertical lines and dates along the timeline
      const lineGroup = svg.append("g")
        .attr("class", "timeline-hover")
        .lower(); // Lower the group so that it is positioned behind the bars

      lineGroup.append("line")
        .attr("x1", xScale(d.birth))
        .attr("x2", xScale(d.birth))
        .attr("y1", yScale(yPos[data.indexOf(d)]) + barHeight) // Start from the bottom of the bar
        .attr("y2", chartHeight)
        .style("stroke", "rgba(225,0,0,0.3)");

      lineGroup.append("line")
        .attr("x1", xScale(d.death))
        .attr("x2", xScale(d.death))
        .attr("y1", yScale(yPos[data.indexOf(d)]) + barHeight) // Start from the bottom of the bar
        .attr("y2", chartHeight)
        .style("stroke", "rgba(225,0,0,0.3)");

      lineGroup.append("text")
        .text(d.birth)
        .attr("x", xScale(d.birth))
        .attr("y", yScale(yPos[data.indexOf(d)]) + barHeight + 10)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "red"); // Display birth date in red

      lineGroup.append("text")
        .text(d.death)
        .attr("x", xScale(d.death))
        .attr("y", yScale(yPos[data.indexOf(d)]) + barHeight + 10)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "red"); // Display death date in red

      // // Scroll label if necessary
      // const label = bar.select("text");
      // const labelWidth = label.node().getComputedTextLength();
      // const barWidth = xScale(d.death) - xScale(d.birth);
      
      // if (labelWidth > barWidth - 8) {
      //   const scrollAmount = labelWidth - barWidth + 12; // Leave some padding for visual clarity
      //   label.interrupt() // Stop any active transition
      //     .transition()
      //     .duration(2000)
      //     .ease(d3.easeQuadInOut)
      //     .attr("x", d => xScale(d.birth) + 4 - scrollAmount)
      //     .attr("clip-path", 'polygon(0,0,${barWidth},0,${barWidth},${barHeight},0,${barHeight})');
      // }

    })
    .on("mouseout", function (event, d) {
        // Hide vertical lines and dates along the timeline
        svg.selectAll(".timeline-hover").remove();
    
        // Reset the label position to original
        const label = d3.select(this).select("text");
        const currentXPosition = parseFloat(label.attr("x"));
        const originalXPosition = xScale((d.birth + d.death) / 2);
    
        if (currentXPosition !== originalXPosition) {
          label.interrupt() // Stop any active transition
            .transition()
            .duration(2000)
            .ease(d3.easeQuadInOut)
            .attr("x", originalXPosition);
        }
    })
    .on("click", function (event, d) {
      props.setSelectedPhilosopher(d.id.replace('Q', ''));
      setActiveNode(findConnectedNodes(d.id)); 
      svg.selectAll(".arrow-layer").remove();

      centerAlignment(d);

      event.stopPropagation(); 
    });

    svg.on("click", () => {
      setActiveNode([]);
      props.setSelectedPhilosopher(null);
      svg.selectAll(".arrow-layer").remove();
    });

    if (activeNode.length > 0) { 
      try{ 
        centerAlignment(data.find(d => d.id === activeNode[0]));
      }
      catch {
        console.log(data.find(d => d.id === activeNode[0]));
      }
    }
  }, [activeNode, zoomScale, desiredVisiblePercentage]);

  const handleZoom = (mult) =>{
    if (zoomScale*mult < minScale || zoomScale*mult > maxScale) {
      return;
    }
    const svg = d3.select(splotSvg.current);
    svg.selectAll(".arrow-layer").remove();
    svg.selectAll(".lines-layer").remove();
    svg.selectAll(".x-axis").remove();
    setZoomScale(zoomScale*mult);
    if (activeNode.length > 0) { 
      //centerAlignment(data.find(d => d.id === activeNode[0]));
    }
  }

  // Function to handle search input changes
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const results = data.filter(philosopher =>
        philosopher.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Function to handle selection of a philosopher from search results
  const handleSelectPhilosopher = (philosopherId) => {
    props.setSelectedPhilosopher(philosopherId.replace('Q', ''));
    setSearchQuery('');
    setSearchResults([]);
    centerAlignment(findPhilosopherById(philosopherId));
  };

  const findPhilosopherById = (id) => {
    return data.find(philosopher => philosopher.id === id);
  };

  // Styles for the dropdown container
  const dropdownStyle = {
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    top: '30px', // Adjust as necessary
    border: '1px solid #ddd', // Optional, for border around dropdown
    zIndex: 1000 // To ensure it appears above other content
  };

  // Styles for each dropdown item
  const dropdownItemStyle = {
    padding: '5px 10px', // Adjust for padding
    cursor: 'pointer'
  };

  // Styles for dropdown item on hover
  const dropdownItemHoverStyle = {
    backgroundColor: '#f0f0f0' // Color change on hover
  };

  return (
    <div style={{chartHeight}}>
      <div style={{ textAlign: 'left', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, fontSize: '11px', display: 'flex', alignItems: 'center' }}>
        <h2 style={{ margin: '0' }}>Timeline View</h2>
        <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
          {legendData.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
              <div style={{ width: '20px', height: '10px', backgroundColor: item.color, marginRight: '5px' }}></div>
              <span style={{ fontSize: '12px' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <Button variant="outlined" onClick={() => handleZoom(1.25)} disabled={zoomScale * 1.25 > maxScale}  style={buttonStyle}>
          +
        </Button>
        <Button variant="outlined" onClick={() => handleZoom(0.8)} disabled={zoomScale * 0.8 < minScale} style={buttonStyle}>
          -
        </Button>
        <div style={{ /* Styles for the scrollbar container */ }}>
          <input
            type="range"
            min="0"
            max="100"
            value={desiredVisiblePercentage}
            onChange={(e) => setDesiredVisiblePercentage(e.target.value)}
            style={{ /* Styles for the scrollbar */ }}
          />
        </div>

        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 100 }}>
          <input
            type="text"
            placeholder="Search philosophers..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ /* Add styles for the search input */ }}
          />
          {searchResults.length > 0 && (
            <div style={dropdownStyle}>
              {searchResults.map(philosopher => (
                <div
                  key={philosopher.id}
                  onClick={() => handleSelectPhilosopher(philosopher.id)}
                  style={dropdownItemStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = dropdownItemHoverStyle.backgroundColor}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  {philosopher.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div ref={svgContainerRef} style={{ width: '100%', overflow: 'auto', height: `383px` }}>
        <svg ref={splotSvg} width={width} height={svgHeight}></svg>
      </div>
    </div>
  );
};

export default TimelineView;