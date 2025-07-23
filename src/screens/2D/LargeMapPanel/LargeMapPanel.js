import { useState, useEffect, useMemo, useContext } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";

import { regionQuery } from "@/constants/google_map_queries";
import { stateQuery } from "@/constants/google_map_queries";
import RandomSelector from "@/common/RandomSelector";
import getState from "@/common/getState";
import { ErrorContext } from "@/app/page";

const MIN_SIZE = 12;
const PAGE_SIZE = 4;
const MAX_SIZE = 120;

const LargeMapPanel = ({place}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');

    const [time, setTime] = useState(2025);
    const [currRegion, setCurrRegion] = useState({
        state: null,
        county: null
    });
    const [ids, setIds] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [toQuery, setToQuery] = useState(true);

    const { error, setError } = useContext(ErrorContext);

    const detailedPlace = usePlace(place, map, placesLib, smallMapDetailsQuery);

    useEffect(() => {
        if (!map || !placesLib) return;
        const bounds = map.getBounds();
        const svc = new placesLib.PlacesService(map);
        svc.nearbySearch({
            'bounds': bounds,
            ...regionQuery, 
        }, (res, status, pagination) => {
            if (status == 'OK' && res.length > 0) {
                setCurrRegion({...currRegion, county: res[0]});
            } else {
                setError('STATE_NOT_FOUND');
            }
        });
    }, [map, placesLib]);
    useEffect(() => {
        async function fetchIDs() {
            if (!place?.name) return;
            const res = await fetch(`/api/artworks/search?hasImages=true&q=${place.name}`);
            if (res?.error) {
                setError(error);
                return;
            }
            const artworks = await res.json();
            let artworkIds = [];
            if (artworks?.objectIDs) artworkIds.push(...artworks?.objectIDs.slice(0, MAX_SIZE));
            if (artworkIds.length < MIN_SIZE) {
                if (currRegion?.county) {
                    const res = await fetch(`/api/artworks/search?hasImages=true&q=${currRegion.county}`);
                    let additionalArtworks = undefined;
                    if (res?.error) {
                        setError(error);
                    } else {
                        additionalArtworks = await res.json();
                    }
                    if (additionalArtworks?.objectIDs) artworkIds.push(...additionalArtworks?.objectIDs.slice(0, MAX_SIZE));
                }
            }
            if (artworkIds.length < MIN_SIZE) {
                const state = getState(place.vicinity);
                if (state) {
                    const res = await fetch(`/api/artworks/search?hasImages=true&q=${state}`);
                    let additionalArtworks = undefined;
                    if (res?.error) {
                        setError(error);
                    } else {
                        additionalArtworks = await res.json();
                    }
                    if (additionalArtworks?.objectIDs) artworkIds.push(...additionalArtworks?.objectIDs.slice(0, MAX_SIZE));
                }
            }
            if (artworkIds && artworkIds.length) {
                artworkIds = artworkIds.slice(0, MAX_SIZE);
                setIds(artworkIds);
            }
        }
        fetchIDs();
    }, [place]);
    const rs = useMemo(() => {
        if (!ids) return null;
        if (ids) return new RandomSelector(ids);
    }, [ids]);
    useEffect(() => {
        if (!ids) return;
        if (rs) {
            const fetchArtworks = async (ids) => {
                let artworksLeft = PAGE_SIZE;
                const artworks = [];
                while (artworksLeft > 0) {
                    const selectedIds = rs.select(1);
                    if (selectedIds.length === 0) {
                        break; 
                    }
                    for (let i = 0; i < selectedIds.length; i++) {
                        const id = selectedIds[i];
                        const res = await fetch(`/api/artworks/${id}`);
                        if (res?.error) {
                            setError(error);
                        } else {
                            const artwork = await res.json();
                            if (artwork?.primaryImageSmall !== "") {
                                artworks.push(artwork);
                                artworksLeft -= 1;
                            } else {
                                continue;
                            }
                        }
                    }
                }
                setArtworks(artworks);
                console.log(artworks);
            }
            fetchArtworks(ids);
            setToQuery(false);
        }
    }, [rs, toQuery]);
    
    return (<>
        <div className="flex flex-row">
            <TimeLine time={time} setTime={setTime}/>
        </div>
        <div className="mb-2">Year: {time}</div>
        <div className="mb-2">About {place.name}</div>
        <div className="flex flex-row flex-wrap gap-2">
            {artworks.map((item, index) => {
                
                return (
                    <div className="relative basis-19/40 aspect-square bg-gray-100 overflow-hidden" key={index}>
                        <Image
                            className="dark:invert w-full h-auto"
                            src={item?.primaryImageSmall}
                            alt={item?.title}
                            fill={true}
                            sizes='500px'
                            blurDataURL="/sample-img.jpg"
                            placeholder="blur"
                            priority
                        />
                    </div>
                )
            })}
        </div>
    </>);
}

export default LargeMapPanel;