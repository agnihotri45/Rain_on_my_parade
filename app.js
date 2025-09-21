// DOM Elements
const locationInput = document.getElementById('location');
const dateInput = document.getElementById('date');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const resultLocation = document.getElementById('result-location');
const resultDate = document.getElementById('result-date');
const weatherIcon = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const precipitationEl = document.getElementById('precipitation');
const windEl = document.getElementById('wind');
const comfortEl = document.getElementById('comfort');
const tempStatusEl = document.getElementById('temp-status');
const precipStatusEl = document.getElementById('precip-status');
const windStatusEl = document.getElementById('wind-status');
const comfortStatusEl = document.getElementById('comfort-status');
const recommendationText = document.getElementById('recommendation-text');

// Set default date to today
const today = new Date();
dateInput.value = today.toISOString().split('T')[0];
dateInput.min = today.toISOString().split('T')[0];

// Maximum date (1 year from now for historical weather patterns)
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() + 1);
dateInput.max = maxDate.toISOString().split('T')[0];

// Add event listeners
searchBtn.addEventListener('click', handleSearch);

// Add test locations dropdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addTestLocationsDropdown();
});

// Function to add test locations dropdown
function addTestLocationsDropdown() {
    const testLocations = [
        { name: 'New York, USA', coords: { lat: 40.7128, lon: -74.0060 } },
        { name: 'London, UK', coords: { lat: 51.5074, lon: -0.1278 } },
        { name: 'Tokyo, Japan', coords: { lat: 35.6762, lon: 139.6503 } },
        { name: 'Sydney, Australia', coords: { lat: -33.8688, lon: 151.2093 } },
        { name: 'Rio de Janeiro, Brazil', coords: { lat: -22.9068, lon: -43.1729 } },
        { name: 'Cape Town, South Africa', coords: { lat: -33.9249, lon: 18.4241 } },
        { name: 'Moscow, Russia', coords: { lat: 55.7558, lon: 37.6173 } },
        { name: 'Dubai, UAE', coords: { lat: 25.2048, lon: 55.2708 } }
    ];
    
    const testContainer = document.createElement('div');
    testContainer.className = 'test-container';
    
    // Create location categories with icons
    const locationsByRegion = {
        'North America': [testLocations[0]], // New York
        'Europe': [testLocations[1], testLocations[6]], // London, Moscow
        'Asia': [testLocations[2], testLocations[7]], // Tokyo, Dubai
        'Oceania': [testLocations[3]], // Sydney
        'South America': [testLocations[4]], // Rio
        'Africa': [testLocations[5]] // Cape Town
    };
    
    // Icons for regions
    const regionIcons = {
        'North America': '🌎',
        'Europe': '🌍',
        'Asia': '🌏',
        'Oceania': '🏝️',
        'South America': '🌎',
        'Africa': '🌍'
    };
    
    // Create HTML for grouped options
    let optionsHTML = '<option value="">Select a test location</option>';
    
    for (const [region, locations] of Object.entries(locationsByRegion)) {
        optionsHTML += `<optgroup label="${regionIcons[region]} ${region}">`;
        locations.forEach(loc => {
            optionsHTML += `<option value="${loc.name}" data-lat="${loc.coords.lat}" data-lon="${loc.coords.lon}">${loc.name}</option>`;
        });
        optionsHTML += '</optgroup>';
    }
    
    testContainer.innerHTML = `
        <div class="test-panel">
            <h3>Test Locations</h3>
            <div class="test-locations-wrapper">
                <select id="test-locations">
                    ${optionsHTML}
                </select>
            </div>
            <div class="test-dates">
                <button id="test-today" class="btn btn-small">📅 Today</button>
                <button id="test-tomorrow" class="btn btn-small">🔜 Tomorrow</button>
                <button id="test-weekend" class="btn btn-small">🏖️ Weekend</button>
                <button id="test-next-week" class="btn btn-small">📆 Next Week</button>
            </div>
        </div>
    `;
    
    // Add the test container to the main container
    const mainContainer = document.querySelector('.container');
    const weatherCard = document.querySelector('.weather-card');
    mainContainer.insertBefore(testContainer, weatherCard);
    
    // Add event listeners for test functionality
    document.getElementById('test-locations').addEventListener('change', (e) => {
        const selected = e.target.options[e.target.selectedIndex];
        if (selected.value) {
            locationInput.value = selected.value;
            // If coordinates are available, store them for direct use
            if (selected.dataset.lat && selected.dataset.lon) {
                locationInput.dataset.lat = selected.dataset.lat;
                locationInput.dataset.lon = selected.dataset.lon;
            }
            handleSearch();
        }
    });
    
    // Date test buttons
    document.getElementById('test-today').addEventListener('click', () => {
        const today = new Date();
        setTestDate(today);
    });
    
    document.getElementById('test-tomorrow').addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTestDate(tomorrow);
    });
    
    document.getElementById('test-weekend').addEventListener('click', () => {
        const today = new Date();
        const daysUntilWeekend = (6 - today.getDay()) % 7; // Saturday is 6
        const weekend = new Date();
        weekend.setDate(today.getDate() + daysUntilWeekend);
        setTestDate(weekend);
    });
    
    document.getElementById('test-next-week').addEventListener('click', () => {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        setTestDate(nextWeek);
    });
}

