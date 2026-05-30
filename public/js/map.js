mapboxgl.accessToken = mapToken;
console.log(mapToken);
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 13, // starting zoom
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .addTo(map)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      "<h6>Exact location provided after booking </h6>"
    )
  );
