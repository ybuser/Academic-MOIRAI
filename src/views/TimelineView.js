import React, { useState, useEffect, useRef } from 'react'
import * as d3 from "d3";

function computeBarYPosition(data, direction = "top") {
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
  const svgContainerRef = useRef(null); // Ref for the SVG container
  const splotSvg = useRef(null);
  let data = props.data; 
  let relationships = props.relationships;

  const margin = ({ top: 10, right: 20, bottom: 50, left: 20 }); // Increase bottom margin
  // const width = 1800;
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

  const extraHeightForXAxis = 30; // x축을 위한 추가 높이
  const svgHeight = chartHeight + margin.top + margin.bottom;
  const containerHeight = svgHeight + extraHeightForXAxis; // 컨테이너 높이를 SVG 높이 + x축 높이로 설정


  const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([margin.left, width - margin.right]);
  const yScale = d3.scalePoint().domain(d3.range(yPosMin, yPosMax + 1)).range([height - margin.bottom, margin.top]).padding(1.5);

  useEffect(() => {
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
  
    // Draw vertical gridlines at every century mark
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

    // Draw x-axis with labels every 20 years, starting from 1700
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
    
        arrowLayer.append("line")
          .attr("x1", xScale(sourceNode.death))
          .attr("y1", yScale(yPos[sourceIndex]) + barHeight / 2)
          .attr("x2", xScale(targetNode.birth))
          .attr("y2", yScale(yPos[targetIndex]) + barHeight / 2)
          .attr("stroke", "black")
          .attr("marker-end", "url(#arrowhead)");
      }
    });

    // Create bars and labels
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
      .attr("fill", "steelblue");

    // Create labels displaying only name
    bars.append("text")
      .text(d => d.name)
      .attr("x", d => xScale(d.birth) + 4)
      .attr("y", (d, i) => yScale(yPos[i]) + barHeight / 2)
      .attr("alignment-baseline", "central")
      .attr("font-size", 12)
      .attr("fill", "white")
      .attr("white-space", "nowrap")
      // .attr("overflow", "hidden")
      .attr("text-overflow", "ellipsis");

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
        .attr("y", chartHeight + 30)
        .attr("text-anchor", "middle")
        .attr("fill", "red"); // Display birth date in red

      lineGroup.append("text")
        .text(d.death)
        .attr("x", xScale(d.death))
        .attr("y", chartHeight + 30)
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
        const originalXPosition = xScale(d.birth) + 4;
    
        if (currentXPosition !== originalXPosition) {
          label.interrupt() // Stop any active transition
            .transition()
            .duration(2000)
            .ease(d3.easeQuadInOut)
            .attr("x", originalXPosition);
        }
    });


  }, []);


  return (
    <div ref={svgContainerRef} style={{ width: '100%', overflowX: 'auto', height: `${containerHeight}px` }}>
      <svg ref={splotSvg} width={width} height={svgHeight}></svg>
    </div>
  )
}

export default TimelineView;