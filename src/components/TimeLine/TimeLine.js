"use client"

import TimeLineSlider from "./TimeLineSlider";
import { useState } from "react";

const TimeLine = ({time, setTime}) => {

    return (<div className="h-5 w-9/10 flex justify-center items-center">
        <TimeLineSlider time={time} setTime={setTime} />
    </div>)
}

export default TimeLine;