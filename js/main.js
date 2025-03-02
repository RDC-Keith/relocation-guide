/*************************************************************
 * main.js - Simplified Relocation Guide with Real Numbeo Data,
 *           Housing Prices Comparison, and Google Maps with a
 *           custom Realtor.com marker.
 *
 * Features:
 * - Two form fields: "Which Tech Hub Are You Coming From?" and 
 *   "Where Are You Considering Moving To?" (using full city strings)
 * - Uses Numbeo's API (with the query= parameter) to fetch:
 *      • cost_of_living
 *      • property_prices
 *      • quality_of_life
 * - Parses cost_of_living data via parseNumbeoCostData() and builds a Chart.js bar chart.
 * - Parses property_prices data via parseNumbeoPropertyPrices() and builds a housing prices chart.
 * - Displays raw Numbeo JSON in dedicated placeholders.
 * - Uses the Google Maps JavaScript API to display a map for the destination,
 *   and adds a custom marker (house emoji) for Realtor.com's address.
 * - Includes a simple carousel.
 *************************************************************/

// Replace these with your actual API keys:
const NUMBEO_API_KEY = 'ydwk8vb0prixpe';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXm1ezEjfsjdDB-f26OAztdiRldLIM8X4';

// Mapping for cities: maps dropdown values to full strings.
const cityMappings = {
  "San Francisco": "San Francisco, CA, United States",
  "Seattle": "Seattle, WA, United States",
  "New York": "New York, NY, United States",
  "Los Angeles": "Los Angeles, CA, United States",
  "Boston": "Boston, MA, United States",
  "Chicago": "Chicago, IL, United States",
  "Denver": "Denver, CO, United States",
  "Atlanta": "Atlanta, GA, United States",
  "Austin": "Austin, TX, United States",
  "Raleigh": "Raleigh, NC, United States",
  "Dallas": "Dallas, TX, United States",
  "San Diego": "San Diego, CA, United States",
  "San Jose": "San Jose, CA, United States",
  "Portland": "Portland, OR, United States",
  "Phoenix": "Phoenix, AZ, United States",
  "Scottsdale": "Scottsdale, AZ, United States"
};

let selectedOriginCity = '';
let selectedDestinationCity = '';
let currentCarouselIndex = 0;

/**
 * Carousel images for each city.
 * Ensure these files exist in your assets/images/ folder.
 */
const carouselImages = {
  'Austin': [
    'assets/images/austin_fine_dining.webp',
    'assets/images/austin_local_school.webp',
    'assets/images/austin_outdoor_concert.webp',
    'assets/images/austin_wine_country_map.webp',
    'assets/images/austin_housing_developments_map.webp',
    'assets/images/austin_trendy_coffee_shop.webp',
    'assets/images/austin_modern_tech_office.webp',
    'assets/images/austin_suburban_neighborhood.webp',
    'assets/images/austin_sixth_street_night.webp',
    'assets/images/austin_barton_creek.webp',
    'assets/images/austin_bbq_scene.webp',
    'assets/images/austin_bats_congress.webp',
    'assets/images/austin_boating_lake_travis.webp',
    'assets/images/austin_farmers_market.webp',
    'assets/images/austin_mural.webp'
  ],
  'Scottsdale': [
    'assets/images/scottsdale-carousel1.jpg',
    'assets/images/scottsdale-carousel2.jpg'
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // Handle form submission (only two fields)
  const moveForm = document.getElementById('moveForm');
  moveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originVal = document.getElementById('originCity').value;
    const destVal = document.getElementById('destinationCity').value;
    selectedOriginCity = cityMappings[originVal] || originVal;
    selectedDestinationCity = cityMappings[destVal] || destVal;
    
    // Update the cost comparison chart with real Numbeo data.
    updateCostChartWithNumbeo(selectedOriginCity, selectedDestinationCity);
    
    // Update raw Numbeo data sections.
    updateNumbeoData();
    
    // Update housing prices chart.
    updateHousingPricesChart(selectedOriginCity, selectedDestinationCity);
    
    // Update carousel and map.
    updateCarousel(selectedDestinationCity);
    initMap(selectedDestinationCity);
    
    // Do not reset the form; selections remain intact.
    document.getElementById('costComparison').scrollIntoView({ behavior: 'smooth' });
  });
  
  // Carousel navigation buttons.
  document.getElementById('prevBtn').addEventListener('click', () => changeCarousel(-1));
  document.getElementById('nextBtn').addEventListener('click', () => changeCarousel(1));
});

/* --------------------- NUMBEO API FUNCTIONS --------------------- */
async function fetchNumbeoCostOfLiving(cityString) {
  try {
    const url = `https://www.numbeo.com/api/cost_of_living?api_key=${NUMBEO_API_KEY}&query=${encodeURIComponent(cityString)}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('Error fetching Numbeo cost of living data:', error);
  }
}

async function fetchNumbeoPropertyPrices(cityString) {
  try {
    const url = `https://www.numbeo.com/api/property_prices?api_key=${NUMBEO_API_KEY}&query=${encodeURIComponent(cityString)}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('Error fetching Numbeo property prices data:', error);
  }
}

