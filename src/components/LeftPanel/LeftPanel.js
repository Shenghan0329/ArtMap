'use client'

import CloseButton from "../Buttons/CloseButton";

const LeftPanel = ({ visible, setVisible, widthRatio='w-auto', transparent = false, children }) => {
    return (
        <div
            className={`fixed top-0 left-0 ${widthRatio} h-screen overflow-hidden bg-white shadow-lg z-5 transform transition-transform duration-300 ease-in-out ${
                visible ? 'translate-x-0' : '-translate-x-full'} ${transparent ? 'bg-opacity-50' : 'bg-opacity-100'} ${transparent ? 'bg-black' : 'bg-white'}`}
            style = {{
                backgroundColor: transparent ? 'rgba(0, 0, 0, 0.2)' : 'white',
            }}
        >

            {/* Panel content */}
            <div className={`h-full`}>
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