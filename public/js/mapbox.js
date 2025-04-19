/* eslint-disable*/
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWxpbWFobTB1ZCIsImEiOiJjbTkwNmVmbzIwaGxqMmxxeWl5bGpkMTd0In0.5yG35KBefLNjLSdGEFC5DQ';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/alimahm0ud/cm90cjaa9006s01sd9ty31rs6', // style URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    var el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      anchor: 'bottom',
      offset: 45,
      className: 'mapboxgl-popup',
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p class='mapboxgl-popup-content'>${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100,
    },
  });
};