// Helper function to set test date and submit form
function setTestDate(date) {
    const formattedDate = date.toISOString().split('T')[0];
    dateInput.value = formattedDate;
    handleSearch();
}

// OpenWeatherMap API integration
async function fetchWeatherData(location, date) {
    try {
        // OpenWeatherMap API key - in a production app, this would be stored securely
        const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
        
        // First, get coordinates for the location
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData || geoData.length === 0) {
            throw new Error('Location not found');
        }
        
        const { lat, lon } = geoData[0];
        
        // Get current weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData) {
            throw new Error('Weather data not available');
        }
        
        // Process the weather data
        const current = weatherData.current;
        const hourly = weatherData.hourly.slice(0, 24);
        
        // Map weather condition to our weather types
        const weatherConditionId = current.weather[0].id;
        let weatherType;
        
        if (weatherConditionId >= 200 && weatherConditionId < 300) {
            weatherType = 'stormy';
        } else if (weatherConditionId >= 300 && weatherConditionId < 600) {
            weatherType = 'rainy';
        } else if (weatherConditionId >= 600 && weatherConditionId < 700) {
            weatherType = 'snowy';
        } else if (weatherConditionId >= 700 && weatherConditionId < 800) {
            weatherType = 'foggy';
        } else if (weatherConditionId === 800) {
            weatherType = 'sunny';
        } else {
            weatherType = 'cloudy';
        }
        
        // Calculate precipitation chance from hourly data
        const precipitation = Math.round(hourly.reduce((sum, hour) => sum + (hour.pop || 0), 0) / hourly.length * 100);
        
        // Calculate comfort index (0-100)
        const temperature = current.temp;
        const wind = current.wind_speed * 3.6; // Convert m/s to km/h
        const humidity = current.humidity;
        
        const comfort = Math.max(0, Math.min(100, 100 - 
            (Math.abs(temperature - 22) * 3 + 
             precipitation * 0.5 + 
             wind * 0.8 +
             Math.abs(humidity - 50) * 0.5)));
        
        // Generate hourly forecast data for the chart
        const hourlyForecast = {
            hours: hourly.slice(0, 15).map((hour, index) => {
                const date = new Date(hour.dt * 1000);
                return `${date.getHours()}:00`;
            }),
            temps: hourly.slice(0, 15).map(hour => Math.round(hour.temp)),
            precip: hourly.slice(0, 15).map(hour => Math.round((hour.pop || 0) * 100)),
            winds: hourly.slice(0, 15).map(hour => Math.round(hour.wind_speed * 3.6)) // Convert m/s to km/h
        };
        
        return {
            location: geoData[0].name,
            date,
            weatherType,
            temperature: Math.round(temperature),
            precipitation,
            wind: Math.round(wind),
            comfort: Math.round(comfort),
            hourlyForecast
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // Fallback to mock data if API fails
        return fallbackMockWeatherData(location, date);
    }
}

