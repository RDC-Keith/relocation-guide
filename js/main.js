/*************************************************************
 * main.js - Relocation Guide (REAL Numbeo data in the chart)
 *
 * This file:
 * 1) Uses Numbeo's cost_of_living, property_prices, and quality_of_life
 *    via the query= parameter. 
 * 2) Builds a real bar chart with data from parseNumbeoCostData.
 * 3) Displays property prices & quality of life data in the “Numbeo Data” section.
 * 4) Retains existing logic for the carousel, map, neighborhoods, etc.
 *************************************************************/

// Replace these with your actual API keys:
const NUMBEO_API_KEY = 'ydwk8vb0prixpe';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXm1ezEjfsjdDB-f26OAztdiRldLIM8X4';

// Optional mapping if your dropdown uses short keys like "Austin"
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
let currentHomeSaved = false;
let desiredHomeSaved = false;
let currentCarouselIndex = 0;

/**
 * Carousel images for each city (Austin/Scottsdale).
 * Make sure these files exist in assets/images/.
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
  // Show/hide "Other" city input
  const originCitySelect = document.getElementById('originCity');
  const otherCityContainer = document.getElementById('otherCityContainer');
  originCitySelect.addEventListener('change', function() {
    otherCityContainer.style.display = (this.value === 'Other') ? 'block' : 'none';
  });

  // Save home info (if these buttons exist in your forms)
  const saveCurrentBtn = document.getElementById('saveCurrentHomeBtn');
  const saveDesiredBtn = document.getElementById('saveDesiredHomeBtn');
  if (saveCurrentBtn) {
    saveCurrentBtn.addEventListener('click', () => {
      currentHomeSaved = true;
      alert('Current home details saved.');
      maybeEnableCompare();
    });
  }
  if (saveDesiredBtn) {
    saveDesiredBtn.addEventListener('click', () => {
      desiredHomeSaved = true;
      alert('Desired home details saved.');
      maybeEnableCompare();
    });
  }

  function maybeEnableCompare() {
    if (currentHomeSaved && desiredHomeSaved) {
      document.getElementById('compareBtn').style.display = 'inline-block';
    }
  }

  // Handle form submission
  const moveForm = document.getElementById('moveForm');
  moveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originSelectValue = originCitySelect.value;
    if (originSelectValue === 'Other') {
      const customCity = document.getElementById('otherCity').value.trim();
      selectedOriginCity = customCity || 'Unknown City';
    } else {
      selectedOriginCity = originSelectValue;
    }

    const destinationSelectValue = document.getElementById('destinationCity').value;
    selectedDestinationCity = destinationSelectValue;

    // Build the real bar chart from Numbeo data
    updateCostChartWithNumbeo(selectedOriginCity, selectedDestinationCity);

    // Also fetch & display property prices, quality of life, etc.
    updateNumbeoData();

    // Update carousel
    updateCarousel(selectedDestinationCity);

    // For your map, housing, neighborhoods, etc.:
    initMap(selectedDestinationCity);
    updateHousingInfo(selectedDestinationCity);
    updateNeighborhoods(selectedDestinationCity);

    // Scroll to the next section
    document.getElementById('livingSituation').scrollIntoView({ behavior: 'smooth' });
  });

  // Compare button for cost table (if you keep it)
  const compareBtn = document.getElementById('compareBtn');
  compareBtn.addEventListener('click', () => {
    document.getElementById('costTableContainer').style.display = 'block';
    // If you want to show the old table with dummy data, you can keep:
    // updateCostTable(selectedOriginCity, selectedDestinationCity);
    // Or remove it entirely if you no longer want dummy data.
  });

  // Carousel navigation
  document.getElementById('prevBtn').addEventListener('click', () => changeCarousel(-1));
  document.getElementById('nextBtn').addEventListener('click', () => changeCarousel(1));
});

/* --------------------- NUMBEO API (using query=) --------------------- */

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

