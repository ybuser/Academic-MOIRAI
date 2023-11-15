import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Arrow from '../components/arrow'
import Timeline from "react-visjs-timeline";
import philosophers from '../data/philosophers.json';


const TimelineView = ({className}) => {
  const [itemsData, setItemsData] = useState([]);

  useEffect(() => {
    const timelineItems = philosophers.map(philosopher => {
      return {
        start: new Date(philosopher.birth),
        end: new Date(philosopher.death),
        content: philosopher.name
      };
    });
    setItemsData(timelineItems);
    // console.log("timlineItems is ", timelineItems);
  }, []);

    //  type: "background" 로 배경에 시대 넣기 가능
    //   {
    //     start: new Date("October 13, 2018 9:55:00"),
    //     end: new Date("October 14, 2018 10:59:59"), // end is optional
    //     content: "3차 산업혁명",
    //     type: "background"
    //   },
  
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
  
  return (
    <div className={className}>
      <h2>Timeline View</h2>
      <Timeline
        options={options}
        items={itemsData}
      />
    </div>
  )
}

export default TimelineView;