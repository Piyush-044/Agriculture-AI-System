document.addEventListener("DOMContentLoaded", () => {
    // -------------------------
    // 1. Initialize Leaflet Map
    // -------------------------
    // Default location: Central India
    const defaultLat = 22.9734;
    const defaultLng = 78.6569;
    
    const map = L.map('map').setView([defaultLat, defaultLng], 5);

    // Using ESRI World Imagery (Free Open-Source Satellite Tiles)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 17
    });

    // Add layer to map
    satelliteLayer.addTo(map);

    let marker = null;
    let geojsonLayer = null;

    // Fetch Indian States GeoJSON for highlighting
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
        .then(res => res.json())
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                style: function() {
                    return {
                        color: "#ffffff",
                        weight: 1,
                        fillColor: "transparent",
                        fillOpacity: 0.1
                    };
                }
            }).addTo(map);
        }).catch(err => console.error("Error loading state boundaries: ", err));

    // Handle map clicks
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        // Update marker
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }
        
        // Update Overlay UI
        document.getElementById('lat-val').textContent = lat.toFixed(4);
        document.getElementById('lng-val').textContent = lng.toFixed(4);
        
        // Pan to location smoothly
        map.panTo(e.latlng);
    });

    // -------------------------
    // 2. Handle ML Prediction
    // -------------------------
    const form = document.getElementById("prediction-form");
    const predictBtn = document.getElementById("predict-btn");
    const btnText = predictBtn.querySelector("span");
    const spinner = document.getElementById("loading-spinner");
    const resultBox = document.getElementById("result-box");
    const predictedCrop = document.getElementById("predicted-crop");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // UI Loading state
        btnText.textContent = "Analyzing...";
        spinner.classList.remove("hidden");
        predictBtn.disabled = true;
        resultBox.classList.add("hidden");

        // Gather Data
        const payload = {
            N: parseFloat(document.getElementById('N').value),
            P: parseFloat(document.getElementById('P').value),
            K: parseFloat(document.getElementById('K').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            humidity: parseFloat(document.getElementById('humidity').value),
            ph: parseFloat(document.getElementById('ph').value),
            rainfall: parseFloat(document.getElementById('rainfall').value)
        };

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Prediction API failed");
            }

            const data = await response.json();
            
            // Show Results
            predictedCrop.textContent = data.recommended_crop;
            resultBox.classList.remove("hidden");
            
            // Smooth Scroll to result
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error("Error during prediction:", error);
            alert("Error connecting to the ML model backend. Make sure the server is running and the model is trained.");
        } finally {
            // Restore UI
            btnText.textContent = "Analyze & Predict";
            spinner.classList.add("hidden");
            predictBtn.disabled = false;
        }
    });

    // -------------------------
    // 3. Render States & APIs
    // -------------------------
    const stateGrid = document.getElementById("state-grid");
    const states = [
        {name: "Andhra Pradesh", abbr: "AP", lat: 15.9129, lng: 79.7400},
        {name: "Bihar", abbr: "BR", lat: 25.0961, lng: 85.3131},
        {name: "Gujarat", abbr: "GJ", lat: 22.2587, lng: 71.1924},
        {name: "Himachal Pradesh", abbr: "HP", lat: 31.1048, lng: 77.1734},
        {name: "Jharkhand", abbr: "JH", lat: 23.6102, lng: 85.2799},
        {name: "Kerala", abbr: "KL", lat: 10.8505, lng: 76.2711},
        {name: "Madhya Pradesh", abbr: "MP", lat: 22.9734, lng: 78.6569},
        {name: "Maharashtra", abbr: "MH", lat: 19.7515, lng: 75.7139},
        {name: "Meghalaya", abbr: "ML", lat: 25.4670, lng: 91.3662},
        {name: "Odisha", abbr: "OR", lat: 20.9517, lng: 85.0985},
        {name: "Telangana", abbr: "TG", lat: 18.1124, lng: 79.0193},
        {name: "Uttar Pradesh", abbr: "UP", lat: 26.8467, lng: 80.9462},
        {name: "Uttarakhand", abbr: "UK", lat: 30.0668, lng: 79.0193},
        {name: "West Bengal", abbr: "WB", lat: 22.9868, lng: 87.8550}
    ];

    states.forEach(st => {
        const card = document.createElement("div");
        card.className = "state-card";
        card.innerHTML = `
            <div class="state-badge">${st.abbr}</div>
            <h3>${st.name}</h3>
        `;
        card.addEventListener("click", () => fetchStateData(st));
        if(stateGrid) stateGrid.appendChild(card);
    });

    async function fetchStateData(st) {
        // Scroll to map
        document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' });
        
        // Pan Map & Highlight GeoJSON Shape
        map.flyTo([st.lat, st.lng], 6, { duration: 1.5 });
        if (marker) marker.setLatLng([st.lat, st.lng]);
        else marker = L.marker([st.lat, st.lng]).addTo(map);

        if (geojsonLayer) {
            geojsonLayer.eachLayer(function(layer) {
                // Find property matching state name
                const props = layer.feature.properties;
                const stateName = props.NAME_1 || props.st_nm || props.ST_NM || props.name || props.STATE;
                
                if (stateName && stateName.toLowerCase() === st.name.toLowerCase()) {
                    layer.setStyle({
                        color: '#4ade80', // Brighter green border
                        weight: 4,
                        fillColor: '#10b981', // Solid recognizable green
                        fillOpacity: 0.35
                    });
                } else {
                    layer.setStyle({
                        color: "#ffffff",
                        weight: 1,
                        fillColor: "transparent",
                        fillOpacity: 0.1
                    });
                }
            });
        }

        // Fetch Analysis
        try {
            const res = await fetch(`/api/state-data/${st.name}`);
            if(!res.ok) throw new Error("Data not found");
            const data = await res.json();
            
            // Map Overlay Updates
            document.getElementById('overlay-state-name').textContent = st.name;
            document.getElementById('overlay-default-text').classList.add("hidden");
            document.getElementById('weather-details').classList.remove("hidden");
            
            document.getElementById('overlay-temp').textContent = data.climate_analysis.temperature_avg;
            document.getElementById('overlay-humidity').textContent = data.climate_analysis.humidity_avg;
            document.getElementById('overlay-rain').textContent = data.climate_analysis.rainfall_yearly;
            document.getElementById('overlay-soil').textContent = data.soil_analysis.type;
            document.getElementById('overlay-condition').textContent = data.climate_analysis.weather_condition;
            
            // Handle Early Warning Alerts
            const riskBox = document.getElementById('risk-alert-box');
            const riskText = document.getElementById('overlay-risk');
            const alertIcon = riskBox.querySelector('.alert-icon');
            const riskData = data.climate_analysis.risk_alert;
            
            riskBox.classList.remove("hidden");
            riskBox.classList.remove("danger", "safe");
            
            if (riskData === "None" || riskData.includes("Low Risk")) {
                riskBox.classList.add("safe");
                alertIcon.textContent = "✅";
                riskText.textContent = "Safe: No climatic anomalies expected next month.";
            } else {
                riskBox.classList.add("danger");
                alertIcon.textContent = "⚠️";
                riskText.textContent = riskData;
            }

            // Auto fill the inputs
            document.getElementById('N').value = data.soil_analysis.nutrients.split(',')[0].split(':')[1].trim();
            document.getElementById('P').value = data.soil_analysis.nutrients.split(',')[1].split(':')[1].trim();
            document.getElementById('K').value = data.soil_analysis.nutrients.split(',')[2].split(':')[1].trim();
            document.getElementById('temperature').value = data.climate_analysis.temperature_avg;
            document.getElementById('humidity').value = data.climate_analysis.humidity_avg;
            document.getElementById('ph').value = data.soil_analysis.ph_level;
            document.getElementById('rainfall').value = data.climate_analysis.rainfall_yearly;
            
            // Inject analysis text
            const analysisText = `Analysis for ${st.name}: Found ${data.soil_analysis.type} soil, with ${data.climate_analysis.weather_condition} weather. Typical rainfall is ${data.climate_analysis.rainfall_yearly}mm.`;
            
            // Show result box
            predictedCrop.textContent = data.recommended_crop;
            document.getElementById("state-analysis-text").textContent = analysisText;
            document.getElementById("state-analysis-text").style.marginTop = "10px";
            resultBox.classList.remove("hidden");
            
        } catch(e) {
            console.error("Failed fetching state data", e);
            alert("Analysis data not available for " + st.name);
        }
    }

    // -------------------------
    // 4. Handle Contact Form
    // -------------------------
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector("button");
            const originalText = btn.textContent;
            
            btn.textContent = "Sending...";
            btn.style.opacity = "0.7";
            
            // Simulate network request
            setTimeout(() => {
                btn.textContent = "Message Sent Successfully!";
                btn.style.background = "linear-gradient(135deg, #34d399, #059669)";
                btn.style.color = "#fff";
                btn.style.opacity = "1";
                contactForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = "";
                    btn.style.color = "";
                }, 3000);
            }, 1500);
        });
    }

    // Logout / navigation helper
    const authAction = document.getElementById('auth-action');
    if (authAction) {
        authAction.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('agriclimate_user');
            window.location.href = '/';
        });
    }

    // Smooth Scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
