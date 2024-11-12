const hackathonData = {
  'ZenHack 2024': {
      name: 'ZenHack 2024',
      description: 'A hackathon catered toward the new generation of innovators, High School Students, focused on improving the world for the better through innovative projects.',
      eligibility: [
          'Ages 13+ only',
          'High school students only',
          'All countries/territories, excluding standard exceptions'
      ],
      about: "We're Zenith, an organization dedicated to promoting the next generation of innovators, high school students, and we've decided to create this hackathon to allow students to get a taste of building something for themselves, along with their peers, while being supervised by industry professional mentors, and of course, free food."
  },
  'HackUNCP 2024': {
      name: 'HackUNCP 2024',
      description: 'Join us for 24 hours of coding, creativity, and innovation at the University of North Carolina at Pembroke.',
      eligibility: [
          'College students only',
          'Must be 18+ years old',
          'Valid student ID required'
      ],
      about: 'HackUNCP is the premier hackathon at UNCP, bringing together students from all backgrounds to create, innovate, and learn from each other in a collaborative environment.'
  },
  'hackUMBC Fall 2024': {
      name: 'hackUMBC Fall 2024',
      description: 'The largest collegiate hackathon in Maryland, bringing together innovators from across the region.',
      eligibility: [
          'All university students welcome',
          'Recent graduates (within 1 year)',
          'Must be 18+ years old'
      ],
      about: 'hackUMBC is more than just a hackathon - it\'s a celebration of technology, creativity, and collaboration. Join us for 36 hours of hacking, workshops, and fun!'
  },
  'BevHacks 2025': {
      name: 'BevHacks 2025',
      description: 'A unique hackathon focused on innovating the beverage industry through technology.',
      eligibility: [
          'Open to all developers',
          'Must be 21+ years old',
          'Industry professionals welcome'
      ],
      about: 'BevHacks brings together tech enthusiasts and beverage industry experts to create innovative solutions for the future of beverages.'
  },
  'TAMU Datathon 2024': {
      name: 'TAMU Datathon 2024',
      description: 'Texas A&M\'s premier data science competition, focusing on real-world data challenges.',
      eligibility: [
          'All university students',
          'Data science enthusiasts',
          'No experience required'
      ],
      about: 'Join us for 48 hours of data analysis, machine learning, and visualization challenges. Learn from industry experts and showcase your skills!'
  }
};



function showCategory(category) {
  const buttons = document.querySelectorAll('.toggle-button');
  buttons.forEach(button => button.classList.remove('active'));
  document.querySelector(`.toggle-button[onclick="showCategory('${category}')"]`).classList.add('active');
  
  // Show or hide location lists based on the selected category
  document.getElementById('events-locations').classList.toggle('hidden', category !== 'events');
  document.getElementById('hackathons-locations').classList.toggle('hidden', category !== 'hackathons');
}


let map3DElement = null;
let currentMarker = null;
let currentPolygon = null;

async function init() {
  const { Map3DElement } = await google.maps.importLibrary("maps3d");
  map3DElement = new Map3DElement({
    center: { lat: 0, lng: 0, altitude: 16000000 },
  });
  document.getElementById("map-container").append(map3DElement);
  initAutocomplete();
}

async function initAutocomplete() {
  const { Autocomplete } = await google.maps.importLibrary("places");
  const autocomplete = new Autocomplete(
    document.getElementById("pac-input"),
    {
      fields: ["geometry", "name", "place_id"],
    }
  );
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.viewport) {
      window.alert("No viewport for input: " + place.name);
      return;
    }
    zoomToViewport(place.geometry);
  });
}

