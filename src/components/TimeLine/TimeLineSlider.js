import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const TimeLineSlider = ({ time, setTime }) => {

    // Properly scaled marks - position matches label
    const marks = {
        1400: { label: '1400', style: { fontSize: '11px', color: '#9CA3AF' } },
        1600: { label: '1600', style: { fontSize: '11px', color: '#9CA3AF' } },
        1750: { label: '1750', style: { fontSize: '11px', color: '#9CA3AF' } },
        1850: { label: '1850', style: { fontSize: '11px', color: '#9CA3AF' } },
        1970: { label: '1970', style: { fontSize: '11px', color: '#9CA3AF' } },
        2025: { label: '2025', style: { fontSize: '11px', color: '#9CA3AF' } }
    };

    // Custom styles for bold slider and positioned period labels
    const sliderStyles = `
        .bold-timeline-slider .rc-slider-rail {
            background-color: #E5E7EB;
            height: 6px;
        }
        .bold-timeline-slider .rc-slider-track {
            background-color: #6B7280;
            height: 6px;
        }
        .bold-timeline-slider .rc-slider-handle {
            background-color: #374151;
            border-color: #374151;
            height: 20px;
            width: 20px;
            margin-top: -7px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .bold-timeline-slider .rc-slider-handle:hover {
            border-color: #374151;
            background-color: #374151;
        }
        .bold-timeline-slider .rc-slider-handle:active {
            border-color: #374151;
            background-color: #374151;
            box-shadow: 0 0 0 5px rgba(55, 65, 81, 0.1);
        }
        
        .period-labels-container {
            position: relative;
            height: 30px;
            margin-top: 10px;
        }
        
        .period-label {
            position: absolute;
            font-size: 14px;
            color: #6B7280;
            font-weight: 500;
            transform: translateX(-50%);
            white-space: nowrap;
        }
        
        .period-label.renaissance { left: 10%; }
        .period-label.baroque { left: 35%; }
        .period-label.neoclassical { left: 56%; }
        .period-label.modern { left: 74%; }
        .period-label.contemporary { left: 93.2%; }
    `;

    return (
        <>
            <style>{sliderStyles}</style>
            <div className="w-full max-w-4xl mx-auto">
                {/* Header with selected range */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-900">Time Period</span>
                    <span className="text-base text-gray-600">
                        {time[0]} - {time[1]}
                    </span>
                </div>

                {/* Slider */}
                <div className="px-4 mb-6 bold-timeline-slider">
                    <Slider
                        range={true}
                        defaultValue={[1900, 2000]}
                        min={1400}
                        max={2025}
                        step={1}
                        value={time}
                        onChange={(value) => setTime(value)}
                        marks={marks}
                    />
                </div>

                {/* Time period keywords positioned under markers */}
                <div className="period-labels-container">
                    <div className="period-label renaissance">Renaissance</div>
                    <div className="period-label baroque">Baroque</div>
                    <div className="period-label neoclassical">Neoclassical</div>
                    <div className="period-label modern">Modern</div>
                    <div className="period-label contemporary">Contemporary</div>
                </div>
            </div>
        </>
    );
};

export default TimeLineSlider;