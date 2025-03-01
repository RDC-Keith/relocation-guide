/*************************************************************
 * main.js
 * Relocation Guide - Austin & Scottsdale
 * 
 * - Insert your real API keys below.
 * - Ensure the images in assets/images/ match the filenames here.
 *************************************************************/

// Replace these placeholders with your real API keys
const NUMBEO_API_KEY = 'ydwk8vb0prixpe';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXm1ezEjfsjdDB-f26OAztdiRldLIM8X4';

// Global variables
let selectedOriginCity = '';
let selectedDestinationCity = '';
let currentHomeSaved = false;
let desiredHomeSaved = false;
let currentCarouselIndex = 0;

/**
 * Carousel images for each city.
 * Make sure these filenames exist in your assets/images/ folder.
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
  // If your 'saveCurrentHomeBtn' and 'saveDesiredHomeBtn' exist in the forms, set up their listeners
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

  // Toggle 'Other City' input if user selects 'Other'
  const originCitySelect = document.getElementById('originCity');
  const otherCityContainer = document.getElementById('otherCityContainer');
  originCitySelect.addEventListener('change', function() {
    otherCityContainer.style.display = (this.value === 'Other') ? 'block' : 'none';
  });

  // Form submission
  const moveForm = document.getElementById('moveForm');
  moveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    selectedOriginCity = originCitySelect.value;
    if (selectedOriginCity === 'Other') {
      const customCity = document.getElementById('otherCity').value.trim();
      if (customCity) {
        selectedOriginCity = customCity;
      }
    }
    selectedDestinationCity = document.getElementById('destinationCity').value;

    // Update UI
    updateCostChart(selectedOriginCity, selectedDestinationCity);
    updateHousingInfo(selectedDestinationCity);
    initMap(selectedDestinationCity);
    updateNeighborhoods(selectedDestinationCity);
    updateCarousel(selectedDestinationCity);

    // Smooth scroll to the next section
    document.getElementById('livingSituation').scrollIntoView({ behavior: 'smooth' });
  });

  // Compare button (after forms are saved)
  const compareBtn = document.getElementById('compareBtn');
  compareBtn.addEventListener('click', () => {
    document.getElementById('costTableContainer').style.display = 'block';
    updateCostTable(selectedOriginCity, selectedDestinationCity);
  });

  // Carousel next/prev
  document.getElementById('prevBtn').addEventListener('click', () => changeCarousel(-1));
  document.getElementById('nextBtn').addEventListener('click', () => changeCarousel(1));
});

/**
 * Enable the 'Compare' button only if both current & desired home forms are saved.
 */
function maybeEnableCompare() {
  if (currentHomeSaved && desiredHomeSaved) {
    document.getElementById('compareBtn').style.display = 'inline-block';
  }
}

/**
 * DUMMY: Fetch cost-of-living data (replace with real Numbeo or other API calls if needed)
 */
async function fetchCostData(origin, destination) {
  try {
    // Hardcoded example data
    const originData = { dining: 350, rent: 1800, groceries: 500, gas: 200, utilities: 250, taxes: 300 };
    const destData = { dining: 300, rent: 1400, groceries: 450, gas: 180, utilities: 220, taxes: 200 };
    return { origin: originData, destination: destData };
  } catch (error) {
    console.error('Error fetching cost data:', error);
  }
}

/**
 * Update the cost table
 */
async function updateCostTable(origin, destination) {
  const costData = await fetchCostData(origin, destination);
  if (!costData) return;

  document.getElementById('originCityLabel').innerText = origin || 'Origin';
  document.getElementById('destinationCityLabel').innerText = destination || 'Destination';

  document.getElementById('originDining').innerText = `$${costData.origin.dining}`;
  document.getElementById('destDining').innerText = `$${costData.destination.dining}`;
  document.getElementById('originRent').innerText = `$${costData.origin.rent}`;
  document.getElementById('destRent').innerText = `$${costData.destination.rent}`;
  document.getElementById('originGroceries').innerText = `$${costData.origin.groceries}`;
  document.getElementById('destGroceries').innerText = `$${costData.destination.groceries}`;
  document.getElementById('originGas').innerText = `$${costData.origin.gas}`;
  document.getElementById('destGas').innerText = `$${costData.destination.gas}`;
  document.getElementById('originUtilities').innerText = `$${costData.origin.utilities}`;
  document.getElementById('destUtilities').innerText = `$${costData.destination.utilities}`;
  document.getElementById('originTaxes').innerText = `$${costData.origin.taxes}`;
  document.getElementById('destTaxes').innerText = `$${costData.destination.taxes}`;

  const originTotal = Object.values(costData.origin).reduce((a, b) => a + b, 0);
  const destTotal = Object.values(costData.destination).reduce((a, b) => a + b, 0);
  document.getElementById('originTotal').innerText = `$${originTotal}`;
  document.getElementById('destTotal').innerText = `$${destTotal}`;
}

