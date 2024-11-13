const hackathonData = {
    "ZenHack 2024": {
        name: "ZenHack 2024",
        image: "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/002/924/909/datas/medium_square.png",
        description:
            "A hackathon catered toward the new generation of innovators, High School Students, focused on improving the world for the better through innovative projects.",
        eligibility: [
            "Ages 13+ only",
            "High school students only",
            "All countries/territories, excluding standard exceptions",
        ],
        about: "We're Zenith, an organization dedicated to promoting the next generation of innovators, high school students, and we've decided to create this hackathon to allow students to get a taste of building something for themselves, along with their peers, while being supervised by industry professional mentors, and of course, free food.",
    },
    "HackUNCP 2024": {
        name: "HackUNCP 2024",
        image: "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/003/020/931/datas/medium_square.jpg",
        description:
            "Join us for 24 hours of coding, creativity, and innovation at the University of North Carolina at Pembroke.",
        eligibility: [
            "College students only",
            "Must be 18+ years old",
            "Valid student ID required",
        ],
        about: "HackUNCP is the premier hackathon at UNCP, bringing together students from all backgrounds to create, innovate, and learn from each other in a collaborative environment.",
    },
    "hackUMBC Fall 2024": {
        name: "hackUMBC Fall 2024",
        image: "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/003/034/787/datas/medium_square.png",
        description:
            "The largest collegiate hackathon in Maryland, bringing together innovators from across the region.",
        eligibility: [
            "All university students welcome",
            "Recent graduates (within 1 year)",
            "Must be 18+ years old",
        ],
        about: "hackUMBC is more than just a hackathon - it's a celebration of technology, creativity, and collaboration. Join us for 36 hours of hacking, workshops, and fun!",
    },
    "BevHacks 2025": {
        name: "BevHacks 2025",
        image: "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/003/092/858/datas/medium_square.png",
        description:
            "A unique hackathon focused on innovating the beverage industry through technology.",
        eligibility: [
            "Open to all developers",
            "Must be 21+ years old",
            "Industry professionals welcome",
        ],
        about: "BevHacks brings together tech enthusiasts and beverage industry experts to create innovative solutions for the future of beverages.",
    },
    "TAMU Datathon 2024": {
        name: "TAMU Datathon 2024",
        image: "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/003/120/802/datas/medium_square.png",
        description:
            "Texas A&M's premier data science competition, focusing on real-world data challenges.",
        eligibility: [
            "All university students",
            "Data science enthusiasts",
            "No experience required",
        ],
        about: "Join us for 48 hours of data analysis, machine learning, and visualization challenges. Learn from industry experts and showcase your skills!",
    },
};

