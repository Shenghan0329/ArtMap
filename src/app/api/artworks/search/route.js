const MET_SEARCH_API = 'https://collectionapi.metmuseum.org/public/collection/v1/search'

export async function GET(request, params) {
    try {
        // Extract search parameters from the URL
        const { searchParams } = new URL(request.url);
        
        // Define which parameters are booleans vs other types
        const booleanParams = [
            'isHighlight',    // Boolean - highlighted objects
            'title',          // Boolean - search against title
            'tags',           // Boolean - search against tags
            'isOnView',       // Boolean - currently on view
            'artistOrCulture', // Boolean - search against artist/culture
            'hasImages'       // Boolean - objects with images
        ];
        
        const stringParams = [
            'q',              // Search term
            'medium',         // String - medium type (can use | separator)
            'geoLocation'     // String - geographic location (can use | separator)
        ];
        
        const numberParams = [
            'departmentId',   // Integer - specific department
            'dateBegin',      // Integer - start date range
            'dateEnd'         // Integer - end date range
        ];
        
        const queryParams = new URLSearchParams();
        
        // Handle boolean parameters
        booleanParams.forEach(param => {
            const value = searchParams.get(param);
            if (value !== null) {
                // Convert string "true"/"false" to actual boolean
                const boolValue = value.toLowerCase() === 'true' || value === '1';
                queryParams.append(param, boolValue.toString());
            }
        });
        
        // Handle string parameters
        stringParams.forEach(param => {
            const value = searchParams.get(param);
            if (value) {
                queryParams.append(param, value);
            }
        });
        
        // Handle number parameters
        numberParams.forEach(param => {
            const value = searchParams.get(param);
            if (value && !isNaN(value)) {
                queryParams.append(param, value);
            }
        });
        
        // Ensure we have at least a search query
        if (!queryParams.has('q')) {
            return new Response(
                JSON.stringify({ 
                    error: 'Search query (q) is required',
                    usage: 'Use ?q=searchterm along with optional filters'
                }), 
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        // Construct the full API URL with query parameters
        const apiUrl = `${MET_SEARCH_API}?${queryParams.toString()}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        if (!response.ok) {
            throw new Error(`Met API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const transformed = {
            ...data,
            source: 'proxied-through-nextjs',
            requestedAt: new Date().toISOString(),
            totalResults: data.total || 0
        };

        return new Response(JSON.stringify(transformed), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=300' // Cache for 5 minutes
            },
        });
    } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Unexpected error';
        console.error('Met Search API Error:', reason);
        
        return new Response(
            JSON.stringify({ 
                error: message,
                timestamp: new Date().toISOString()
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}