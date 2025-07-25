import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { ErrorContext } from "@/app/page";

export default function ArtworkImage({artwork, defaultImage = 'primaryImageMedium', altImage = ['primaryImageLarge', 'primaryImageSmall']}) {
    const [hasError, setHasError] = useState(false);
    const [failed, setFailed] = useState(false);
    const [imageSize, setImageSize] = useState(defaultImage);
    const [altIndex, setAltIndex] = useState(0);
    const { setError } = useContext(ErrorContext);

    useEffect(() => {
        if (hasError) {
            if (altIndex >= altImage.length) {
                setFailed(true);
            }
            setHasError(false);
            setImageSize(altImage[altIndex]);
            setAltIndex(prv => prv + 1);
        }
    }, [hasError]); 

    return (
        <Image                             
            className="dark:invert w-full h-full object-cover"                             
            src={hasError ? artwork[defaultImage] : artwork[imageSize]}                  
            alt={artwork?.thumbnail?.alt_text || artwork?.title || 'Artwork'}                          
            fill={true}                             
            sizes='500px'                             
            blurDataURL="/sample-img.jpg"                             
            placeholder="blur"
            onError = {(e) => {
                if (!failed) setHasError(true);
                else setError(`Image of ${artwork?.title} failed to load.`);
            }}                        
            priority                         
        />
    )
}