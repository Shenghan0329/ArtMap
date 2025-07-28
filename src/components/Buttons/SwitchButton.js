"use client"
import Image from 'next/image';

const SwitchButton = ({onClick, place, text }) => {
    return (
    <button
        onClick={onClick}
        className="
            w-22 h-22 z-5 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 
            flex flex-col items-center justify-center overflow-hidden
            fixed bottom-4 right-16 
        "
    >
        <SwitchButtonImage place={place}/>
        <DestinationCard label={text}/>
    </button>

    )
}

const SwitchButtonImage = ({place}) => {
    return (
        <div className="relative aspect-square w-22 h-16 bg-gray-100">
            <Image
                className="dark:invert"
                src={(place?.photos && place?.photos[0]) ?.getUrl() || '/sample-img.jpg'}
                alt="Sample Image"
                layout="fill"
                style={{ objectFit: 'cover' }}
                priority
            />
        </div>
    )
}

const DestinationCard = ({label="Sample Destination"}) => {
    return (
        <div className="text-xs"><em className="font-semibold">{'> '}</em>{label}</div>
    )
}

export default SwitchButton;