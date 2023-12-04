import React, { useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import Arrow from '../components/arrow'
import Timeline from "react-visjs-timeline";
import philosophers from '../data/philosophers.json';

const relationships = [
  { from: 'David Hume', to: 'Immanuel Kant' },
  // Add more relationships as needed
];

const TimelineView = ({className}) => {
  const [itemsData, setItemsData] = useState([]);
  const timelineRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const timelineItems = philosophers.map(philosopher => {
      return {
        id: philosopher.name,
        start: new Date(philosopher.birth),
        end: new Date(philosopher.death),
        content: philosopher.name
      };
    });
    setItemsData(timelineItems);
  }, []);
  
  const [options, setOptions] = useState({
    width: "100%",
    height: "30vh",
    stack: true,
    editable: false,
    showMajorLabels: true,
    showCurrentTime: false,
    zoomMin: 1000 * 60 * 60 * 24 * 30, // Minimum zoom level is a month
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 100, // Maximum zoom level is 100 years
    zoomable: true,
    horizontalScroll: true,
    zoomKey: "ctrlKey",
    orientation: { axis: "top" },
    timeAxis: { scale: "year", step: 10 },
    start: new Date('1600-01-01'), // Adjust these dates based on your data range
    end: new Date('2000-01-01'),
    selectable: true
  });

  const calculatePosition = (date, startDate, endDate, timelineWidth) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const pointInTime = new Date(date).getTime();
    const position = ((pointInTime - start) / (end - start)) * timelineWidth;
    return position;
  };

  const drawArrow = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const timelineWidth = timelineRef.current.offsetWidth;
    const timelineHeight = timelineRef.current.offsetHeight;
  
    // Set the canvas size
    canvas.width = timelineWidth;
    canvas.height = timelineHeight;
  
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    relationships.forEach(rel => {
      const fromItem = itemsData.find(item => item.content === rel.from);
      const toItem = itemsData.find(item => item.content === rel.to);
  
      if (fromItem && toItem) {
        const fromX = calculatePosition(fromItem.end, options.start, options.end, timelineWidth);
        const toX = calculatePosition(toItem.start, options.start, options.end, timelineWidth);
        const yPosition = 60; // This positions the arrow in the vertical middle of the canvas
  
        // Draw the line
        ctx.beginPath();
        ctx.moveTo(fromX, yPosition);
        ctx.lineTo(toX, yPosition);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
  
        // Draw the arrowhead
        const arrowLength = 10;
        const arrowWidth = 5;
  
        ctx.beginPath();
        ctx.moveTo(toX, yPosition);
        ctx.lineTo(toX - arrowLength, yPosition - arrowWidth);
        ctx.lineTo(toX - arrowLength, yPosition + arrowWidth);
        ctx.lineTo(toX, yPosition);
        ctx.fillStyle = 'black';
        ctx.fill();
  
        // Optional: Draw a curve instead of a line
        ctx.beginPath();
        ctx.moveTo(fromX, yPosition);
        // This control point can be adjusted to change the curvature
        const controlX = (fromX + toX) / 2;
        const controlY = yPosition - 50; // Control point for the quadratic curve
        ctx.quadraticCurveTo(controlX, controlY, toX, yPosition);
        ctx.strokeStyle = 'red'; // Curve color
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    // Call drawArrows after a short delay to ensure timeline items have rendered
    const timeoutId = setTimeout(drawArrow, 50);
    return () => clearTimeout(timeoutId);
  }, [itemsData]);
  
  return (
    <div className={className} ref={timelineRef} style={{ position: 'relative' }}>
      <Timeline
        options={options}
        items={itemsData}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'relative',
          top: 0,
          left: 0,
          pointerEvents: 'none' // Allows clicks to pass through to the timeline
        }}
        width={timelineRef.current?.offsetWidth}
        height={timelineRef.current?.offsetHeight}
      />
    </div>
  );
};

export default TimelineView; 