import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Arrow from '../components/arrow'
import Timeline from "react-visjs-timeline";

// const options = {
//   width: "100%",
//   // height: "calc(100vh - 100px)",
//   height: "100%",
//   stack: false,
//   editable: true,
//   showMajorLabels: true,
//   showCurrentTime: false,
//   zoomMin: 1000 * 60,
//   zoomMax: 1000 * 60 * 60 * 2,
//   zoomable: true,
//   horizontalScroll: true,
//   zoomKey: "ctrlKey",
//   orientation: { axis: "top" },
//   timeAxis: { scale: "day", step: 5 },
//   start: new Date("October 14, 2018 10:00:00"),
//   end: new Date("October 15, 2018 15:00:00"),
//   min: new Date("October 13, 2019 10:56:00"),
//   max: new Date("October 16, 2019 12:00:00"),
//   //type: "background",
//   selectable: true
// };

const TimelineView = ({className}) => {
  const [itemsData, setItemsData] = useState([
    {
      start: new Date("October 13, 2018 9:55:00"),
      end: new Date("October 14, 2018 10:59:59"), // end is optional
      content: "3차 산업혁명",
      type: "background"
    },
    {
      start: new Date("October 14, 2018 10:58:00"),
      end: new Date("October 15, 2018 12:58:30"), // end is optional
      content: "Yunbo Shim"
    },
    {
      start: new Date("October 12, 2018 10:58:00"),
      end: new Date("October 15, 2018 12:58:30"), // end is optional
      content: "Yeongin"
    },
    {
      start: new Date("October 13, 2018 10:58:00"),
      end: new Date("October 18, 2018 12:58:30"), // end is optional
      content: "Jiwon"
    }
  ]);
  
  const [options, setOptions] = useState({
    width: "100%",
    // height: "calc(100vh - 100px)",
    height: "30vh",
    stack: true,
    editable: false,
    showMajorLabels: true,
    showCurrentTime: false,
    zoomMin: 1000 * 60 * 60,
    zoomMax: 1000 * 60 * 60 * 24 * 7 * 30,
    zoomable: true,
    horizontalScroll: true,
    zoomKey: "ctrlKey",
    orientation: { axis: "top" },
    timeAxis: { scale: "day", step: 1 },
    start: new Date("October 1, 2018 0:00:00"),
    end: new Date("October 30, 2018 0:00:00"),
    min: new Date("September 1, 2018 10:56:00"),
    max: new Date("November 30, 2018 12:00:00"),
    //type: "background",
    selectable: true
  });

  // If you need to update items or options based on certain conditions
  useEffect(() => {
    // Update logic here
  }, []); // Depend on variables that trigger updates
  
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