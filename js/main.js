// Replace these with your actual API keys:
const NUMBEO_API_KEY = 'MY_NUMBEO_API_KEY';
const GOOGLE_MAPS_API_KEY = 'MY_GOOGLE_MAPS_API_KEY';

// Global variables for form data and carousel
let selectedOriginCity = '';
let selectedDestinationCity = '';
let currentHomeSaved = false;
let desiredHomeSaved = false;

// Carousel images per city
const carouselImages = {
  'Austin': [
    'assets/images/austin-carousel1.jpg',
    'assets/images/austin-carousel2.jpg'
  ],
  'Scottsdale': [
    'assets/images/scottsdale-carousel1.jpg',
    'assets/images/scottsdale-carousel2.jpg'
  ]
};
let currentCarouselIndex = 0;

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  // Toggle Other City field
  document.getElementById('originCity').addEventListener('change', function() {
    document.getElementById('otherCityContainer').style.display = this.value === 'Other' ? 'block' : 'none';
  });

  // Save home info buttons (assumes buttons with these IDs exist in your original forms)
  if(document.getElementById('saveCurrentHomeBtn')) {
    document.getElementById('saveCurrentHomeBtn').addEventListener('click', () => {
      currentHomeSaved = true;
      alert('Current home details saved.');
      maybeEnableCompare();
    });
  }
  if(document.getElementById('saveDesiredHomeBtn')) {
    document.getElementById('saveDesiredHomeBtn').addEventListener('click', () => {
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
  document.getElementById('moveForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    selectedOriginCity = document.getElementById('originCity').value;
    if (selectedOriginCity === 'Other') {
      const customCity = document.getElementById('otherCity').value.trim();
      if (customCity) { selectedOriginCity = customCity; }
    }
    selectedDestinationCity = document.getElementById('destinationCity').value;
    updateCostChart(selectedOriginCity, selectedDestinationCity);
    updateHousingInfo(selectedDestinationCity);
    initMap(selectedDestinationCity);
    updateNeighborhoods(selectedDestinationCity);
    updateCarousel(selectedDestinationCity);
    document.getElementById('livingSituation').scrollIntoView({ behavior: 'smooth' });
  });

  // Carousel next/prev buttons
  document.getElementById('prevBtn').addEventListener('click', () => changeCarousel(-1));
  document.getElementById('nextBtn').addEventListener('click', () => changeCarousel(1));
});

// Fetch Cost Data (dummy example)
async function fetchCostData(origin, destination) {
  try {
    const originData = { dining: 350, rent: 1800, groceries: 500, gas: 200, utilities: 250, taxes: 300 };
    const destData = { dining: 300, rent: 1400, groceries: 450, gas: 180, utilities: 220, taxes: 200 };
    return { origin: originData, destination: destData };
  } catch (error) {
    console.error('Error fetching cost data:', error);
  }
}

// Update Cost Table
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

// Update Cost Chart
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
        { label: origin, data: [originCosts.dining, originCosts.rent, originCosts.groceries, originCosts.gas, originCosts.utilities, originCosts.taxes, originTotal], backgroundColor: 'rgba(0,116,228,0.6)' },
        { label: destination, data: [destCosts.dining, destCosts.rent, destCosts.groceries, destCosts.gas, destCosts.utilities, destCosts.taxes, destTotal], backgroundColor: 'rgba(255,99,132,0.6)' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Cost of Living Comparison' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Fetch Housing Data (dummy example)
async function fetchHousingData(city) {
  try {
    return { medianPrice: 500000, marketTrend: 'Stable', daysOnMarket: 45 };
  } catch (error) {
    console.error('Error fetching housing data:', error);
  }
}

// Update Housing Market Info
async function updateHousingInfo(city) {
  const data = await fetchHousingData(city);
  const housingDiv = document.getElementById('housingInfo');
  if (!data) {
    housingDiv.innerHTML = `<p>No real-time data available for ${city}.</p>`;
  } else {
    housingDiv.innerHTML = `<p>Median Home Price: $${data.medianPrice}</p>
      <p>Market Trend: ${data.marketTrend}</p>
      <p>Days on Market: ${data.daysOnMarket}</p>`;
  }
}

// Initialize Google Map using your provided key
function initMap(city) {
  let mapSrc = '';
  if (city === 'Austin') {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Austin,TX`;
  } else if (city === 'Scottsdale') {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Scottsdale,AZ`;
  } else {
    mapSrc = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=39.8283,-98.5795&zoom=4`;
  }
  document.getElementById('mapContainer').innerHTML = `<iframe width="100%" height="100%" frameborder="0" style="border:0" src="${mapSrc}" allowfullscreen></iframe>`;
}

// Update Neighborhood Recommendations
function updateNeighborhoods(city) {
  const neighborhoodsDiv = document.getElementById('neighborhoods');
  let recommendations = '';
  if (city === 'Austin') {
    recommendations = `<div class="neighborhood-card">
        <h3>Downtown Austin</h3>
        <p>Great for young professionals, vibrant nightlife, and tech opportunities.</p>
      </div>
      <div class="neighborhood-card">
        <h3>South Congress (SoCo)</h3>
        <p>Eclectic vibe with plenty of dining and boutique shopping options.</p>
      </div>`;
  } else if (city === 'Scottsdale') {
    recommendations = `<div class="neighborhood-card">
        <h3>Old Town Scottsdale</h3>
        <p>Lively area with excellent dining, nightlife, and a rich arts scene.</p>
      </div>
      <div class="neighborhood-card">
        <h3>North Scottsdale</h3>
        <p>Upscale neighborhoods with golf courses and top-rated schools.</p>
      </div>`;
  } else {
    recommendations = `<p>Please select a city to see neighborhood suggestions.</p>`;
  }
  neighborhoodsDiv.innerHTML = recommendations;
}

// Carousel functions
function updateCarousel(city) {
  currentCarouselIndex = 0;
  if (carouselImages[city]) {
    document.getElementById('carouselImage').src = carouselImages[city][currentCarouselIndex];
  } else {
    // Default image if city not recognized
    document.getElementById('carouselImage').src = 'https://via.placeholder.com/800x400?text=Select+a+Destination';
  }
}
function changeCarousel(direction) {
  const images = carouselImages[selectedDestinationCity];
  if (images) {
    currentCarouselIndex = (currentCarouselIndex + direction + images.length) % images.length;
    document.getElementById('carouselImage').src = images[currentCarouselIndex];
  }
}
