"use client"

import TimeLineSlider from "./TimeLineSlider";
import { useState } from "react";

const TimeLine = () => {
    const [time, setTime] = useState('');

    return (<>
        <h2>Time: {time}</h2>
        <TimeLineSlider time={time} setTime={setTime} />
    </>)
}

export default TimeLine;