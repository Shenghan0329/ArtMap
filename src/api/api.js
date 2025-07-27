import { CHICAGO_API, CHICAGO_IMAGE_API, CHICAGO_SEARCH_API, FULL_SIZE, MED_SIZE, SM_SIZE } from "@/constants/api_endpoints";

const sampleImage = '/sample-img.jpg';

const getArtworkById = async (id) => {
    const res = await fetch(`${CHICAGO_API}/${id}`);
    const response = await res.json();
    if (response?.data) {
        const altImageId = response.data.alt_image_ids?.length ? response.data.alt_image_ids[0] : null;
        const imageId = response.data.image_id ? response.data.image_id : altImageId;
        if (imageId) {
            const primaryImageLarge = getImageById(imageId, 'lg');
            const primaryImageMedium = getImageById(imageId, 'md');
            const primaryImageSmall = getImageById(imageId, 'sm');
            const validImage = await getValidUrl({primaryImageLarge, primaryImageMedium, primaryImageSmall});
            return {...response.data, primaryImageLarge, primaryImageMedium, primaryImageSmall, validImage};
        } else {
            const primaryImageLarge = sampleImage;
            const primaryImageMedium = sampleImage;
            const primaryImageSmall = sampleImage;
            const validImage = sampleImage;
            return {...response.data, primaryImageLarge, primaryImageMedium, primaryImageSmall, validImage};
        }
    } else {
        return response;
    }
}

const getArtworksByQuery = async (query) => {
    const res = await fetch(`${CHICAGO_SEARCH_API}?q=${query}`)
    const response = await res.json();
    return (response?.data) ? response.data : response;
}

const getImageById = (imageId, s='md') => {
    const sizes = {'sm': SM_SIZE, 'md': MED_SIZE, 'lg': FULL_SIZE}
    const size = sizes[s] ? sizes[s] : MED_SIZE;
    const url = `${CHICAGO_IMAGE_API}/${imageId}${size}`;
    return url;
}

const getValidUrl = async (artwork, sizes=['primaryImageLarge', 'primaryImageMedium', 'primaryImageSmall']) => {
    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const res = await fetch(artwork[size]);
        if (!res?.ok) {
            continue;
        } else {
            return artwork[size];
        }
    }
    return './sample-img.jpg';
}

/**
 * Simplified version that only checks if artwork creation overlaps with the range
 * @param {number} from - Start year (inclusive)
 * @param {number} to - End year (inclusive) 
 * @param {Object} options - Additional options
 * @returns {Promise} - API response with artworks
 */