// Fallback mock data in case the API fails
function fallbackMockWeatherData(location, date) {
    console.log('Using fallback mock data');
    
    // Generate random data based on location and date
    const seed = location.length + new Date(date).getDate();
    const random = (min, max) => Math.floor((Math.random() * (max - min + 1) + min) * (seed % 10) / 5);
    
    // Different weather patterns based on location first letter
    const firstChar = location.charAt(0).toLowerCase();
    let weatherType;
    
    if ('abcde'.includes(firstChar)) {
        weatherType = 'sunny';
    } else if ('fghij'.includes(firstChar)) {
        weatherType = 'cloudy';
    } else if ('klmno'.includes(firstChar)) {
        weatherType = 'rainy';
    } else if ('pqrst'.includes(firstChar)) {
        weatherType = 'stormy';
    } else {
        weatherType = 'windy';
    }
    
    // Generate data based on weather type
    let tempMin, tempMax, precipChance, windSpeed;
    
    switch (weatherType) {
        case 'sunny':
            tempMin = 25;
            tempMax = 35;
            precipChance = 10;
            windSpeed = 15;
            break;
        case 'cloudy':
            tempMin = 18;
            tempMax = 28;
            precipChance = 30;
            windSpeed = 20;
            break;
        case 'rainy':
            tempMin = 15;
            tempMax = 22;
            precipChance = 70;
            windSpeed = 25;
            break;
        case 'stormy':
            tempMin = 12;
            tempMax = 20;
            precipChance = 90;
            windSpeed = 40;
            break;
        case 'windy':
            tempMin = 16;
            tempMax = 26;
            precipChance = 20;
            windSpeed = 35;
            break;
        default:
            tempMin = 20;
            tempMax = 30;
            precipChance = 20;
            windSpeed = 15;
    }
    
    // Add some randomness
    const temperature = random(tempMin, tempMax);
    const precipitation = random(precipChance - 10, precipChance + 10);
    const wind = random(windSpeed - 5, windSpeed + 5);
    
    // Calculate comfort index (0-100)
    const comfort = Math.max(0, Math.min(100, 100 - 
        (Math.abs(temperature - 22) * 3 + 
         precipitation * 0.5 + 
         wind * 0.8)));
    
    return {
        location,
        date,
        weatherType,
        temperature,
        precipitation,
        wind,
        comfort,
        hourlyForecast: generateHourlyForecast(temperature, precipitation, wind, weatherType)
    };
}

// Generate mock hourly forecast data for the chart
function generateHourlyForecast(baseTemp, basePrec, baseWind, weatherType) {
    const hours = [];
    const temps = [];
    const precip = [];
    const winds = [];
    
    for (let i = 6; i <= 20; i++) {
        hours.push(`${i}:00`);
        
        // Temperature varies throughout the day
        let hourTemp = baseTemp;
        if (i < 10) hourTemp -= (10 - i);
        if (i > 16) hourTemp -= (i - 16);
        temps.push(hourTemp);
        
        // Precipitation chance varies
        let hourPrec = basePrec;
        if (weatherType === 'rainy' || weatherType === 'stormy') {
            // More likely to rain in the afternoon
            if (i >= 12 && i <= 16) hourPrec += 15;
        }
        precip.push(Math.min(100, Math.max(0, hourPrec)));
        
        // Wind varies slightly
        winds.push(baseWind + Math.floor(Math.random() * 10 - 5));
    }
    
    return { hours, temps, precip, winds };
}

