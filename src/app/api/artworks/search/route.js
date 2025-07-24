const CHICAGO_SEARCH_API = 'https://api.artic.edu/api/v1/artworks/search'

export async function GET(request, params) {
    try {
        // Extract search parameters from the URL
        const { searchParams } = new URL(request.url);
        
        // Build query string from allowed search parameters
        const allowedParams = ['ids', 'limit', 'page', 'fields', 'include', 'q', 'query', 'sort', 'from', 'size', 'facets'];
        const queryParams = new URLSearchParams();
        
        allowedParams.forEach(param => {
            const value = searchParams.get(param);
            if (value) {
                queryParams.append(param, value);
            }
        });
        
        // Construct the full API URL with query parameters
        const apiUrl = queryParams.toString() 
            ? `${CHICAGO_SEARCH_API}?${queryParams.toString()}`
            : CHICAGO_SEARCH_API;

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.API_TOKEN}`
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