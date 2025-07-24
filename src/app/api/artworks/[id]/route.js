import { NextResponse } from 'next/server';

const CHICAGO_OBJECT_API = 'https://api.artic.edu/api/v1/artworks'

// {
//     objectID: 655752,
//     isHighlight: false,
//     accessionNumber: "2014.515",
//     accessionYear: "2014",
//     isPublicDomain: false,
//     primaryImage: "",
//     primaryImageSmall: "",
//     additionalImages: [ ],
//     constituents: [
//         {
//             constituentID: 178390,
//             role: "Artist",
//             name: "Inoue Yūichi",
//             constituentULAN_URL: "http://vocab.getty.edu/page/ulan/500122668",
//             constituentWikidata_URL: "https://www.wikidata.org/wiki/Q1567766",
//             gender: ""
//         }
//     ],
//     department: "Asian Art",
//     objectName: "Painting",
//     title: "“Kanzan” (Hanshan)",
//     culture: "Japan",
//     period: "Showa period (1926–89)",
//     dynasty: "",
//     reign: "",
//     portfolio: "",
//     artistRole: "Artist",
//     artistPrefix: "",
//     artistDisplayName: "Inoue Yūichi",
//     artistDisplayBio: "Japanese, 1916–1985",
//     artistSuffix: "",
//     artistAlphaSort: "Inoue Yūichi",
//     artistNationality: "Japanese",
//     artistBeginDate: "1916",
//     artistEndDate: "1985",
//     artistGender: "",
//     artistWikidata_URL: "https://www.wikidata.org/wiki/Q1567766",
//     artistULAN_URL: "http://vocab.getty.edu/page/ulan/500122668",
//     objectDate: "1966",
//     objectBeginDate: 1966,
//     objectEndDate: 1966,
//     medium: "Panel; ink on Japanese paper",
//     dimensions: "Image: 95 × 48 3/4 in. (241.3 × 123.8 cm)
//     Overall with mounting: 8 ft. 3 1/4 in. × 53 in. × 3 1/4 in. (252.1 × 134.6 × 8.3 cm)",
//     measurements: [
//         {
//             elementName: "Overall with mounting",
//             elementDescription: null,
//             elementMeasurements: {
//             Depth: 8.255016,
//             Height: 252.0955,
//             Width: 134.62027
//         }
//         },
//         {
//             elementName: "Image",
//             elementDescription: null,
//             elementMeasurements: {
//             Height: 241.30048,
//             Width: 123.82525
//         }
//         }
//     ],
//     creditLine: "Purchase, Friends of Asian Art Gifts, 2014",
//     geographyType: "",
//     city: "",
//     state: "",
//     county: "",
//     country: "",
//     region: "",
//     subregion: "",
//     locale: "",
//     locus: "",
//     excavation: "",
//     river: "",
//     classification: "Calligraphy",
//     rightsAndReproduction: "© Unagami Masaomi",
//     linkResource: "",
//     metadataDate: "2025-04-04T04:52:52.6Z",
//     repository: "Metropolitan Museum of Art, New York, NY",
//     objectURL: "https://www.metmuseum.org/art/collection/search/655752",
//     tags: null,
//     objectWikidata_URL: "https://www.wikidata.org/wiki/Q126120671",
//     isTimelineWork: false,
//     GalleryNumber: "232",
//     source: "proxied-through-nextjs"
// }

export async function GET(request, { params }) {
    try {
        // Extract the object ID from the route parameters
        const { id } = await params;
        
        // Validate that we have an object ID
        if (!id) {
            return new Response(
                JSON.stringify({ error: 'Object ID is required' }), 
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // Construct the full API URL with the object ID
        const apiUrl = `${CHICAGO_OBJECT_API}/${id}`;

        const response = await fetch(apiUrl, {
            // Note: Met API doesn't require authentication
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        // Handle 404 if object doesn't exist
        if (!response.ok) {
            if (response.status === 404) {
                return new Response(
                    JSON.stringify({ error: 'Object not found' }), 
                    { 
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Unexpected error';
        
        return NextResponse.json({ 
                error: message,
                timestamp: new Date().toISOString(),
                status: 500,
            },
        );
    }
}