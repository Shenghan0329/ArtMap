// Places Services

// zoom <= 7
export const countriesQuery = {
    'query': 'major cities',
    'type': 'locality',
    'language': 'en'
}
// zoom <= 13
export const majorCitiesQuery = {
    'query': 'major cities',
    'type': 'locality',
    'language': 'en'
};
// Larger zoom
export const smallMapQuery = {
    'query': 'popular tourist destinations landmarks',
    'type': 'tourist_attraction',
    'language': 'en'
};
export const smallMapDetailsFields = ['place_id', 'name', 'formatted_address', 'photos', 'url', 'vicinity', 'website']
export const smallMapDetailsQuery = {
    'fields': smallMapDetailsFields,
    'language': 'en'
}

// 3D Map
export const regionQuery = {
    'type': 'administrative_area_level_2',
    'language': 'en'
}