function showCategory(category) {
    const buttons = document.querySelectorAll(".toggle-button");
    buttons.forEach((button) => button.classList.remove("active"));
    document
        .querySelector(`.toggle-button[onclick="showCategory('${category}')"]`)
        .classList.add("active");

    document
        .getElementById("events-locations")
        .classList.toggle("hidden", category !== "events");
    document
        .getElementById("hackathons-locations")
        .classList.toggle("hidden", category !== "hackathons");
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
    const { AltitudeMode, Marker3DElement } = await google.maps.importLibrary(
        "maps3d"
    );
    const viewport = geometry.viewport;
    map3DElement.tilt = 5;

    // Remove previous marker and polygon if they exist
    if (currentMarker) {
        map3DElement.removeChild(currentMarker);
    }
    if (currentPolygon) {
        map3DElement.removeChild(currentPolygon);
    }

    // Center point for placing the marker
    const centerLat =
        (viewport.getNorthEast().lat() + viewport.getSouthWest().lat()) / 2;
    const centerLng =
        (viewport.getNorthEast().lng() + viewport.getSouthWest().lng()) / 2;
    const centerPoint = { lat: centerLat, lng: centerLng };

    // Calculate hexagon coordinates
    const radiusInMeters = 400;
    const earthRadius = 6371000;

    const hexagonCoordinates = Array.from({ length: 6 }, (_, i) => {
        const angle = i * 60 * (Math.PI / 180);
        const dLat = (radiusInMeters / earthRadius) * Math.cos(angle);
        const dLng =
            (radiusInMeters /
                (earthRadius * Math.cos((centerLat * Math.PI) / 180))) *
            Math.sin(angle);

        return {
            lat: centerLat + dLat * (180 / Math.PI),
            lng: centerLng + dLng * (180 / Math.PI),
        };
    });

    // Create a polygon element for the hexagon 
    const polygonElement = document.createElement("gmp-polygon-3d");
    polygonElement.setAttribute("height", "100");
    polygonElement.setAttribute("altitude-mode", "clamp-to-ground");
    polygonElement.setAttribute("stroke-color", "#ffa500"); // Outline color
    polygonElement.setAttribute("stroke-width", "20");
    polygonElement.setAttribute("fill-color", "none");

    customElements.whenDefined(polygonElement.localName).then(() => {
        polygonElement.outerCoordinates = [
            ...hexagonCoordinates,
            hexagonCoordinates[0],
        ]; 
    });

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
    const latitude =
        typeof geometry.location.lat === "function"
            ? geometry.location.lat()
            : geometry.location.lat;
    const longitude =
        typeof geometry.location.lng === "function"
            ? geometry.location.lng()
            : geometry.location.lng;

    // Smooth zoom-in effect to center and target altitude
    const targetAltitude = 1000;
    let currentAltitude = 160000;
    const zoomStep = 800;
    const zoomInterval = 10; // Time for zoom

    const zoomIn = setInterval(() => {
        if (currentAltitude > targetAltitude) {
            currentAltitude -= zoomStep;
            map3DElement.center = {
                lat: latitude,
                lng: longitude,
                altitude: currentAltitude,
            };
        } else {
            clearInterval(zoomIn); // Stop zoom interval
            setTimeout(() => showPopup(name, lat, lng), 1000);
        }
    }, zoomInterval);
};

function showPopup(name) {
  const hackathon = hackathonData[name];
  if (!hackathon) {
      console.error("Hackathon data not found for:", name);
      return;
  }

  // Update popup content with hackathon details
  const titleElement = document.querySelector(".title");
  const subtitleElement = document.querySelector(".subtitle");
  const aboutElement = document.querySelector(".section p");
  const imageElement = document.querySelector(".header-image");

  // Check each element and log if not found
  if (!titleElement) {
      console.error("Title element not found in the popup.");
      return;
  }
  if (!subtitleElement) {
      console.error("Subtitle element not found in the popup.");
      return;
  }
  if (!aboutElement) {
      console.error("About element not found in the popup.");
      return;
  }
  if (!imageElement) console.error("Image element not found.");


  // Set the content if elements are found
  titleElement.textContent = hackathon.name;
  subtitleElement.textContent = hackathon.description;
  aboutElement.textContent = hackathon.about;
  if (hackathon.image && imageElement) imageElement.src = hackathon.image;


  // Show the popup
  document.getElementById("popupOverlay").classList.remove("hidden");
  document.getElementById("popup").classList.remove("hidden");
}



function closePopup() {
    document.getElementById("popupOverlay").classList.add("hidden");
    document.getElementById("popup").classList.add("hidden");
}

function showLocation(name, lat, lng) {
    zoomToViewport(
        {
            location: { lat, lng },
            viewport: {
                getNorthEast: () => ({
                    lat: () => lat + 0.01,
                    lng: () => lng + 0.01,
                }),
                getSouthWest: () => ({
                    lat: () => lat - 0.01,
                    lng: () => lng - 0.01,
                }),
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
  zoomToViewport(
      {
          location: { lat, lng },
          viewport: {
              getNorthEast: () => ({
                  lat: () => lat + 0.01,
                  lng: () => lng + 0.01,
              }),
              getSouthWest: () => ({
                  lat: () => lat - 0.01,
                  lng: () => lng - 0.01,
              }),
          },
      },
      name, 
      lat,
      lng
  );
}


init();