// Handle search button click
async function handleSearch() {
    const location = locationInput.value.trim();
    const date = dateInput.value;
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    // Show loading state
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    searchBtn.disabled = true;
    
    try {
        // Fetch weather data
        const weatherData = await fetchWeatherData(location, date);
        
        // Display results
        displayResults(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    } finally {
        // Reset button
        searchBtn.innerHTML = 'Check Weather <i class="fas fa-search"></i>';
        searchBtn.disabled = false;
    }
}

// Display weather results
function displayResults(data) {
    // Show results container
    resultsContainer.classList.remove('hidden');
    
    // Update location and date
    resultLocation.textContent = data.location;
    resultDate.textContent = formatDate(data.date);
    
    // Update weather icon
    updateWeatherIcon(data.weatherType);
    
    // Update condition values
    temperatureEl.textContent = `${data.temperature}°C`;
    precipitationEl.textContent = `${data.precipitation}%`;
    windEl.textContent = `${data.wind} km/h`;
    comfortEl.textContent = `${data.comfort}/100`;
    
    // Update condition statuses
    updateConditionStatus(tempStatusEl, data.temperature, 
        { normal: [15, 25], warning: [10, 30], danger: [0, 35] });
    
    updateConditionStatus(precipStatusEl, data.precipitation, 
        { normal: [0, 30], warning: [30, 60], danger: [60, 100] });
    
    updateConditionStatus(windStatusEl, data.wind, 
        { normal: [0, 20], warning: [20, 40], danger: [40, 100] });
    
    updateConditionStatus(comfortStatusEl, data.comfort, 
        { normal: [70, 100], warning: [40, 70], danger: [0, 40] }, true);
    
    // Update recommendation
    updateRecommendation(data);
    
    // Create chart
    createWeatherChart(data.hourlyForecast);
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Update weather icon based on weather type
function updateWeatherIcon(weatherType) {
    let iconClass = 'fas ';
    
    switch (weatherType) {
        case 'sunny':
            iconClass += 'fa-sun text-warning';
            break;
        case 'cloudy':
            iconClass += 'fa-cloud text-secondary';
            break;
        case 'rainy':
            iconClass += 'fa-cloud-rain text-primary';
            break;
        case 'stormy':
            iconClass += 'fa-bolt text-warning';
            break;
        case 'windy':
            iconClass += 'fa-wind text-info';
            break;
        default:
            iconClass += 'fa-cloud';
    }
    
    weatherIcon.className = iconClass;
}

// Update condition status indicators
function updateConditionStatus(element, value, ranges, inverse = false) {
    let status;
    let text;
    
    if (inverse) {
        // For metrics where higher is better (like comfort)
        if (value >= ranges.normal[0]) {
            status = 'status-normal';
            text = 'Good';
        } else if (value >= ranges.warning[0]) {
            status = 'status-warning';
            text = 'Moderate';
        } else {
            status = 'status-danger';
            text = 'Poor';
        }
    } else {
        // For metrics where lower is better
        if (value <= ranges.normal[1]) {
            status = 'status-normal';
            text = 'Normal';
        } else if (value <= ranges.warning[1]) {
            status = 'status-warning';
            text = 'Caution';
        } else {
            status = 'status-danger';
            text = 'Extreme';
        }
    }
    
    element.className = `condition-status ${status}`;
    element.textContent = text;
}

// Update recommendation text
function updateRecommendation(data) {
    let recommendation = '';
    let eventSuitability = '';
    let preparationTips = '';
    
    // Temperature analysis
    if (data.temperature > 35) {
        recommendation += 'Extreme heat conditions expected. ';
        preparationTips += 'Bring plenty of water, sun protection, and plan for shade. ';
    } else if (data.temperature > 30) {
        recommendation += 'Very hot conditions expected. ';
        preparationTips += 'Stay hydrated and use sun protection. ';
    } else if (data.temperature > 25) {
        recommendation += 'Warm conditions expected. ';
        preparationTips += 'Light clothing and sun protection recommended. ';
    } else if (data.temperature < 5) {
        recommendation += 'Very cold conditions expected. ';
        preparationTips += 'Dress in warm layers and bring hot beverages. ';
    } else if (data.temperature < 10) {
        recommendation += 'Cold conditions expected. ';
        preparationTips += 'Bring warm clothing and consider heating options. ';
    } else if (data.temperature >= 15 && data.temperature <= 25) {
        recommendation += 'Pleasant temperature conditions expected. ';
    }
    
    // Precipitation analysis
    if (data.precipitation > 80) {
        recommendation += 'Very high chance of heavy rain. ';
        preparationTips += 'Waterproof gear essential. Consider indoor alternatives. ';
        eventSuitability += 'Outdoor activities strongly discouraged. ';
    } else if (data.precipitation > 60) {
        recommendation += 'High chance of rain. ';
        preparationTips += 'Bring umbrellas and waterproof gear. Have a backup indoor location. ';
        eventSuitability += 'Consider rescheduling weather-sensitive activities. ';
    } else if (data.precipitation > 40) {
        recommendation += 'Moderate chance of rain. ';
        preparationTips += 'Bring rain gear and prepare contingency plans. ';
    } else if (data.precipitation > 20) {
        recommendation += 'Slight chance of rain. ';
        preparationTips += 'Bring a light rain jacket just in case. ';
    } else {
        recommendation += 'Low chance of precipitation. ';
        eventSuitability += 'Good conditions for outdoor activities. ';
    }
    
    // Wind analysis
    if (data.wind > 50) {
        recommendation += 'Dangerously windy conditions expected. ';
        preparationTips += 'Avoid open areas and secure all loose items. ';
        eventSuitability += 'Outdoor events should be canceled or moved indoors. ';
    } else if (data.wind > 40) {
        recommendation += 'Very windy conditions expected. ';
        preparationTips += 'Secure loose items and consider wind protection. ';
        eventSuitability += 'Activities involving lightweight equipment may be difficult. ';
    } else if (data.wind > 25) {
        recommendation += 'Moderately windy conditions expected. ';
        preparationTips += 'Secure lightweight items and be prepared for wind. ';
    } else if (data.wind < 5) {
        recommendation += 'Very calm wind conditions expected. ';
    }
    
    // Overall comfort and recommendation
    if (data.comfort > 80) {
        recommendation += 'Overall, conditions appear highly favorable for your outdoor event. ';
        eventSuitability += 'Excellent conditions for all outdoor activities. ';
    } else if (data.comfort > 60) {
        recommendation += 'Overall, conditions appear favorable for your outdoor event. ';
        eventSuitability += 'Good conditions for most outdoor activities. ';
    } else if (data.comfort > 40) {
        recommendation += 'Conditions are acceptable but prepare for some discomfort. ';
        eventSuitability += 'Suitable for outdoor activities with proper preparation. ';
    } else if (data.comfort > 20) {
        recommendation += 'Conditions may be uncomfortable. ';
        eventSuitability += 'Consider rescheduling sensitive outdoor activities. ';
    } else {
        recommendation += 'Conditions will likely be very uncomfortable. ';
        eventSuitability += 'Strongly consider rescheduling or moving indoors. ';
    }
    
    // Combine all recommendations
    let finalRecommendation = recommendation;
    
    if (eventSuitability) {
        finalRecommendation += '\n\nEvent Suitability: ' + eventSuitability;
    }
    
    if (preparationTips) {
        finalRecommendation += '\n\nPreparation Tips: ' + preparationTips;
    }
    
    // Update the recommendation text with line breaks for better readability
    recommendationText.innerHTML = finalRecommendation.replace(/\n\n/g, '<br><br>');
}

// Create weather chart
function createWeatherChart(forecast) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.weatherChart) {
        window.weatherChart.destroy();
    }
    
    // Add a second canvas for the precipitation chart
    const precipChartContainer = document.createElement('div');
    precipChartContainer.className = 'chart-container';
    precipChartContainer.style.marginTop = '20px';
    
    const precipCanvas = document.createElement('canvas');
    precipCanvas.id = 'precip-chart';
    precipChartContainer.appendChild(precipCanvas);
    
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.parentNode.appendChild(precipChartContainer);
    
    // Temperature and wind chart
    window.weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecast.hours,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: forecast.temps,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Wind (km/h)',
                    data: forecast.winds,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature & Wind Forecast',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: '#ef4444'
                    },
                    grid: {
                        color: 'rgba(239, 68, 68, 0.1)'
                    },
                    ticks: {
                        color: '#ef4444'
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Wind (km/h)',
                        color: '#10b981'
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(16, 185, 129, 0.1)'
                    },
                    ticks: {
                        color: '#10b981'
                    }
                }
            }
        }
    });
    
    // Precipitation chart (bar chart)
    window.precipChart = new Chart(document.getElementById('precip-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: forecast.hours,
            datasets: [
                {
                    label: 'Precipitation (%)',
                    data: forecast.precip,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Precipitation Forecast',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Chance of Precipitation (%)',
                        color: '#3b82f6'
                    },
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)'
                    },
                    ticks: {
                        color: '#3b82f6'
                    }
                }
            }
        }
    });
    
    // Add a comfort index gauge chart
    const comfortContainer = document.createElement('div');
    comfortContainer.className = 'chart-container comfort-gauge';
    comfortContainer.style.marginTop = '20px';
    comfortContainer.style.height = '200px';
    
    const comfortCanvas = document.createElement('canvas');
    comfortCanvas.id = 'comfort-chart';
    comfortContainer.appendChild(comfortCanvas);
    
    precipChartContainer.parentNode.appendChild(comfortContainer);
    
    // Calculate average comfort from temperature, precipitation and wind
    const avgTemp = forecast.temps.reduce((a, b) => a + b, 0) / forecast.temps.length;
    const avgPrecip = forecast.precip.reduce((a, b) => a + b, 0) / forecast.precip.length;
    const avgWind = forecast.winds.reduce((a, b) => a + b, 0) / forecast.winds.length;
    
    const comfortIndex = Math.max(0, Math.min(100, 100 - 
        (Math.abs(avgTemp - 22) * 3 + 
         avgPrecip * 0.5 + 
         avgWind * 0.8)));
    
    // Create gauge chart for comfort index
    window.comfortChart = new Chart(document.getElementById('comfort-chart').getContext('2d'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [comfortIndex, 100 - comfortIndex],
                backgroundColor: [
                    getComfortColor(comfortIndex),
                    'rgba(200, 200, 200, 0.2)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            circumference: 180,
            rotation: 270,
            cutout: '70%',
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Comfort Index',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            }
        },
        plugins: [{
            id: 'comfortText',
            afterDraw: (chart) => {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                ctx.font = 'bold 24px Arial';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                const text = Math.round(comfortIndex) + '%';
                const textX = width / 2;
                const textY = height - 30;
                
                ctx.fillStyle = getComfortColor(comfortIndex);
                ctx.fillText(text, textX, textY);
                
                ctx.font = '14px Arial';
                let comfortText = 'Poor';
                if (comfortIndex > 80) comfortText = 'Excellent';
                else if (comfortIndex > 60) comfortText = 'Good';
                else if (comfortIndex > 40) comfortText = 'Fair';
                else if (comfortIndex > 20) comfortText = 'Poor';
                else comfortText = 'Very Poor';
                
                ctx.fillText(comfortText, textX, textY + 25);
                ctx.save();
            }
        }]
    });
}

// Helper function to get color based on comfort index
function getComfortColor(value) {
    if (value > 80) return '#10b981'; // Green for excellent
    if (value > 60) return '#22c55e'; // Light green for good
    if (value > 40) return '#f59e0b'; // Yellow for fair
    if (value > 20) return '#f97316'; // Orange for poor
    return '#ef4444'; // Red for very poor
}

// Format date for display
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}