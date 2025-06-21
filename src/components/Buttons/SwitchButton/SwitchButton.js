"use client"
import Image from 'next/image';

const SwitchButton = ({onClick}) => {
    return (
    <button
        onClick={onClick}
        className="
            w-22 h-22 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 
            flex flex-col items-center justify-center overflow-hidden
            fixed bottom-4 right-16 
        "
    >
        <SwitchButtonImage />
        <DestinationCard />
    </button>

    )
}

const SwitchButtonImage = ({src="/sample-img.jpg"}) => {
    return (
        <div className="relative aspect-square w-22 h-16 bg-gray-100">
            <Image
            className="dark:invert"
            src={src}
            alt="Sample Image"
            layout="fill"
            style={{ objectFit: 'cover' }}
            priority
            />
        </div>
    )
}

const DestinationCard = ({destination="Sample Destination"}) => {
    return (
        <div className="text-xs"><em className="font-semibold">{'> '}</em>{destination}</div>
    )
}

export default SwitchButton;