async function searchArtworksByTimeRange(from, to, options = {}) {
    const {
        searchTerm = "*",
        limit = 10,
        page = 1,
        publicDomainOnly = false
    } = options;
    
    const baseUrl = "https://api.artic.edu/api/v1/artworks/search";
    
    // Build the query object that will be passed as params
    const queryObj = {
        q: searchTerm,
        query: {
            bool: {
                must: [
                    {
                        range: {
                            date_start: {
                                gte: from,
                                lte: to
                            }
                        }
                    }
                ]
            }
        },
        limit: limit,
        page: page
    };
    
    // Add public domain filter if requested
    if (publicDomainOnly) {
        queryObj.query.bool.must.push({
            term: {
                is_public_domain: true
            }
        });
    }
    
    // The API expects the entire query as a JSON string in the 'params' parameter
    const params = new URLSearchParams({
        params: JSON.stringify(queryObj)
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        const res = await response.json();
        return res.data;
    } catch (error) {
        console.error('Error searching artworks:', error);
        throw error;
    }
}

export {getArtworkById, getArtworksByQuery, getImageById, getValidUrl, searchArtworksByTimeRange};

// {
// data: {
// id: 208516,
// api_model: "artworks",
// api_link: "https://api.artic.edu/api/v1/artworks/208516",
// is_boosted: false,
// title: "Fireplace Surround",
// alt_titles: null,
// thumbnail: {
// lqip: "data:image/gif;base64,R0lGODlhCAAFAPUAAHdZLnxhNn9mT3xnU4duOYpxPJN4QZh/SYFvWoJvWoNxXoV0Y4Z5a4x6a4p8a419aoh6bo5+b5F9ZZB9aIh8cIx+c4+AYpKCY6OdfKWefJOSipOSlZOTlrCmibGmiaWqn6exnKqznKKhoqesoK+zorG2pAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAIAAUAAAYlQIagAalEBhQFAOPpZAILiQGk0YQOEwSBxNmUCgmH5SMSjS6PIAA7",
// width: 7200,
// height: 4800,
// alt_text: "A work made of oak and glazed earthenware."
// },
// main_reference_number: "2011.105",
// has_not_been_viewed_much: false,
// boost_rank: null,
// date_start: 1901,
// date_end: 1901,
// date_display: "1901",
// date_qualifier_title: "",
// date_qualifier_id: null,
// artist_display: "Designed by George Washington Maher
// American, 1864–1926
// Made by Louis J. Millet
// American, 1855–1923",
// place_of_origin: "United States",
// description: "<p>Prairie School architect George Washington Maher worked for Joseph Lyman Silsbee before striking out on his own. During this period Maher developed a system of design that he called the “motif rhythm theory,” in which he created a signature motif to harmonize the interior and exterior of a house through the repetition of decorative details based on local natural forms. He frequently collaborated with Louis J. Millet on his commissions, including the Patrick J. King House (1901), from which this fireplace surround came. This extraordinary object is composed of glass mosaics and features one of Maher’s most prominent motifs, the stylized thistle. It is delicately rendered in shades ranging from pale seafoam green to vibrant greens, blues, and yellows. The fireplace surround is an outstanding example of Millet’s exacting execution of Maher’s designs.</p>
// ",
// short_description: "Prairie School architect Maher developed a system of design that he called the “motif rhythm theory,” in which he created a signature motif based on local natural forms and used it in various decorative details to harmonize the interior and exterior of a house. Maher frequently collaborated with Louis J. Millet on his commissions, including the Patrick J. King House (1901), from which this fireplace surround came.",
// dimensions: "Surround: 130.8 × 209.6 cm (51 1/2 × 82 1/2 in.); Mosaic: 111.8 × 162.6 cm (44 × 64 in.); Opening: 76.2 × 90.2 cm (30 × 35 1/2 in.)",
// dimensions_detail: [
// {
// depth: null,
// width: 209,
// height: 130,
// diameter: null,
// clarification: "Surround"
// },
// {
// depth: null,
// width: 162,
// height: 111,
// diameter: null,
// clarification: "Mosaic"
// },
// {
// depth: null,
// width: 90,
// height: 76,
// diameter: null,
// clarification: "Opening"
// }
// ],
// medium_display: "Oak and glazed earthenware",
// inscriptions: null,
// credit_line: "Gift of Alan Wanzenberg in memory of Jed Johnson",
// catalogue_display: null,
// publication_history: null,
// exhibition_history: null,
// provenance_text: null,
// edition: null,
// publishing_verification_level: "Web Basic",
// internal_department_id: 21,
// fiscal_year: 2011,
// fiscal_year_deaccession: null,
// is_public_domain: true,
// is_zoomable: true,
// max_zoom_window_size: -1,
// copyright_notice: null,
// has_multimedia_resources: false,
// has_educational_resources: false,
// has_advanced_imaging: false,
// colorfulness: 44.7616,
// color: {
// h: 201,
// l: 47,
// s: 80,
// percentage: 0.0004221493311043848,
// population: 2
// },
// latitude: null,
// longitude: null,
// latlon: null,
// is_on_view: true,
// on_loan_display: null,
// gallery_title: "Gallery 178",
// gallery_id: 2147476048,
// nomisma_id: null,
// artwork_type_title: "Furniture",
// artwork_type_id: 6,
// department_title: "Arts of the Americas",
// department_id: "PC-3",
// artist_id: 35565,
// artist_title: "George Washington Maher",
// alt_artist_ids: [ ],
// artist_ids: [
// 35565
// ],
// artist_titles: [
// "George Washington Maher"
// ],
// category_ids: [
// "PC-3"
// ],
// category_titles: [
// "Arts of the Americas"
// ],
// term_titles: [
// "mantel (fireplace component)",
// "oak",
// "architecture",
// "Arts and Crafts Movement",
// "mosaic glass",
// "enamel",
// "american decorative arts",
// "decorative arts",
// "furniture",
// "American Arts and Crafts Movement",
// "decorative arts"
// ],
// style_id: "TM-7569",
// style_title: "Arts and Crafts Movement",
// alt_style_ids: [
// "TM-14958"
// ],
// style_ids: [
// "TM-7569",
// "TM-14958"
// ],
// style_titles: [
// "Arts and Crafts Movement",
// "American Arts and Crafts Movement"
// ],
// classification_id: "TM-11782",
// classification_title: "mantel (fireplace component)",
// alt_classification_ids: [
// "TM-2190",
// "TM-1678",
// "TM-76"
// ],
// classification_ids: [
// "TM-11782",
// "TM-2190",
// "TM-1678",
// "TM-76"
// ],
// classification_titles: [
// "mantel (fireplace component)",
// "american decorative arts",
// "decorative arts",
// "furniture"
// ],
// subject_id: "TM-12085",
// alt_subject_ids: [
// "TM-14841"
// ],
// subject_ids: [
// "TM-12085",
// "TM-14841"
// ],
// subject_titles: [
// "architecture",
// "decorative arts"
// ],
// material_id: "TM-3587",
// alt_material_ids: [
// "TM-2658",
// "TM-2510"
// ],
// material_ids: [
// "TM-3587",
// "TM-2658",
// "TM-2510"
// ],
// material_titles: [
// "oak",
// "mosaic glass",
// "enamel"
// ],
// technique_id: null,
// alt_technique_ids: [ ],
// technique_ids: [ ],
// technique_titles: [ ],
// theme_titles: [ ],
// image_id: "36381962-ab62-a5e2-bbef-deef73d2e8a6",
// alt_image_ids: [ ],
// document_ids: [ ],
// sound_ids: [ ],
// video_ids: [ ],
// text_ids: [ ],
// section_ids: [ ],
// section_titles: [ ],
// site_ids: [ ],
// suggest_autocomplete_all: [
// {
// input: [
// "2011.105"
// ],
// contexts: {
// groupings: [
// "accession"
// ]
// }
// },
// {
// input: [
// "Fireplace Surround"
// ],
// weight: 1282,
// contexts: {
// groupings: [
// "title"
// ]
// }
// }
// ],
// source_updated_at: "2025-06-09T13:46:07-05:00",
// updated_at: "2025-06-09T13:50:36-05:00",
// timestamp: "2025-07-23T22:49:10-05:00"
// },
// info: {
// license_text: "The `description` field in this response is licensed under a Creative Commons Attribution 4.0 Generic License (CC-By) and the Terms and Conditions of artic.edu. All other data in this response is licensed under a Creative Commons Zero (CC0) 1.0 designation and the Terms and Conditions of artic.edu.",
// license_links: [
// "https://creativecommons.org/publicdomain/zero/1.0/",
// "https://www.artic.edu/terms"
// ],
// version: "1.13"
// },
// config: {
// iiif_url: "https://www.artic.edu/iiif/2",
// website_url: "http://www.artic.edu"
// }
// }