async function fetchNumbeoQualityOfLife(cityString) {
  try {
    const url = `https://www.numbeo.com/api/quality_of_life?api_key=${NUMBEO_API_KEY}&query=${encodeURIComponent(cityString)}`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('Error fetching Numbeo quality of life data:', error);
  }
}

function formatNumbeoData(data) {
  if (!data) return 'Data unavailable.';
  if (data.error_message) return data.error_message;
  return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

async function updateNumbeoData() {
  if (!selectedOriginCity || !selectedDestinationCity) return;
  
  const costOrigin = await fetchNumbeoCostOfLiving(selectedOriginCity);
  const costDest = await fetchNumbeoCostOfLiving(selectedDestinationCity);
  document.getElementById('numbeoCostOfLivingOrigin').innerHTML = formatNumbeoData(costOrigin);
  document.getElementById('numbeoCostOfLivingDest').innerHTML = formatNumbeoData(costDest);
  
  const propOrigin = await fetchNumbeoPropertyPrices(selectedOriginCity);
  const propDest = await fetchNumbeoPropertyPrices(selectedDestinationCity);
  document.getElementById('numbeoPropertyPricesOrigin').innerHTML = formatNumbeoData(propOrigin);
  document.getElementById('numbeoPropertyPricesDest').innerHTML = formatNumbeoData(propDest);
  
  const qolOrigin = await fetchNumbeoQualityOfLife(selectedOriginCity);
  const qolDest = await fetchNumbeoQualityOfLife(selectedDestinationCity);
  document.getElementById('numbeoQualityOfLifeOrigin').innerHTML = formatNumbeoData(qolOrigin);
  document.getElementById('numbeoQualityOfLifeDest').innerHTML = formatNumbeoData(qolDest);
}

/* --------------------- PARSER FOR NUMBEO COST DATA --------------------- */
function parseNumbeoCostData(costJson) {
  let rent = 0, groceries = 0, dining = 0, gas = 0, utilities = 0, taxes = 0;
  if (!costJson || !costJson.prices) return { rent, groceries, dining, gas, utilities, taxes };
  
  const items = costJson.prices;
  
  // Rent: "Apartment (1 bedroom) in City Centre"
  const rentItem = items.find(i => i.item_name === "Apartment (1 bedroom) in City Centre");
  if (rentItem && rentItem.average_price) rent = rentItem.average_price;
  
  // Utilities: "Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment"
  const utilitiesItem = items.find(i => i.item_name.includes("Basic (Electricity, Heating, Cooling, Water, Garbage)"));
  if (utilitiesItem && utilitiesItem.average_price) utilities = utilitiesItem.average_price;
  
  // Groceries: Approximate using "Milk (regular), (1 liter)" * 30
  const milkItem = items.find(i => i.item_name === "Milk (regular), (1 liter)");
  if (milkItem && milkItem.average_price) groceries += milkItem.average_price * 30;
  
  // Dining: "Meal, Inexpensive Restaurant" * 4
  const mealItem = items.find(i => i.item_name === "Meal, Inexpensive Restaurant");
  if (mealItem && mealItem.average_price) dining = mealItem.average_price * 4;
  
  // Gas: "Gasoline (1 liter)" * 50
  const gasItem = items.find(i => i.item_name === "Gasoline (1 liter)");
  if (gasItem && gasItem.average_price) gas = gasItem.average_price * 50;
  
  // Taxes: Not provided directly, so remains 0.
  return { rent, groceries, dining, gas, utilities, taxes };
}

/* --------------------- PARSER FOR NUMBEO PROPERTY PRICES --------------------- */
function parseNumbeoPropertyPrices(propJson) {
  if (!propJson || !propJson.prices) return 0;
  const aptItem = propJson.prices.find(item => item.item_name === "Apartment (1 bedroom) in City Centre");
  return aptItem && aptItem.average_price ? aptItem.average_price : 0;
}

/* --------------------- REAL BAR CHART WITH NUMBEO COST DATA --------------------- */
async function updateCostChartWithNumbeo(originKey, destKey) {
  const originCOL = await fetchNumbeoCostOfLiving(originKey);
  const destCOL = await fetchNumbeoCostOfLiving(destKey);
  
  const originParsed = parseNumbeoCostData(originCOL);
  const destParsed = parseNumbeoCostData(destCOL);
  
  const originTotal = originParsed.rent + originParsed.groceries + originParsed.dining + originParsed.gas + originParsed.utilities + originParsed.taxes;
  const destTotal = destParsed.rent + destParsed.groceries + destParsed.dining + destParsed.gas + destParsed.utilities + destParsed.taxes;
  
  const ctx = document.getElementById('costChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Rent', 'Groceries', 'Dining', 'Gas', 'Utilities', 'Taxes', 'Total'],
      datasets: [
        {
          label: originKey,
          data: [
            originParsed.rent,
            originParsed.groceries,
            originParsed.dining,
            originParsed.gas,
            originParsed.utilities,
            originParsed.taxes,
            originTotal
          ],
          backgroundColor: 'rgba(0,116,228,0.6)'
        },
        {
          label: destKey,
          data: [
            destParsed.rent,
            destParsed.groceries,
            destParsed.dining,
            destParsed.gas,
            destParsed.utilities,
            destParsed.taxes,
            destTotal
          ],
          backgroundColor: 'rgba(255,99,132,0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Cost of Living Comparison (Real Numbeo Data)' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* --------------------- HOUSING PRICES CHART --------------------- */
async function updateHousingPricesChart(originKey, destKey) {
  const originProp = await fetchNumbeoPropertyPrices(originKey);
  const destProp = await fetchNumbeoPropertyPrices(destKey);
  
  const originPrice = parseNumbeoPropertyPrices(originProp);
  const destPrice = parseNumbeoPropertyPrices(destProp);
  
  const ctx = document.getElementById('housingPricesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Apartment (1 bedroom) in City Centre'],
      datasets: [
        {
          label: originKey,
          data: [originPrice],
          backgroundColor: 'rgba(0,116,228,0.6)'
        },
        {
          label: destKey,
          data: [destPrice],
          backgroundColor: 'rgba(255,99,132,0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Housing Prices Comparison' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* --------------------- GOOGLE MAPS WITH CUSTOM MARKER --------------------- */
function initMap(cityKey) {
  let centerCoords = { lat: 39.8283, lng: -98.5795 }; // default: center of US
  if (cityKey.includes("Austin")) {
    centerCoords = { lat: 30.2672, lng: -97.7431 };
  } else if (cityKey.includes("Scottsdale")) {
    centerCoords = { lat: 33.4942, lng: -111.9261 };
  }
  
  const map = new google.maps.Map(document.getElementById('mapContainer'), {
    center: centerCoords,
    zoom: 12
  });
  
  // Marker for destination.
  new google.maps.Marker({
    position: centerCoords,
    map: map,
    title: cityKey
  });
  
  // Custom marker for Realtor.com's address (house emoji).
  // Replace these coordinates with Realtor.com's actual location.
  const realtorCoords = { lat: 40.7291, lng: -74.0007 };
  new google.maps.Marker({
    position: realtorCoords,
    map: map,
    title: "Realtor.com Headquarters",
    label: {
      text: "🏠",
      color: "red",
      fontSize: "24px"
    }
  });
}

/* --------------------- HOUSING & NEIGHBORHOODS (Minimal) --------------------- */
async function fetchHousingData(cityKey) {
  return { medianPrice: 500000, marketTrend: 'Stable', daysOnMarket: 45 };
}

async function updateHousingInfo(cityKey) {
  const data = await fetchHousingData(cityKey);
  const housingDiv = document.getElementById('housingInfo');
  if (!data) {
    housingDiv.innerHTML = `<p>No real-time data available for ${cityKey}.</p>`;
  } else {
    housingDiv.innerHTML = `
      <p>Median Home Price: $${data.medianPrice}</p>
      <p>Market Trend: ${data.marketTrend}</p>
      <p>Days on Market: ${data.daysOnMarket}</p>
    `;
  }
}

function updateNeighborhoods(cityKey) {
  const neighborhoodsDiv = document.getElementById('neighborhoods');
  let recommendations = '';
  if (cityKey.includes("Austin")) {
    recommendations = `
      <div class="neighborhood-card">
        <h3>Downtown Austin</h3>
        <p>Great for young professionals, vibrant nightlife, and tech opportunities.</p>
      </div>
      <div class="neighborhood-card">
        <h3>South Congress (SoCo)</h3>
        <p>Eclectic vibe with plenty of dining and boutique shopping options.</p>
      </div>
    `;
  } else if (cityKey.includes("Scottsdale")) {
    recommendations = `
      <div class="neighborhood-card">
        <h3>Old Town Scottsdale</h3>
        <p>Lively area with excellent dining, nightlife, and a rich arts scene.</p>
      </div>
      <div class="neighborhood-card">
        <h3>North Scottsdale</h3>
        <p>Upscale neighborhoods with golf courses and top-rated schools.</p>
      </div>
    `;
  } else {
    recommendations = `<p>Please select a city to see neighborhood suggestions.</p>`;
  }
  neighborhoodsDiv.innerHTML = recommendations;
}

/* --------------------- CAROUSEL FUNCTIONS --------------------- */
function updateCarousel(cityKey) {
  currentCarouselIndex = 0;
  const carouselImage = document.getElementById('carouselImage');
  if (carouselImages[cityKey]) {
    carouselImage.src = carouselImages[cityKey][currentCarouselIndex];
  } else {
    carouselImage.src = 'https://via.placeholder.com/200x200?text=Select+a+Destination';
  }
}

function changeCarousel(direction) {
  const images = carouselImages[selectedDestinationCity];
  if (images && images.length) {
    currentCarouselIndex = (currentCarouselIndex + direction + images.length) % images.length;
    document.getElementById('carouselImage').src = images[currentCarouselIndex];
  }
}



