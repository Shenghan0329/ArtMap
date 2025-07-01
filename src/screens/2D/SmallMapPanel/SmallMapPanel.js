import { useState, useEffect } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import CloseButton from "@/components/Buttons/CloseButton";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/queries/google_map_queries";

const SmallMapPanel = ({place}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const [detailedPlace, setDetailedPlace] = useState({});
    
    useEffect(() => {
        console.log(place);
        if (!placesLib || !map) return;
        const svc = new placesLib.PlacesService(map);
        svc.getDetails({
            placeId: place.place_id,
            ...smallMapDetailsQuery
        }, (place, status) => {
            if (status === 'OK') {
                setDetailedPlace(place);
            }
        });
    }, [place, map, placesLib]);

    return (<>
        <div className="text-lg font-bold">{place?.name}</div>
        <div className="text-sm">Location: {place?.vicinity}</div>
        <div className="flex flex-row flex-wrap gap-2">
            {detailedPlace?.photos?.slice(0, 8).map((item, index) => {
                console.log(item);
                return (
                    <div className="relative basis-19/40 aspect-square bg-gray-100 overflow-hidden" key={index}>
                    <Image
                        className="dark:invert"
                        src="/sample-img.jpg"
                        alt="Sample Image"
                        layout="fill"
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    </div>
                )
            })}
        </div>
    </>);
}

export default SmallMapPanel

