import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Timeline from "react-visjs-timeline";
import Arrow from '../components/arrow';
import philosophers from '../data/philosophers.json';


const TimelineView = ({className}) => {
  const [itemsData, setItemsData] = useState([]);
  const [arrowsData, setArrowsData] = useState([]);
  const timelineContainerRef = useRef(null);
  const timelineRef = useRef(null); // Ref for the Timeline instance


  useEffect(() => {
    const timelineItems = philosophers.map((philosopher, index) => ({
      id: index,
      start: new Date(philosopher.birth),
      end: new Date(philosopher.death),
      content: philosopher.name
    }));

    // Creating a map for philosopher name to index (ID)
    const nameToIdMap = new Map(philosophers.map((p, index) => [p.name, index]));

    // Creating arrows based on relationships
    const arrows = philosophers.flatMap((philosopher) =>
      philosopher.relationships.map(relationship => ({
        id: `arrow-${nameToIdMap.get(philosopher.name)}-${nameToIdMap.get(relationship.name)}`,
        id_item_1: nameToIdMap.get(philosopher.name),
        id_item_2: nameToIdMap.get(relationship.name),
        title: relationship.relationshipType // Optional
      }))
    );

    setItemsData(timelineItems);
    setArrowsData(arrows);
  }, []);

    //  type: "background" 로 배경에 시대 넣기 가능
    //   {
    //     start: new Date("October 13, 2018 9:55:00"),
    //     end: new Date("October 14, 2018 10:59:59"), // end is optional
    //     content: "3차 산업혁명",
    //     type: "background"
    //   },

    // Function to create the Arrow instance
    const createArrows = () => {
      if (timelineRef.current) {
        new Arrow(timelineRef.current, arrowsData, {
          followRelationships: true,
          color: "#039E00"
        });
      } else {
        console.log("Timeline not initialized yet");
      }
    };

    useEffect(() => {
      if (itemsData.length > 0 && timelineContainerRef.current) {
        const options = {
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
        };

        const myTimeline = new Timeline(timelineContainerRef.current, itemsData, options);
        timelineRef.current = myTimeline; // Store the Timeline instance
      }
    }, [itemsData, arrowsData]);
  
  
  return (
    <div className={className}>
      <h2>Timeline View</h2>
      <div ref={timelineContainerRef} id="timeline"></div>
      <button onClick={createArrows}>Create Arrows</button>
    </div>
  )
}

export default TimelineView;