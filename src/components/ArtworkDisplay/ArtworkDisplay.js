import ArtworkImage from "../ArtworkImage/ArtworkImage";

const ArtworkDisplay = ({ artwork, setDetails }) => {
    if (!artwork) {
        return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <p className="text-gray-500">No artwork data available</p>
        </div>
        );
    }

    const {
        title,
        artist_display,
        date_display,
        medium_display,
        dimensions,
        description,
        place_of_origin,
        department_title,
        gallery_title,
        credit_line,
        thumbnail,
        image_id,
        main_reference_number,
        primaryImageLarge
    } = artwork;

    // Construct full image URL from image_id
    const imageUrl = image_id 
        ? `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`
        : thumbnail?.lqip;

    // Parse artist information
    const parseArtistInfo = (artistDisplay) => {
        if (!artistDisplay) return null;
        const lines = artistDisplay.split('\n').filter(line => line.trim());
        return lines.map((line, index) => (
        <p key={index} className={index === 0 ? 'font-semibold text-gray-900' : 'text-gray-600 text-sm'}>
            {line.trim()}
        </p>
        ));
    };

    // Clean up HTML description
    const cleanDescription = (desc) => {
        if (!desc) return '';
        return desc.replace(/<[^>]*>/g, '');
    };

    // Determine content height based on whether description exists
    const contentHeight = description ? 'h-[60vh]' : 'h-auto';
    const flexDir = description ? 'flex-row' : 'flex-col';

    return (<div className="relative mx-auto h-screen bg-white shadow-lg overflow-scroll max-[768px]:w-[100vw]">
        <div className="fixed z-5 top-0 right-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setDetails(false)}>Back to Gallery</div>
        <div className={`md:flex ${flexDir}`}>
            {/* Image Section */}
            <div className={`relative h-[60vh] w-full min-[768px]:max-w-[67vw] max-[768px]: w-[100vw]`}>
                {imageUrl ? (
                    <ArtworkImage artwork={artwork} defaultImage={'primaryImageLarge'} altImage={['primaryImageMedium', 'primaryImageSmall']} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Image not available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`w-[33vw] max-[768px]:w-[100vw] max-[768px]:h-auto ${contentHeight} p-8 overflow-scroll`}>
            <div className="space-y-6">
                {/* Title and Reference */}
                <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {main_reference_number && (
                    <p className="text-sm text-gray-500">Accession Number: {main_reference_number}</p>
                )}
                </div>

                {/* Artist Information */}
                {artist_display && (
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Artist</h3>
                    <div className="space-y-1">
                    {parseArtistInfo(artist_display)}
                    </div>
                </div>
                )}

                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                {date_display && (
                    <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date</h3>
                    <p className="text-gray-900">{date_display}</p>
                    </div>
                )}

                {medium_display && (
                    <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Medium</h3>
                    <p className="text-gray-900">{medium_display}</p>
                    </div>
                )}

                {dimensions && (
                    <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Dimensions</h3>
                    <p className="text-gray-900">{dimensions}</p>
                    </div>
                )}

                {place_of_origin && (
                    <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Place of Origin</h3>
                    <p className="text-gray-900">{place_of_origin}</p>
                    </div>
                )}
                </div>

                {/* Location Information */}
                {(department_title || gallery_title) && (
                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                    <div className="space-y-1">
                    {department_title && <p className="text-gray-900">{department_title}</p>}
                    {gallery_title && <p className="text-gray-600 text-sm">{gallery_title}</p>}
                    </div>
                </div>
                )}

                {/* Credit Line */}
                {credit_line && (
                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Credit</h3>
                    <p className="text-gray-600 text-sm italic">{credit_line}</p>
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Description Section */}
        {description && (
            <div className="h-[40vh] max-[768px]:h-auto px-8 pb-8 pt-6 border-t min-[768px]:max-w-[67vw] max-[768px]:w-[100vw]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Work</h3>
                <div className="text-gray-700 leading-relaxed overflow-scroll h-[calc(100%-2rem)] w-full max-[768px]:h-auto">
                    <p>{cleanDescription(description)}</p>
                </div>
            </div>
        )}
    </div>);
};

export default ArtworkDisplay;