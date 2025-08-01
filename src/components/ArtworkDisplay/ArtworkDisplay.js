import ArtworkImage from "../ArtworkImage/ArtworkImage";

const ArtworkDisplay = ({ artwork, setDetails, is3D = false }) => {
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
        <p key={index} className={index === 0 ? `font-semibold ${is3D ? 'text-white' : 'text-gray-900'}` : `${is3D ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
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

    // Conditional styling for 3D mode
    const backgroundClass = is3D ? 'bg-black/50 scrollbar-thin scrollbar-dark' : 'bg-white scrollbar-light';
    const primaryTextClass = is3D ? 'text-white' : 'text-gray-900';
    const secondaryTextClass = is3D ? 'text-gray-300' : 'text-gray-500';
    const tertiaryTextClass = is3D ? 'text-gray-300' : 'text-gray-600';
    const bodyTextClass = is3D ? 'text-gray-200' : 'text-gray-700';
    const placeholderTextClass = is3D ? 'text-gray-300' : 'text-gray-400';
    const borderClass = is3D ? 'border-gray-600' : 'border-gray-200';

    return (<div className={`relative h-screen ${backgroundClass} shadow-lg overflow-scroll max-[768px]:w-[100vw]`}>
        <div 
            className="fixed top-4 right-12 z-50 px-2 py-1 bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border border-white/20" 
            onClick={() => setDetails(false)}
        >
            <div className="flex items-center gap-2">
                {is3D ? 'Reload Gallery' : 'Back to Gallery'}
            </div>
        </div>
        <div className={`flex ${flexDir} w-full max-[768px]:flex-col`}>
            {/* Image Section */}
            <div className={`relative h-[60vh] w-full max-[768px]:w-full min-[769px]:${description ? 'max-w-[67vw]' : 'w-full'}`}>
                {imageUrl ? (
                    <ArtworkImage artwork={artwork} defaultImage={'primaryImageLarge'} altImage={['primaryImageMedium', 'primaryImageSmall']} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className={`text-center ${placeholderTextClass}`}>
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Image not available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`${description? 'w-[33vw]' : 'w-[40vw]'} max-[768px]:w-[100vw] max-[768px]:h-auto ${contentHeight} p-8 overflow-scroll`}>
            <div className="space-y-6">
                {/* Title and Reference */}
                <div className={`font-bold ${primaryTextClass}`}>
                    <h1 className="inline text-3xl mb-2">{title?.length > 50 ? title.replace(/ .*/,'') : title}</h1>
                    {title?.length > 50 && <p className="inline">{title.slice(
                        title.replace(/ .*/,'').length, title.length
                    )}</p>}
                </div>

                {/* Artist Information */}
                {artist_display && (
                <div>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide mb-2`}>Artist</h3>
                    <div className="space-y-1">
                    {parseArtistInfo(artist_display)}
                    </div>
                </div>
                )}

                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                {date_display && (
                    <div>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide`}>Date</h3>
                    <p className={primaryTextClass}>{date_display}</p>
                    </div>
                )}

                {medium_display && (
                    <div>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide`}>Medium</h3>
                    <p className={primaryTextClass}>{medium_display}</p>
                    </div>
                )}

                {dimensions && (
                    <div>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide`}>Dimensions</h3>
                    <p className={primaryTextClass}>{dimensions}</p>
                    </div>
                )}

                {place_of_origin && (
                    <div>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide`}>Place of Origin</h3>
                    <p className={primaryTextClass}>{place_of_origin}</p>
                    </div>
                )}
                </div>

                {/* Location Information */}
                {(department_title || gallery_title) && (
                <div className={`border-t ${borderClass} pt-4`}>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide mb-2`}>Location</h3>
                    <div className="space-y-1">
                    {department_title && <p className={primaryTextClass}>{department_title}</p>}
                    {gallery_title && <p className={`${tertiaryTextClass} text-sm`}>{gallery_title}</p>}
                    </div>
                </div>
                )}

                {/* Credit Line */}
                {credit_line && (
                <div className={`border-t ${borderClass} pt-4`}>
                    <h3 className={`text-sm font-medium ${secondaryTextClass} uppercase tracking-wide mb-2`}>Credit</h3>
                    <p className={`${tertiaryTextClass} text-sm italic`}>{credit_line}</p>
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Description Section */}
        {description && (
            <div className={`h-[40vh] max-[768px]:h-auto px-8 pb-8 pt-6 border-t ${borderClass} w-auto min-[769px]:max-w-[67vw] max-[768px]:w-[100vw]`}>
                <h3 className={`text-lg font-semibold ${primaryTextClass} mb-3`}>About This Work</h3>
                <div className={`${bodyTextClass} leading-relaxed overflow-scroll h-[calc(100%-2rem)] w-full max-[768px]:h-auto`}>
                    <p>{cleanDescription(description)}</p>
                </div>
            </div>
        )}
    </div>);
};

export default ArtworkDisplay;