/**
 * Update the cost comparison bar chart
 */
async function updateCostChart(origin, destination) {
  const costData = await fetchCostData(origin, destination);
  const originCosts = costData?.origin || { dining: 350, rent: 1800, groceries: 500, gas: 200, utilities: 250, taxes: 300 };
  const destCosts = costData?.destination || { dining: 300, rent: 1400, groceries: 450, gas: 180, utilities: 220, taxes: 200 };

  const originTotal = Object.values(originCosts).reduce((a, b) => a + b, 0);
  const destTotal = Object.values(destCosts).reduce((a, b) => a + b, 0);

  const ctx = document.getElementById('costChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Dining', 'Rent', 'Groceries', 'Gas', 'Utilities', 'State Taxes', 'Total'],
      datasets: [
        {
          label: origin,
          data: [
            originCosts.dining,
            originCosts.rent,
            originCosts.groceries,
            originCosts.gas,
            originCosts.utilities,
            originCosts.taxes,
            originTotal
          ],
          backgroundColor: 'rgba(0,116,228,0.6)'
        },
        {
          label: destination,
          data: [
            destCosts.dining,
            destCosts.rent,
            destCosts.groceries,
            destCosts.gas,
            destCosts.utilities,
            destCosts.taxes,
            destTotal
          ],
          backgroundColor: 'rgba(255,99,132,0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Cost of Living Comparison'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * DUMMY: Fetch housing data (replace with real calls if you have an API)
 */
async function fetchHousingData(city) {
  try {
    // Example data
    return { medianPrice: 500000, marketTrend: 'Stable', daysOnMarket: 45 };
  } catch (error) {
    console.error('Error fetching housing data:', error);
  }
}

/**
 * Update the housing market info
 */
async function updateHousingInfo(city) {
  const data = await fetchHousingData(city);
  const housingDiv = document.getElementById('housingInfo');
  if (!data) {
    housingDiv.innerHTML = `<p>No real-time data available for ${city}.</p>`;
  } else {
    housingDiv.innerHTML = `
      <p>Median Home Price: $${data.medianPrice}</p>
      <p>Market Trend: ${data.marketTrend}</p>
      <p>Days on Market: ${data.daysOnMarket}</p>
    `;
  }
}

/**
 * Initialize the Google Map with your API key
 */
function initMap(city) {
  let mapSrc = '';
  if (city === 'Austin') {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Austin,TX`;
  } else if (city === 'Scottsdale') {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Scottsdale,AZ`;
  } else {
    // fallback view of the U.S.
    mapSrc = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=39.8283,-98.5795&zoom=4`;
  }
  document.getElementById('mapContainer').innerHTML = `
    <iframe
      width="100%"
      height="100%"
      frameborder="0"
      style="border:0"
      src="${mapSrc}"
      allowfullscreen
    ></iframe>
  `;
}

/**
 * Update the Neighborhood Recommendations
 */
function updateNeighborhoods(city) {
  const neighborhoodsDiv = document.getElementById('neighborhoods');
  let recommendations = '';
  if (city === 'Austin') {
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
  } else if (city === 'Scottsdale') {
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

/**
 * Update the Carousel images based on the chosen city
 */
function updateCarousel(city) {
  currentCarouselIndex = 0;
  const carouselImage = document.getElementById('carouselImage');
  if (carouselImages[city]) {
    carouselImage.src = carouselImages[city][currentCarouselIndex];
  } else {
    carouselImage.src = 'https://via.placeholder.com/800x400?text=Select+a+Destination';
  }
}

/**
 * Change Carousel image (Next or Prev)
 */
function changeCarousel(direction) {
  const images = carouselImages[selectedDestinationCity];
  if (images && images.length) {
    currentCarouselIndex = (currentCarouselIndex + direction + images.length) % images.length;
    document.getElementById('carouselImage').src = images[currentCarouselIndex];
  }
}