const zoomToViewport = async (geometry, name, lat, lng) => {
  const { AltitudeMode, Marker3DElement } = await google.maps.importLibrary("maps3d");
  const viewport = geometry.viewport;

  // Remove previous marker and polygon if they exist
  if (currentMarker) {
      map3DElement.removeChild(currentMarker);
  }
  if (currentPolygon) {
      map3DElement.removeChild(currentPolygon);
  }

  // Center point for placing the marker
  const centerLat = (viewport.getNorthEast().lat() + viewport.getSouthWest().lat()) / 2;
  const centerLng = (viewport.getNorthEast().lng() + viewport.getSouthWest().lng()) / 2;
  const centerPoint = { lat: centerLat, lng: centerLng };

  // Calculate hexagon coordinates at 500-meter radius around the center point
  const radiusInMeters = 400;
  const earthRadius = 6371000; // Earth's radius in meters

  const hexagonCoordinates = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60) * (Math.PI / 180); // Convert degrees to radians
      const dLat = (radiusInMeters / earthRadius) * Math.cos(angle);
      const dLng = (radiusInMeters / (earthRadius * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);

      return {
          lat: centerLat + (dLat * (180 / Math.PI)),
          lng: centerLng + (dLng * (180 / Math.PI))
      };
  });

  // Create a polygon element for the hexagon outline
  const polygonElement = document.createElement('gmp-polygon-3d');
  polygonElement.setAttribute("height", "100");
  polygonElement.setAttribute("altitude-mode", "clamp-to-ground");
  polygonElement.setAttribute("stroke-color", "#ffa500"); // Red outline
  polygonElement.setAttribute("stroke-width", "20");      // Thick border
  polygonElement.setAttribute("fill-color", "none");      // No fill
  // polygonElement.setAttribute("fill-opacity", "0.1");


  // Wait for the polygon element to be defined, then set its coordinates
  customElements.whenDefined(polygonElement.localName).then(() => {
      polygonElement.outerCoordinates = [...hexagonCoordinates, hexagonCoordinates[0]]; // Close the hexagon
  });

  // Append the new polygon element to the map
  map3DElement.append(polygonElement);
  currentPolygon = polygonElement;

  // Add a marker at the center point
  const elevation = await getElevationforPoint(centerPoint);
  const marker = new Marker3DElement({
      position: { lat: centerLat, lng: centerLng, altitude: elevation },
  });
  map3DElement.append(marker);
  currentMarker = marker;

  // Retrieve lat and lng, handling both cases of function or direct value
  const latitude = typeof geometry.location.lat === "function" ? geometry.location.lat() : geometry.location.lat;
  const longitude = typeof geometry.location.lng === "function" ? geometry.location.lng() : geometry.location.lng;

  // Adjust map center and properties
  map3DElement.center = { lat: latitude, lng: longitude, altitude: elevation + 0 };
  map3DElement.heading = 0;
  map3DElement.range = 1000;
  map3DElement.tilt = 65;

  // Show popup after zoom
  setTimeout(() => showPopup(name, lat, lng), 800); // Delay to ensure zoom is completed
};



  
  // // Show popup function
  // function showPopup(name, lat, lng) {
  //   const popup = document.getElementById("popup");
  //   document.getElementById("popup-content").innerText = `Location: ${name}\nLatitude: ${lat}\nLongitude: ${lng}`;
  //   popup.classList.remove("hidden", "hide"); // Remove hidden and hide classes
  //   popup.classList.add("show"); // Add show class to trigger the animation
  // }
  
  // function closePopup() {
  //   const popup = document.getElementById("popup");
  //   popup.classList.remove("show"); // Remove show class to start fade-out
  //   popup.classList.add("hide"); // Add hide class for slide-up animation
  
  //   // After animation ends, add hidden class to remove popup from view
  //   setTimeout(() => popup.classList.add("hidden"), 300); // Match CSS transition duration
  // }

  function showPopup() {
    document.getElementById('popupOverlay').classList.remove('hidden');
    document.getElementById('popup').classList.remove('hidden');
}

function closePopup() {
    document.getElementById('popupOverlay').classList.add('hidden');
    document.getElementById('popup').classList.add('hidden');
}
  
  
  // Updated showLocation function to pass name and coordinates to zoomToViewport
  function showLocation(name, lat, lng) {
    zoomToViewport(
      {
        location: { lat, lng },
        viewport: {
          getNorthEast: () => ({ lat: () => lat + 0.01, lng: () => lng + 0.01 }),
          getSouthWest: () => ({ lat: () => lat - 0.01, lng: () => lng - 0.01 }),
        },
      },
      name,
      lat,
      lng
    );
  }
  
  

async function getElevationforPoint(location) {
  const { ElevationService } = await google.maps.importLibrary("elevation");
  const elevatorService = new google.maps.ElevationService();
  const elevationResponse = await elevatorService.getElevationForLocations({
    locations: [location],
  });
  if (!(elevationResponse.results && elevationResponse.results.length)) {
    window.alert(`Insufficient elevation data for place.`);
    return 10;
  }
  return elevationResponse.results[0].elevation || 10;
}

function showLocation(name, lat, lng) {
  zoomToViewport({ location: { lat, lng }, viewport: { getNorthEast: () => ({ lat: () => lat + 0.01, lng: () => lng + 0.01 }), getSouthWest: () => ({ lat: () => lat - 0.01, lng: () => lng - 0.01 }) } });
}

init();