// export interface PlaceResult {
//     /**
//      * The collection of address components for this Place’s location. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     address_components?: google.maps.GeocoderAddressComponent[];
//     /**
//      * The representation of the Place’s address in the <a
//      * href="http://microformats.org/wiki/adr">adr microformat</a>. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     adr_address?: string;
//     /**
//      * The rated aspects of this Place, based on Google and Zagat user reviews.
//      * The ratings are on a scale of 0 to 30.
//      */
//     aspects?: google.maps.places.PlaceAspectRating[];
//     /**
//      * A flag indicating the operational status of the Place, if it is a
//      * business (indicates whether the place is operational, or closed either
//      * temporarily or permanently). If no data is available, the flag is not
//      * present in search or details responses.
//      */
//     business_status?: google.maps.places.BusinessStatus;
//     /**
//      * The Place’s full address.
//      */
//     formatted_address?: string;
//     /**
//      * The Place’s phone number, formatted according to the <a
//      * href="http://en.wikipedia.org/wiki/Local_conventions_for_writing_telephone_numbers">
//      * number&#39;s regional convention</a>. Only available with {@link
//      * google.maps.places.PlacesService.getDetails}.
//      */
//     formatted_phone_number?: string;
//     /**
//      * The Place’s geometry-related information.
//      */
//     geometry?: google.maps.places.PlaceGeometry;
//     /**
//      * Attribution text to be displayed for this Place result. Available
//      * <code>html_attributions</code> are always returned regardless of what
//      * <code>fields</code> have been requested, and must be displayed.
//      */
//     html_attributions?: string[];
//     /**
//      * URL to an image resource that can be used to represent this Place’s
//      * category.
//      */
//     icon?: string;
//     /**
//      * Background color for use with a Place&#39;s icon. See also {@link
//      * google.maps.places.PlaceResult.icon_mask_base_uri}.
//      */
//     icon_background_color?: string;
//     /**
//      * A truncated URL to an icon mask. Access different icon types by appending
//      * a file extension to the end (i.e. <code>.svg</code> or
//      * <code>.png</code>).
//      */
//     icon_mask_base_uri?: string;
//     /**
//      * The Place’s phone number in international format. International format
//      * includes the country code, and is prefixed with the plus (+) sign. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     international_phone_number?: string;
//     /**
//      * The Place’s name. Note: In the case of user entered Places, this is the
//      * raw text, as typed by the user. Please exercise caution when using this
//      * data, as malicious users may try to use it as a vector for code injection
//      * attacks (See <a href="http://en.wikipedia.org/wiki/Code_injection">
//      * http://en.wikipedia.org/wiki/Code_injection</a>).
//      */
//     name?: string;
//     /**
//      * Defines when the Place opens or closes.
//      */
//     opening_hours?: google.maps.places.PlaceOpeningHours;
//     /**
//      * A flag indicating whether the Place is closed, either permanently or
//      * temporarily. If the place is operational, or if no data is available, the
//      * flag is absent from the response.
//      * @deprecated <code>permanently_closed</code> is deprecated as of May 2020
//      *     and will be turned off in May 2021. Use {@link
//      *     google.maps.places.PlaceResult.business_status} instead as
//      *     <code>permanently_closed</code> does not distinguish between
//      *     temporary and permanent closures.
//      */
//     permanently_closed?: boolean;
//     /**
//      * Photos of this Place. The collection will contain up to ten {@link
//      * google.maps.places.PlacePhoto} objects.
//      */
//     photos?: google.maps.places.PlacePhoto[];
//     /**
//      * A unique identifier for the Place.
//      */
//     place_id?: string;
//     /**
//      * Defines Open Location Codes or &quot;<a href="https://plus.codes/">plus
//      * codes</a>&quot; for the Place.
//      */
//     plus_code?: google.maps.places.PlacePlusCode;
//     /**
//      * The price level of the Place, on a scale of 0 to 4. Price levels are
//      * interpreted as follows: <ul style="list-style-type: none;">
//      * <li><code>0</code>: Free <li><code>1</code>: Inexpensive
//      * <li><code>2</code>: Moderate <li><code>3</code>: Expensive
//      * <li><code>4</code>: Very Expensive
//      * </ul>
//      */
//     price_level?: number;
//     /**
//      * A rating, between 1.0 to 5.0, based on user reviews of this Place.
//      */
//     rating?: number;
//     /**
//      * A list of reviews of this Place. Only available with {@link
//      * google.maps.places.PlacesService.getDetails}.
//      */
//     reviews?: google.maps.places.PlaceReview[];
//     /**
//      * An array of <a
//      * href="https://developers.google.com/maps/documentation/places/web-service/supported_types">
//      * types for this Place</a> (for example, <code>["political",
//      * "locality"]</code> or <code>["restaurant", "establishment"]</code>).
//      */
//     types?: string[];
//     /**
//      * URL of the official Google page for this place. This is the Google-owned
//      * page that contains the best available information about the Place. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     url?: string;
//     /**
//      * The number of user ratings which contributed to this Place’s {@link
//      * google.maps.places.PlaceResult.rating}.
//      */
//     user_ratings_total?: number;
//     /**
//      * The offset from UTC of the Place’s current timezone, in minutes. For
//      * example, Sydney, Australia in daylight savings is 11 hours ahead of UTC,
//      * so the <code>utc_offset</code> will be <code>660</code>. For timezones
//      * behind UTC, the offset is negative. For example, the
//      * <code>utc_offset</code> is <code>-60</code> for Cape Verde. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      * @deprecated <code>utc_offset</code> is deprecated as of November 2019.
//      *     Use {@link google.maps.places.PlaceResult.utc_offset_minutes}
//      *     instead. See <a
//      *     href="https://goo.gle/js-open-now">https://goo.gle/js-open-now</a>
//      */
//     utc_offset?: number;
//     /**
//      * The offset from UTC of the Place’s current timezone, in minutes. For
//      * example, Sydney, Australia in daylight savings is 11 hours ahead of UTC,
//      * so the <code>utc_offset_minutes</code> will be <code>660</code>. For
//      * timezones behind UTC, the offset is negative. For example, the
//      * <code>utc_offset_minutes</code> is <code>-60</code> for Cape Verde. Only
//      * available with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     utc_offset_minutes?: number;
//     /**
//      * The simplified address for the Place, including the street name, street
//      * number, and locality, but not the province/state, postal code, or
//      * country. For example, Google&#39;s Sydney, Australia office has a
//      * vicinity value of <code>"48 Pirrama Road, Pyrmont"</code>. Only available
//      * with {@link google.maps.places.PlacesService.getDetails}.
//      */
//     vicinity?: string;
//     /**
//      * The authoritative website for this Place, such as a business&#39;
//      * homepage. Only available with {@link
//      * google.maps.places.PlacesService.getDetails}.
//      */
//     website?: string;
//   }