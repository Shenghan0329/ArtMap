// Places Services
export const largeMapQuery = {
    'type': 'locality',
    'keyword': 'city',
}
export const regionQuery = {
    'type': 'administrative_area_level_2',
}
export const stateQuery = {
    'type': 'country'
}
export const smallMapQuery = {
    'type': 'tourist_attraction',
    'keyword': 'attraction',
}
export const smallMapDetailsFields = ['place_id', 'name', 'formatted_address', 'photos', 'url', 'vicinity', 'website']
export const smallMapDetailsQuery = {
    'fields': smallMapDetailsFields,
}
