"use client"

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const TimeLineSlider = ({time, setTime}) => (
    <Slider 
        min = {1400}
        max = {2025}
        value={time}
        onChange={(value) => {
            setTime(value);
        }}
    />
);

export default TimeLineSlider;