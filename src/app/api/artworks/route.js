const MET_API = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'

export async function GET(request, params) {
    try {
        // Extract search parameters from the URL
        const { searchParams } = new URL(request.url);
        
        // Build query string from allowed parameters for objects endpoint
        const allowedParams = ['metadataDate', 'departmentIds'];
        const queryParams = new URLSearchParams();
        
        allowedParams.forEach(param => {
            const value = searchParams.get(param);
            if (value) {
                queryParams.append(param, value);
            }
        });
        
        // Construct the full API URL with query parameters
        const apiUrl = queryParams.toString() 
            ? `${MET_API}?${queryParams.toString()}`
            : MET_API;

        const response = await fetch(apiUrl, {
            // Note: Met API doesn't require authentication
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        const data = await response.json();
        const transformed = {
            ...data,
            source: 'proxied-through-nextjs'
        };

        return new Response(JSON.stringify(transformed), {
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Unexpected error';
        
        return new Response(message, { status: 500 });
    }
}