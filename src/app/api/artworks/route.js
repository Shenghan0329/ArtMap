const CHICAGO_API = 'https://api.artic.edu/api/v1/artworks'

export async function GET(request, params) {
    try {
        // Try to get parameters from request body (if any)
        let bodyParams = {};
        try {
            const body = await request.text();
            if (body) {
                bodyParams = JSON.parse(body);
            }
        } catch {
            // No body or invalid JSON, continue with URL params only
        }
        
        // Extract search parameters from the URL
        const { searchParams } = new URL(request.url);
        
        // Merge URL params and body params (URL params take precedence)
        const allowedParams = ['limit', 'page', 'fields', 'ids', 'include'];
        const queryParams = new URLSearchParams();
        
        allowedParams.forEach(param => {
            const urlValue = searchParams.get(param);
            const bodyValue = bodyParams[param];
            const value = urlValue || bodyValue;
            
            if (value) {
                queryParams.append(param, value);
            }
        });
        
        // Construct the full API URL with query parameters
        const apiUrl = queryParams.toString() 
            ? `${CHICAGO_API}?${queryParams.toString()}`
            : CHICAGO_API;

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