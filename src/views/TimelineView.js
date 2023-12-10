import React, { useState, useEffect, useRef } from 'react'
import * as d3 from "d3";
import { act } from 'react-dom/test-utils';

function computeBarYPosition(data, direction = "bottom") {
  function xOverlaps(a, b) {
    return a.birth < b.death + 1 && a.death + 1 > b.birth;
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

const TimelineView = (props) => {
  
  const svgContainerRef = useRef(null); 
  const splotSvg = useRef(null);
  // const zoomRef = useRef(); 
  // const [zoomScale, setZoomScale] = useState(1);
  // const desiredVisiblePercentage = d3.scaleLinear().domain([0.5, 1]).range([10, 100])(zoomScale);
  // const priorityThreshold = 1 - desiredVisiblePercentage/100;
  // console.log("priorityThreshold: ", priorityThreshold);

  let data = props.data;
  let relationships = props.relationships; 

  // let data = props.data.filter(d => d.priority >= priorityThreshold); 
  // console.log("data: ", data);
  // let relationships = props.relationships.filter(rel => data.find(d => d.id === rel.source) && data.find(d => d.id === rel.target));
  // console.log("relationships: ", relationships); 
  // Function to find all connected nodes
  const findConnectedNodes = (selectedId) => {
    const connectedNodes = relationships
      .filter(rel => rel.source === selectedId || rel.target === selectedId)
      .map(rel => rel.source === selectedId ? rel.target : rel.source);
    return [selectedId, ...new Set(connectedNodes)];
  };

  const centerAlignment = (selectedId) => {
    const nodeX = xScale((selectedId.birth + selectedId.death) / 2);
    const nodeIndex = data.indexOf(selectedId);
    const nodeY = yScale(yPos[nodeIndex]);

    // 컨테이너의 너비 및 높이 가져오기
    const containerWidth = svgContainerRef.current.clientWidth;
    const containerHeight = svgContainerRef.current.clientHeight;

    // // 줌 레벨에 따라 조정된 노드 위치 계산
    // const adjustedNodeX = nodeX * zoomScale;
    // const adjustedNodeY = nodeY * zoomScale;

    // 스크롤 위치 조정하여 노드를 중앙에 위치시키기
    // 줌 레벨을 고려하여 조정된 노드 위치를 사용
    const scrollX = nodeX - containerWidth / 2;
    const scrollY = nodeY - containerHeight / 2;

    svgContainerRef.current.scrollLeft = scrollX;
    svgContainerRef.current.scrollTop = scrollY;
  };

  // Initialize activeNode with selected philosopher and connected nodes
  const initialActiveNodes = findConnectedNodes('Q' + props.selectedPhilosopher.toString());
  const [activeNode, setActiveNode] = useState(initialActiveNodes);

  const margin = ({ top: 10, right: 20, bottom: 50, left: 20 }); 
  const barHeight = 20;
  const maxYear = Math.max(...data.map(d => d.death)) + 20;
  const minYear = Math.min(...data.map(d => d.birth)) - 20;
  const timelineLength = maxYear - minYear;
  const widthPerYear = 10;
  const width = widthPerYear * timelineLength + margin.left + margin.right;


  const yPos = computeBarYPosition(data);

  const yPosMax = Math.max(...yPos);
  const yPosMin = Math.min(...yPos);
  const chartHeight = (yPosMax - yPosMin) * barHeight * 2;
  const height = chartHeight + margin.top + margin.bottom;

  const extraHeightForXAxis = 30; 
  const svgHeight = chartHeight + margin.top + margin.bottom;
  
  const containerHeight = svgHeight + extraHeightForXAxis;


  const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([margin.left, width - margin.right]);
  const yScale = d3.scalePoint().domain(d3.range(yPosMin, yPosMax + 1)).range([height - margin.bottom, margin.top]).padding(1.5);
  
  useEffect(() => {
    setActiveNode(findConnectedNodes('Q' + props.selectedPhilosopher.toString()));
    // if (zoomScale==1 && activeNode.length > 0) {
    //   centerAlignment(data.find(d => d.id === activeNode[0]));
    // }
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
      .call(d3.axisBottom(xScale)
        .tickValues(d3.range(Math.floor(minYear / 20) * 20, maxYear, 20))
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
        switch (activeNode[0]) {
          case sourceNode.id:
            arrowColor = "blue";
            break;
          case targetNode.id:
            arrowColor = "red";
            break;
          default:
            arrowColor = "red";
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
    // svg.selectAll(".arrow-layer").remove();

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

      // Scroll label if necessary
      const label = bar.select("text");
      const labelWidth = label.node().getComputedTextLength();
      const barWidth = xScale(d.death) - xScale(d.birth);
      
      if (labelWidth > barWidth - 8) {
        const scrollAmount = labelWidth - barWidth + 12; // Leave some padding for visual clarity
        label.interrupt() // Stop any active transition
          .transition()
          .duration(2000)
          .ease(d3.easeQuadInOut)
          .attr("x", d => xScale(d.birth) + 4 - scrollAmount)
          .attr("clip-path", 'polygon(0,0,${barWidth},0,${barWidth},${barHeight},0,${barHeight})');
      }

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
      // if(zoomScale==1) {
      //   centerAlignment(d);
      // }
      centerAlignment(d);

      event.stopPropagation(); 
    });

    svg.on("click", () => {
      setActiveNode([]);
      svg.selectAll(".arrow-layer").remove();
    });
  }, [activeNode, props.selectedPhilosopher]);

  // // 줌 기능 구현
  // useEffect(() => {
  //   const svg = d3.select(splotSvg.current);

  //   const zoom = d3.zoom()
  //     .scaleExtent([0.5, 2]) // 줌 범위: 0.5배에서 2배
  //     .on('zoom', (event) => {
  //       if (event.sourceEvent && event.sourceEvent.type === 'wheel') {
  //         event.sourceEvent.preventDefault();
  //       } else {
  //         svg.attr('transform', event.transform);
  //         setZoomScale(event.transform.k);
  //       }
  //     });

  //   svg.call(zoom);
  //   zoomRef.current = zoom;

  // }, []);
  
  // const zoomIn = () => {
  //   d3.select(splotSvg.current).transition().call(zoomRef.current.scaleBy, 5/4);
  // };

  // const zoomOut = () => {
  //   d3.select(splotSvg.current).transition().call(zoomRef.current.scaleBy, 4/5);
  // };

  return (
    <div>
      <div style={{ textAlign: 'left', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, fontSize: '11px' }}>
        <h2>Timeline View</h2>
      </div>
      <div ref={svgContainerRef} style={{ width: '100%', overflow: 'auto', height: `${containerHeight}px` }}>
        <svg ref={splotSvg} width={width} height={svgHeight}></svg>
      </div>
    </div>
  );
};

export default TimelineView;