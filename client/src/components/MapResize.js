import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function MapResize() {
    var map = useMap();

    useEffect(function() {
        function resize() {
            map.invalidateSize({ animate: false });
        }

        resize();
        var timers = [
            setTimeout(resize, 100),
            setTimeout(resize, 400),
            setTimeout(resize, 800)
        ];
        window.addEventListener('resize', resize);

        return function() {
            timers.forEach(clearTimeout);
            window.removeEventListener('resize', resize);
        };
    }, [map]);

    return null;
}

export default MapResize;
