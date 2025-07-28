"use client"

import TimeLineSlider from "./TimeLineSlider";

const TimeLine = ({time, setTime}) => {

    return (
    <div className="h-5 w-full flex justify-center items-center">
        <TimeLineSlider time={time} setTime={setTime} />
    </div>
    )
}

export default TimeLine;