/**
 * Summarizes certain items from Numbeo's cost_of_living response
 * into approximate monthly costs for rent, groceries, dining, gas, etc.
 */
function parseNumbeoCostData(costOfLivingJson) {
  let rent = 0;
  let groceries = 0;
  let dining = 0;
  let gas = 0;
  let utilities = 0;
  let taxes = 0; // If you want to define some logic for taxes

  if (!costOfLivingJson || !costOfLivingJson.prices) {
    return { rent, groceries, dining, gas, utilities, taxes };
  }
  const items = costOfLivingJson.prices;

  // Example: Rent = “Apartment (1 bedroom) in City Centre”
  const rentItem = items.find(i => i.item_name === "Apartment (1 bedroom) in City Centre");
  if (rentItem && rentItem.average_price) {
    rent = rentItem.average_price; 
  }

  // Utilities = “Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment”
  const utilitiesItem = items.find(i => i.item_name.includes("Basic (Electricity, Heating, Cooling, Water, Garbage)"));
  if (utilitiesItem && utilitiesItem.average_price) {
    utilities = utilitiesItem.average_price;
  }

  // Groceries example: just a small approximation
  // e.g. “Milk (regular), (1 liter)” * 30
  const milkItem = items.find(i => i.item_name === "Milk (regular), (1 liter)");
  if (milkItem && milkItem.average_price) {
    groceries += milkItem.average_price * 30;
  }

  // Dining: “Meal, Inexpensive Restaurant” * 4 (4 times a month)
  const mealItem = items.find(i => i.item_name === "Meal, Inexpensive Restaurant");
  if (mealItem && mealItem.average_price) {
    dining = mealItem.average_price * 4;
  }

  // Gas: “Gasoline (1 liter)” * 50 liters
  const gasItem = items.find(i => i.item_name === "Gasoline (1 liter)");
  if (gasItem && gasItem.average_price) {
    gas = gasItem.average_price * 50;
  }

  // Taxes: no direct data in cost_of_living, so let's keep it at 0 or define your own logic

  return { rent, groceries, dining, gas, utilities, taxes };
}

/**
 * Formats the entire JSON for display in the "Numbeo Data" text blocks
 */
function formatNumbeoData(data) {
  if (!data) return 'Data unavailable.';
  if (data.error_message) return data.error_message;
  return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

/**
 * Calls all three Numbeo endpoints (cost_of_living, property_prices, quality_of_life)
 * and displays them in the placeholders.
 */
async function updateNumbeoData() {
  if (!selectedOriginCity || !selectedDestinationCity) return;

  const originString = cityMappings[selectedOriginCity] || selectedOriginCity;
  const destString = cityMappings[selectedDestinationCity] || selectedDestinationCity;

  // Cost of Living
  const costOrigin = await fetchNumbeoCostOfLiving(originString);
  const costDest = await fetchNumbeoCostOfLiving(destString);
  document.getElementById('numbeoCostOfLivingOrigin').innerHTML = formatNumbeoData(costOrigin);
  document.getElementById('numbeoCostOfLivingDest').innerHTML = formatNumbeoData(costDest);

  // Property Prices
  const propOrigin = await fetchNumbeoPropertyPrices(originString);
  const propDest = await fetchNumbeoPropertyPrices(destString);
  document.getElementById('numbeoPropertyPricesOrigin').innerHTML = formatNumbeoData(propOrigin);
  document.getElementById('numbeoPropertyPricesDest').innerHTML = formatNumbeoData(propDest);

  // Quality of Life
  const qolOrigin = await fetchNumbeoQualityOfLife(originString);
  const qolDest = await fetchNumbeoQualityOfLife(destString);
  document.getElementById('numbeoQualityOfLifeOrigin').innerHTML = formatNumbeoData(qolOrigin);
  document.getElementById('numbeoQualityOfLifeDest').innerHTML = formatNumbeoData(qolDest);
}

/* --------------------- REAL BAR CHART WITH NUMBEO DATA --------------------- */

/**
 * This function fetches cost_of_living for both origin & des





