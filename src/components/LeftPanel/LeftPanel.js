'use client'

import CloseButton from "../Buttons/CloseButton";

const LeftPanel = ({ visible, setVisible, widthRatio='w-1/3', transparent = false, children }) => {
    return (
        <div
            className={`fixed top-0 left-0 ${widthRatio} h-full bg-white shadow-lg z-5 transform transition-transform duration-300 ease-in-out ${
                visible ? 'translate-x-0' : '-translate-x-full'}`}
            style = {{
                opacity: transparent? 0.5 : 1,
                backgroundColor: transparent ? 'black' : 'white'
            }}
        >

            {/* Panel content */}
            <div className={`p-6 pt-10 pb-10 h-full overflow-y-auto`}>
                {children}
                <div className="top-2 right-2 absolute">
                    <CloseButton onClick={async () => {
                        "use client"
                        setVisible(false);}} />
                </div>
            </div>
        </div>
    );
};



export default LeftPanel;