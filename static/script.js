document.addEventListener("DOMContentLoaded", () => {

    // =============================================
    // 0. PREMIUM ANIMATION ENGINE
    // =============================================

    // ---- Range Slider Sync ----
    const paramIds = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
    paramIds.forEach(id => {
        const numInput = document.getElementById(id);
        const sliderInput = document.getElementById(id + '-slider');
        const badge = document.getElementById(id + '-badge');
        
        if (numInput && sliderInput) {
            // Slider to input
            sliderInput.addEventListener('input', () => {
                numInput.value = sliderInput.value;
                if (badge) badge.textContent = sliderInput.value;
                numInput.dispatchEvent(new Event('input'));
            });
            
            // Input to slider
            numInput.addEventListener('input', () => {
                let val = parseFloat(numInput.value);
                if (isNaN(val)) val = parseFloat(sliderInput.min) || 0;
                sliderInput.value = val;
                if (badge) badge.textContent = numInput.value;
            });
        }
    });

    // ---- Scroll Reveal Animation ----
    const revealElements = document.querySelectorAll('.glass-card:not(#advisor-panel), .hero-stat, .state-card, .feature-card, .tech-card');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-reveal');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        });
    }

    // ---- Interactive Card Mouse Glow Track ----
    const glowCards = document.querySelectorAll('.glass-card:not(#advisor-panel), .feature-card, .tech-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ---- Scroll Progress Bar ----
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / docH) * 100;
            scrollProgress.style.width = `${Math.min(progress, 100)}%`;
        }, { passive: true });
    }

    // ---- Header scroll shrink ----
    const header = document.querySelector('.glass-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ---- 3D Parallax Tilt Effect for Hologram Card ----
    const hologramCard = document.getElementById('hologram-card');
    if (hologramCard) {
        hologramCard.addEventListener('mousemove', (e) => {
            const rect = hologramCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degrees tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            hologramCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        hologramCard.addEventListener('mouseleave', () => {
            hologramCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    }

    // ---- 3D Canvas Background Animation for Hero Banner ----
    const heroCanvas = document.getElementById('hero-3d-canvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let width, height;
        let points = [];
        let particles = [];
        let angleX = 0.25; // Tilted X axis
        let angleY = 0;
        const perspective = 450;
        
        function resizeHeroCanvas() {
            if (!heroCanvas.parentElement) return;
            const rect = heroCanvas.parentElement.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            heroCanvas.width = width;
            heroCanvas.height = height;
            
            generateGrid();
        }
        
        function generateGrid() {
            points = [];
            const cols = 16;
            const rows = 16;
            const spacing = 40;
            
            const startX = -((cols - 1) * spacing) / 2;
            const startZ = -((rows - 1) * spacing) / 2;
            
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const x = startX + c * spacing;
                    const z = startZ + r * spacing;
                    const y = 60; // Base height offset
                    points.push({ x, y, z, origY: y, c, r });
                }
            }
            
            particles = [];
            for (let i = 0; i < 35; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * 450,
                    y: Math.random() * 150 - 50,
                    z: (Math.random() - 0.5) * 450,
                    speedY: -0.4 - Math.random() * 0.6,
                    size: Math.random() * 1.5 + 0.8
                });
            }
        }
        
        window.addEventListener('resize', resizeHeroCanvas, { passive: true });
        
        resizeHeroCanvas();
        
        let frameCount = 0;
        
        function animate3DBackground() {
            if (!document.getElementById('hero-3d-canvas')) return; // Exit if element removed
            ctx.clearRect(0, 0, width, height);
            frameCount++;
            
            angleY += 0.0012; // Rotate yaw slowly
            
            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);
            
            const centerX = width / 2;
            const centerY = height / 2 - 10;
            
            const gridMap = {};
            const cols = 16;
            const rows = 16;
            
            // 1. Calculate and Project Points
            points.forEach(p => {
                const distFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
                const waveY = p.origY + Math.sin(distFromCenter * 0.018 - frameCount * 0.025) * 20;
                
                // Yaw Y rotation
                let x1 = p.x * cosY - p.z * sinY;
                let z1 = p.x * sinY + p.z * cosY;
                
                // Pitch X rotation
                let y2 = waveY * cosX - z1 * sinX;
                let z2 = waveY * sinX + z1 * cosX;
                
                const scale = perspective / (perspective + z2);
                const px = centerX + x1 * scale;
                const py = centerY + y2 * scale;
                
                gridMap[`${p.c}_${p.r}`] = { px, py, z: z2, visible: z2 > -perspective };
            });
            
            // 2. Draw Connected Grid Lines
            ctx.lineWidth = 0.7;
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const pCurrent = gridMap[`${c}_${r}`];
                    if (!pCurrent || !pCurrent.visible) continue;
                    
                    const depthFactor = Math.max(0, 1 - pCurrent.z / 350);
                    
                    if (c < cols - 1) {
                        const pRight = gridMap[`${c+1}_${r}`];
                        if (pRight && pRight.visible) {
                            const alpha = 0.09 * depthFactor;
                            ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
                            ctx.beginPath();
                            ctx.moveTo(pCurrent.px, pCurrent.py);
                            ctx.lineTo(pRight.px, pRight.py);
                            ctx.stroke();
                        }
                    }
                    
                    if (r < rows - 1) {
                        const pBottom = gridMap[`${c}_${r+1}`];
                        if (pBottom && pBottom.visible) {
                            const alpha = 0.09 * depthFactor;
                            ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
                            ctx.beginPath();
                            ctx.moveTo(pCurrent.px, pCurrent.py);
                            ctx.lineTo(pBottom.px, pBottom.py);
                            ctx.stroke();
                        }
                    }
                }
            }
            
            // 3. Draw Rising 3D Particles
            particles.forEach(p => {
                p.y += p.speedY;
                if (p.y < -100) {
                    p.y = 120;
                    p.x = (Math.random() - 0.5) * 450;
                    p.z = (Math.random() - 0.5) * 450;
                }
                
                const waveOffset = Math.sin(frameCount * 0.015 + p.y * 0.06) * 12;
                const actualX = p.x + waveOffset;
                
                let x1 = actualX * cosY - p.z * sinY;
                let z1 = actualX * sinY + p.z * cosY;
                let y2 = p.y * cosX - z1 * sinX;
                let z2 = p.y * sinX + z1 * cosX;
                
                if (z2 > -perspective) {
                    const scale = perspective / (perspective + z2);
                    const px = centerX + x1 * scale;
                    const py = centerY + y2 * scale;
                    
                    const depthFactor = Math.max(0, 1 - z2 / 350);
                    const alpha = 0.3 * depthFactor;
                    
                    ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = `rgba(0, 180, 255, ${alpha * 0.35})`;
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * scale * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            requestAnimationFrame(animate3DBackground);
        }
        
        animate3DBackground();
    }

    // ---- Particle Canvas System ----
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas, { passive: true });

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.hue = Math.random() > 0.6 ? 150 : (Math.random() > 0.5 ? 200 : 270);
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 255, 136, ${0.06 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            animFrame = requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // ---- Animated Counter (Hero Stats) ----
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();
        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Trigger counter when hero comes into view
    const statValues = document.querySelectorAll('.stat-value[data-target]');
    if (statValues.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statValues.forEach(el => counterObserver.observe(el));
    }

    // ---- Scroll Reveal (Intersection Observer) ----
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => revealObserver.observe(el));
    }

    // ---- Button Ripple Effect ----
    document.querySelectorAll('.primary-btn, .contact-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // ---- 3D Tilt Effect for State Cards (dynamic) ----
    function addTiltToCard(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
            const y = -((e.clientY - rect.top) / rect.height - 0.5) * 14;
            card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-6px) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    }

    // Apply tilt to existing state cards and watch for new ones
    const stateGrid = document.getElementById('state-grid');
    if (stateGrid) {
        const cardObserver = new MutationObserver(() => {
            stateGrid.querySelectorAll('.state-card:not([data-tilt])').forEach(card => {
                card.setAttribute('data-tilt', 'true');
                addTiltToCard(card);
            });
        });
        cardObserver.observe(stateGrid, { childList: true });
        stateGrid.querySelectorAll('.state-card').forEach(card => addTiltToCard(card));
    }

    // =============================================
    // 1. Initialize Advanced Leaflet Map
    // =============================================
    const defaultLat = 22.9734;
    const defaultLng = 78.6569;

    const map = L.map('map', {
        zoomControl: false,   // We'll add custom zoom
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
    }).setView([defaultLat, defaultLng], 5);

    // ---- TILE LAYERS (Multiple like Google Maps) ----
    const tileLayers = {
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri Satellite',
            maxZoom: 19
        }),
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap',
            maxZoom: 17
        }),
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB Dark',
            maxZoom: 19
        }),
    };

    let currentLayerKey = 'satellite';
    tileLayers.satellite.addTo(map);

    // ---- ESRI Labels Overlay (for satellite view, shows city names) ----
    const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        opacity: 0.8,
        maxZoom: 19
    });
    labelsLayer.addTo(map);

    // ---- CUSTOM ZOOM CONTROL (bottom right) ----
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ---- SCALE BAR ----
    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

    // ---- LAYER SWITCHER BUTTONS ----
    const layerBtns = {
        satellite: document.getElementById('layer-satellite'),
        street: document.getElementById('layer-street'),
        terrain: document.getElementById('layer-terrain'),
        dark: document.getElementById('layer-dark'),
    };

    function switchLayer(key) {
        map.removeLayer(tileLayers[currentLayerKey]);
        currentLayerKey = key;
        tileLayers[key].addTo(map);
        // Show labels only on satellite
        if (key === 'satellite') labelsLayer.addTo(map);
        else if (map.hasLayer(labelsLayer)) map.removeLayer(labelsLayer);
        Object.values(layerBtns).forEach(b => b && b.classList.remove('active'));
        if (layerBtns[key]) layerBtns[key].classList.add('active');
        document.getElementById('map-layer-display').textContent = `Layer: ${key.charAt(0).toUpperCase() + key.slice(1)}`;
    }

    Object.entries(layerBtns).forEach(([key, btn]) => {
        if (btn) btn.addEventListener('click', () => switchLayer(key));
    });

    // ---- FULLSCREEN BUTTON ----
    const fullscreenBtn = document.getElementById('map-fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const container = document.getElementById('map-main-container');
            if (!document.fullscreenElement) {
                container.requestFullscreen().then(() => {
                    map.invalidateSize();
                    fullscreenBtn.textContent = '✕ Exit Full';
                }).catch(() => {});
            } else {
                document.exitFullscreen();
                fullscreenBtn.textContent = '⛶ Fullscreen';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.textContent = '⛶ Fullscreen';
                setTimeout(() => map.invalidateSize(), 300);
            }
        });
    }

    // ---- GPS / MY LOCATION ----
    const gpsBtn = document.getElementById('map-gps-btn');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', () => {
            gpsBtn.textContent = '⏳ Locating...';
            gpsBtn.disabled = true;
            map.locate({ setView: true, maxZoom: 10 });
        });
        map.on('locationfound', (e) => {
            gpsBtn.textContent = '📍 My Location';
            gpsBtn.disabled = false;
            if (gpsMarker) map.removeLayer(gpsMarker);
            gpsMarker = L.circleMarker(e.latlng, {
                radius: 10, fillColor: '#3b82f6', color: '#fff', weight: 3, fillOpacity: 0.9
            }).addTo(map).bindPopup('<b>📍 You are here</b>').openPopup();
        });
        map.on('locationerror', () => {
            gpsBtn.textContent = '📍 My Location';
            gpsBtn.disabled = false;
            alert('Location access denied. Please enable GPS in browser.');
        });
    }
    let gpsMarker = null;

    // ---- MAP SEARCH (OpenStreetMap Nominatim API) ----
    const searchInput = document.getElementById('map-search-input');
    const searchResults = document.getElementById('map-search-results');
    let searchTimeout = null;
    let searchMarker = null;

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = searchInput.value.trim();
            if (query.length < 3) { searchResults.classList.add('hidden'); return; }
            searchTimeout = setTimeout(() => doMapSearch(query), 400);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { searchResults.classList.add('hidden'); searchInput.blur(); }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.map-search-box')) searchResults.classList.add('hidden');
        });
    }

    async function doMapSearch(query) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' India')}&limit=6&countrycodes=in`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            renderSearchResults(data);
        } catch (e) {
            console.error('Map search error:', e);
        }
    }

    function renderSearchResults(results) {
        if (!results.length) {
            searchResults.innerHTML = '<div class="search-result-item" style="color:var(--text-muted)">No results found</div>';
        } else {
            searchResults.innerHTML = results.map((r, i) => `
                <div class="search-result-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.display_name.split(',')[0]}">
                    <span class="search-result-icon">${getPlaceIcon(r.type, r.class)}</span>
                    <div>
                        <div class="search-result-name">${r.display_name.split(',')[0]}</div>
                        <div class="search-result-detail">${r.display_name.split(',').slice(1, 3).join(',').trim()}</div>
                    </div>
                </div>
            `).join('');

            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const lat = parseFloat(item.dataset.lat);
                    const lon = parseFloat(item.dataset.lon);
                    const name = item.dataset.name;
                    map.flyTo([lat, lon], 11, { duration: 1.5 });
                    if (searchMarker) map.removeLayer(searchMarker);
                    searchMarker = L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<b>📍 ${name}</b>`).openPopup();
                    searchInput.value = name;
                    searchResults.classList.add('hidden');
                    document.getElementById('map-coords-display').textContent = `📍 ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                    document.getElementById('lat-val').textContent = lat.toFixed(4);
                    document.getElementById('lng-val').textContent = lon.toFixed(4);
                });
            });
        }
        searchResults.classList.remove('hidden');
    }

    function getPlaceIcon(type, cls) {
        if (cls === 'place' || type === 'city' || type === 'town') return '🏙️';
        if (cls === 'boundary' || type === 'administrative') return '📍';
        if (cls === 'natural') return '🌿';
        if (cls === 'highway') return '🛣️';
        if (cls === 'amenity') return '🏛️';
        return '📌';
    }

    // ---- ZOOM + COORDS UPDATE ----
    map.on('zoomend', () => {
        document.getElementById('map-zoom-display').textContent = `Zoom: ${map.getZoom()}`;
    });
    map.on('mousemove', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('map-coords-display').textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    });

    // ---- PANEL MINIMIZE ----
    const minimizeBtn = document.getElementById('panel-minimize-btn');
    const panelContent = document.getElementById('panel-content');
    if (minimizeBtn && panelContent) {
        minimizeBtn.addEventListener('click', () => {
            const isHidden = panelContent.style.display === 'none';
            panelContent.style.display = isHidden ? '' : 'none';
            minimizeBtn.textContent = isHidden ? '−' : '+';
        });
    }

    // ---- STATE RISK COLOR DATA ----
    const stateRiskData = {
        "Andhra Pradesh": "moderate", "Arunachal Pradesh": "moderate", "Assam": "severe",
        "Bihar": "high", "Chhattisgarh": "safe", "Goa": "safe", "Gujarat": "severe",
        "Haryana": "safe", "Himachal Pradesh": "moderate", "Jharkhand": "safe",
        "Karnataka": "safe", "Kerala": "high", "Madhya Pradesh": "safe",
        "Maharashtra": "moderate", "Manipur": "safe", "Meghalaya": "safe",
        "Mizoram": "safe", "Nagaland": "safe", "Odisha": "severe", "Punjab": "moderate",
        "Rajasthan": "severe", "Sikkim": "moderate", "Tamil Nadu": "safe",
        "Telangana": "safe", "Tripura": "safe", "Uttar Pradesh": "high",
        "Uttarakhand": "moderate", "West Bengal": "severe", "Jammu & Kashmir": "moderate",
        "Delhi": "moderate"
    };

    const riskColors = {
        severe: { color: '#ef4444', fill: '#ef4444', label: 'SEVERE' },
        high:   { color: '#f97316', fill: '#f97316', label: 'HIGH' },
        moderate: { color: '#eab308', fill: '#eab308', label: 'MODERATE' },
        safe:   { color: '#10b981', fill: '#10b981', label: 'SAFE' },
    };

    let marker = null;
    let geojsonLayer = null;
    let riskLayersVisible = false;

    // ---- LOAD GEOJSON STATE BOUNDARIES ----
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
        .then(res => res.json())
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                style: () => ({
                    color: 'rgba(255,255,255,0.4)',
                    weight: 1.5,
                    fillColor: 'transparent',
                    fillOpacity: 0,
                }),
                onEachFeature: (feature, layer) => {
                    const stateName = feature.properties.NAME_1 || feature.properties.st_nm || feature.properties.ST_NM || feature.properties.name;
                    const risk = stateRiskData[stateName] || 'safe';
                    const rColor = riskColors[risk];

                    layer.on('mouseover', function(e) {
                        if (!riskLayersVisible) {
                            this.setStyle({ weight: 3, color: '#4ade80', fillColor: '#10b981', fillOpacity: 0.25 });
                        } else {
                            this.setStyle({ weight: 3, fillOpacity: 0.55 });
                        }
                        // Show tooltip
                        layer.bindTooltip(`<b>${stateName}</b><br>Risk: <span style="color:${rColor.color}">${rColor.label}</span>`, {
                            permanent: false, sticky: true, className: 'map-tooltip'
                        }).openTooltip(e.latlng);
                    });

                    layer.on('mouseout', function() {
                        if (!riskLayersVisible) {
                            this.setStyle({ weight: 1.5, color: 'rgba(255,255,255,0.4)', fillColor: 'transparent', fillOpacity: 0 });
                        } else {
                            this.setStyle({ weight: 1.5, fillOpacity: 0.35 });
                        }
                        layer.closeTooltip();
                    });

                    layer.on('click', function(e) {
                        const st = states.find(s => s.name.toLowerCase() === stateName?.toLowerCase());
                        if (st) fetchStateDataAndLiveWeather(st, e.latlng.lat, e.latlng.lng);
                    });
                }
            }).addTo(map);
        }).catch(err => console.error("GeoJSON load error:", err));

    // ---- RISK ZONE TOGGLE ----
    const riskToggleBtn = document.getElementById('map-risk-toggle');
    if (riskToggleBtn) {
        riskToggleBtn.addEventListener('click', () => {
            riskLayersVisible = !riskLayersVisible;
            riskToggleBtn.classList.toggle('active', riskLayersVisible);
            const legend = document.getElementById('map-legend');
            if (legend) legend.classList.toggle('visible', riskLayersVisible);

            if (geojsonLayer) {
                geojsonLayer.eachLayer(layer => {
                    const stateName = layer.feature?.properties?.NAME_1 || layer.feature?.properties?.st_nm || layer.feature?.properties?.ST_NM;
                    const risk = stateRiskData[stateName] || 'safe';
                    const rColor = riskColors[risk];
                    if (riskLayersVisible) {
                        layer.setStyle({ fillColor: rColor.fill, fillOpacity: 0.35, color: rColor.color, weight: 1.5 });
                    } else {
                        layer.setStyle({ fillColor: 'transparent', fillOpacity: 0, color: 'rgba(255,255,255,0.4)', weight: 1.5 });
                    }
                });
            }
        });
    }

    // ---- CUSTOM STATE MARKERS (like Google Maps pins) ----
    function createRiskIcon(risk) {
        const rColor = riskColors[risk] || riskColors.safe;
        return L.divIcon({
            className: '',
            html: `<div class="state-pin" style="background:${rColor.fill}; box-shadow: 0 0 12px ${rColor.fill}88; border: 2px solid rgba(255,255,255,0.5)">
                        <div class="pin-inner"></div>
                   </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });
    }

    // ---- MAP CLICK HANDLER ----
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById('lat-val').textContent = lat.toFixed(4);
        document.getElementById('lng-val').textContent = lng.toFixed(4);
        map.panTo(e.latlng);

        // Pulse animation marker
        if (marker) map.removeLayer(marker);
        marker = L.divIcon({
            className: '',
            html: `<div class="pulse-marker"><div class="pulse-dot"></div><div class="pulse-ring"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
        marker = L.marker(e.latlng, { icon: L.divIcon({
            className: '',
            html: `<div class="pulse-marker"><div class="pulse-dot"></div><div class="pulse-ring"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        })}).addTo(map);

        // Find nearest state
        let closestState = null, minDist = Infinity;
        states.forEach(st => {
            const d = Math.sqrt((st.lat - lat) ** 2 + (st.lng - lng) ** 2);
            if (d < minDist) { minDist = d; closestState = st; }
        });
        if (closestState) fetchStateDataAndLiveWeather(closestState, lat, lng);
    });

    // ---- PANEL ACTION BUTTONS ----
    document.getElementById('panel-predict-btn')?.addEventListener('click', () => {
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('panel-calendar-btn')?.addEventListener('click', () => {
        const stateName = document.getElementById('overlay-state-name')?.textContent;
        if (stateName && stateName !== 'India AgriMap') {
            window.loadCalendarForState?.(stateName);
        }
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
            
            // Render soil analysis & chart
            renderSoilAnalysis(data.recommended_crop, payload.N, payload.P, payload.K, payload.ph);
            
            // Phase 4 & 5: Fetch Yield estimate + Irrigation schedule
            fetchYieldAndIrrigation(payload, data.recommended_crop);

            // Phase 8: Save to history
            saveToHistory(data.recommended_crop, payload, null);
            
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
    // Note: stateGrid already declared above (line ~178), reusing it here
    const states = [
        {name: "Andhra Pradesh", abbr: "AP", lat: 15.9129, lng: 79.7400},
        {name: "Arunachal Pradesh", abbr: "AR", lat: 28.2180, lng: 94.7278},
        {name: "Assam", abbr: "AS", lat: 26.2006, lng: 92.9376},
        {name: "Bihar", abbr: "BR", lat: 25.0961, lng: 85.3131},
        {name: "Chhattisgarh", abbr: "CG", lat: 21.2787, lng: 81.8661},
        {name: "Goa", abbr: "GA", lat: 15.2993, lng: 74.1240},
        {name: "Gujarat", abbr: "GJ", lat: 22.2587, lng: 71.1924},
        {name: "Haryana", abbr: "HR", lat: 29.0588, lng: 76.0856},
        {name: "Himachal Pradesh", abbr: "HP", lat: 31.1048, lng: 77.1734},
        {name: "Jharkhand", abbr: "JH", lat: 23.6102, lng: 85.2799},
        {name: "Karnataka", abbr: "KA", lat: 15.3173, lng: 75.7139},
        {name: "Kerala", abbr: "KL", lat: 10.8505, lng: 76.2711},
        {name: "Madhya Pradesh", abbr: "MP", lat: 22.9734, lng: 78.6569},
        {name: "Maharashtra", abbr: "MH", lat: 19.7515, lng: 75.7139},
        {name: "Manipur", abbr: "MN", lat: 24.6637, lng: 93.9063},
        {name: "Meghalaya", abbr: "ML", lat: 25.4670, lng: 91.3662},
        {name: "Mizoram", abbr: "MZ", lat: 23.1645, lng: 92.9376},
        {name: "Nagaland", abbr: "NL", lat: 26.1584, lng: 94.5624},
        {name: "Odisha", abbr: "OR", lat: 20.9517, lng: 85.0985},
        {name: "Punjab", abbr: "PB", lat: 31.1471, lng: 75.3412},
        {name: "Rajasthan", abbr: "RJ", lat: 27.0238, lng: 74.2179},
        {name: "Sikkim", abbr: "SK", lat: 27.5330, lng: 88.5122},
        {name: "Tamil Nadu", abbr: "TN", lat: 11.1271, lng: 78.6569},
        {name: "Telangana", abbr: "TG", lat: 18.1124, lng: 79.0193},
        {name: "Tripura", abbr: "TR", lat: 23.9408, lng: 91.9882},
        {name: "Uttar Pradesh", abbr: "UP", lat: 26.8467, lng: 80.9462},
        {name: "Uttarakhand", abbr: "UK", lat: 30.0668, lng: 79.0193},
        {name: "West Bengal", abbr: "WB", lat: 22.9868, lng: 87.8550},
        {name: "Jammu & Kashmir", abbr: "JK", lat: 33.7782, lng: 76.5762},
        {name: "Delhi", abbr: "DL", lat: 28.7041, lng: 77.1025}
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
        await fetchStateDataAndLiveWeather(st, st.lat, st.lng);
    }

    // Convert Open-Meteo codes to emojis
    function getWeatherEmoji(code) {
        if (code === 0) return "☀️";
        if ([1, 2, 3].includes(code)) return "🌤️";
        if ([45, 48].includes(code)) return "🌫️";
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
        if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
        if ([95, 96, 99].includes(code)) return "⚡";
        return "☁️";
    }

    // Fetch Live Open-Meteo Weather Forecast
    async function fetchLiveWeatherAndForecast(lat, lng, locationName) {
        const container = document.getElementById('weather-forecast-container');
        const grid = document.getElementById('forecast-grid');
        const locName = document.getElementById('forecast-location-name');
        
        locName.textContent = `for ${locationName}`;
        container.classList.remove('hidden');
        grid.innerHTML = '<p style="color:var(--text-muted);">Fetching forecast data...</p>';
        
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Weather forecast failed");
            const data = await res.json();
            
            // Update map overlay with current live values from API
            document.getElementById('overlay-temp').textContent = data.current.temperature_2m.toFixed(1);
            document.getElementById('overlay-humidity').textContent = data.current.relative_humidity_2m.toFixed(0);
            document.getElementById('overlay-rain').textContent = (data.current.precipitation * 365).toFixed(0); // annual approximation
            document.getElementById('overlay-condition').textContent = `Live: ${getWeatherEmoji(data.daily.weathercode[0])}`;
            
            // Render 7-day forecast cards
            grid.innerHTML = '';
            for (let i = 0; i < 7; i++) {
                const date = new Date(data.daily.time[i]);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                const maxTemp = data.daily.temperature_2m_max[i].toFixed(1);
                const minTemp = data.daily.temperature_2m_min[i].toFixed(1);
                const rainProb = data.daily.precipitation_probability_max[i];
                const weatherEmoji = getWeatherEmoji(data.daily.weathercode[i]);
                
                const card = document.createElement('div');
                card.className = 'forecast-card';
                card.innerHTML = `
                    <div class="forecast-day">${dayName}</div>
                    <span class="forecast-icon">${weatherEmoji}</span>
                    <div class="forecast-temp">${maxTemp}°<span>/ ${minTemp}°</span></div>
                    <div class="forecast-rain">💧 ${rainProb}% Rain</div>
                `;
                grid.appendChild(card);
            }
        } catch (err) {
            console.error("Forecast Error:", err);
            grid.innerHTML = '<p style="color:#ef4444;">Unable to load weather forecast. Offline mode active.</p>';
        }
    }

    // Unified State Details + Live Weather Loader
    async function fetchStateDataAndLiveWeather(st, lat, lng) {
        // Scroll to map
        document.getElementById('map-view').scrollIntoView({ behavior: 'smooth' });
        
        // Pan Map & Highlight GeoJSON Shape
        map.flyTo([st.lat, st.lng], 6, { duration: 1.5 });
        if (marker) marker.setLatLng([lat, lng]);
        else marker = L.marker([lat, lng]).addTo(map);

        if (geojsonLayer) {
            geojsonLayer.eachLayer(function(layer) {
                const props = layer.feature.properties;
                const stateName = props.NAME_1 || props.st_nm || props.ST_NM || props.name || props.STATE;
                const isSelected = stateName && stateName.toLowerCase() === st.name.toLowerCase();
                const risk = stateRiskData ? (stateRiskData[stateName] || 'safe') : 'safe';
                const rColor = riskColors ? riskColors[risk] : { color: '#10b981', fill: '#10b981' };

                if (isSelected) {
                    layer.setStyle({ color: '#4ade80', weight: 3, fillColor: '#10b981', fillOpacity: 0.45 });
                    layer.bringToFront();
                } else {
                    if (riskLayersVisible && rColor) {
                        layer.setStyle({ fillColor: rColor.fill, fillOpacity: 0.25, color: rColor.color, weight: 1.5 });
                    } else {
                        layer.setStyle({ color: 'rgba(255,255,255,0.4)', weight: 1.5, fillColor: 'transparent', fillOpacity: 0 });
                    }
                }
            });
        }

        // Fetch Analysis from backend DB
        try {
            const res = await fetch(`/api/state-data/${st.name}`);
            if(!res.ok) throw new Error("Data not found");
            const data = await res.json();
            
            // Map Overlay Updates — new side panel
            document.getElementById('overlay-state-name').textContent = st.name;
            document.getElementById('panel-state-subtitle').textContent = `${data.soil_analysis.type} soil · ${data.climate_analysis.weather_condition}`;
            // Pick a relevant emoji based on state crops
            const stateEmojis = { 'Punjab': '🌾', 'Kerala': '🥥', 'Maharashtra': '🍊', 'West Bengal': '🐟', 'Rajasthan': '🏜️', 'Himachal Pradesh': '🍎', 'Goa': '🌴', 'Assam': '🍵' };
            document.getElementById('panel-state-icon').textContent = stateEmojis[st.name] || '🗺️';

            // Hide default, show weather
            document.getElementById('panel-default')?.classList.add('hidden');
            document.getElementById('weather-details').classList.remove('hidden');
            
            document.getElementById('overlay-temp').textContent = data.climate_analysis.temperature_avg;
            document.getElementById('overlay-humidity').textContent = data.climate_analysis.humidity_avg;
            document.getElementById('overlay-rain').textContent = data.climate_analysis.rainfall_yearly;
            document.getElementById('overlay-soil').textContent = data.soil_analysis.type;
            document.getElementById('overlay-condition').textContent = data.climate_analysis.weather_condition;
            
            document.getElementById('lat-val').textContent = lat.toFixed(4);
            document.getElementById('lng-val').textContent = lng.toFixed(4);

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
            
            // Load Live Meteorological weather forecast
            await fetchLiveWeatherAndForecast(lat, lng, st.name);
            
            // Inject analysis text
            const analysisText = `Analysis for ${st.name}: Found ${data.soil_analysis.type} soil, with ${data.climate_analysis.weather_condition} weather. Typical rainfall is ${data.climate_analysis.rainfall_yearly}mm.`;
            
            // Show result box
            predictedCrop.textContent = data.recommended_crop;
            document.getElementById("state-analysis-text").textContent = analysisText;
            document.getElementById("state-analysis-text").style.marginTop = "10px";
            resultBox.classList.remove("hidden");
            
            // Render soil analysis & chart
            const currentN = parseFloat(document.getElementById('N').value);
            const currentP = parseFloat(document.getElementById('P').value);
            const currentK = parseFloat(document.getElementById('K').value);
            const currentPH = parseFloat(document.getElementById('ph').value);
            renderSoilAnalysis(data.recommended_crop, currentN, currentP, currentK, currentPH);

            // Phase 4 & 5: Yield + Irrigation
            const statePayload = { N: currentN, P: currentP, K: currentK, ph: currentPH, temperature: data.climate_analysis.temperature_avg, humidity: data.climate_analysis.humidity_avg, rainfall: data.climate_analysis.rainfall_yearly };
            fetchYieldAndIrrigation(statePayload, data.recommended_crop);

            // Phase 8: Save to history
            saveToHistory(data.recommended_crop, statePayload, st.name);

            // Notify Advisor with crop context automatically
            const advisorBadge = document.querySelector('.bubble-badge');
            const advisorPanel = document.getElementById('advisor-panel');
            if (advisorPanel && advisorPanel.classList.contains('hidden')) {
                advisorBadge.classList.remove('hidden');
                advisorBadge.textContent = "1";
            }
            addChatMessage(`📍 Location update: **${st.name}** select kiya gaya. Recommended crop: **${data.recommended_crop}**. Ab koi bhi sawaal puchho! 🌾`, 'bot-message');
            
        } catch(e) {
            console.error("Failed fetching state data", e);
            alert("Analysis data not available for " + st.name);
        }
    }

    // Crop N-P-K & pH Target Reference Database
    const cropGuidelines = {
        rice: { N: 80, P: 40, K: 40, ph: 6.5, name: "Rice" },
        maize: { N: 80, P: 40, K: 20, ph: 6.2, name: "Maize" },
        chickpea: { N: 40, P: 60, K: 20, ph: 7.0, name: "Chickpea" },
        kidneybeans: { N: 20, P: 60, K: 20, ph: 6.0, name: "Kidney Beans" },
        pigeonpeas: { N: 20, P: 60, K: 20, ph: 6.7, name: "Pigeon Peas" },
        mothbeans: { N: 20, P: 40, K: 20, ph: 6.8, name: "Moth Beans" },
        mungbean: { N: 20, P: 40, K: 20, ph: 6.7, name: "Mung Bean" },
        blackgram: { N: 40, P: 60, K: 20, ph: 7.0, name: "Black Gram" },
        lentil: { N: 20, P: 60, K: 20, ph: 6.5, name: "Lentil" },
        pomegranate: { N: 20, P: 10, K: 40, ph: 6.4, name: "Pomegranate" },
        banana: { N: 100, P: 75, K: 50, ph: 6.5, name: "Banana" },
        mango: { N: 20, P: 20, K: 30, ph: 6.0, name: "Mango" },
        grapes: { N: 20, P: 120, K: 200, ph: 6.0, name: "Grapes" },
        watermelon: { N: 60, P: 20, K: 50, ph: 6.5, name: "Watermelon" },
        muskmelon: { N: 100, P: 20, K: 50, ph: 6.3, name: "Muskmelon" },
        apple: { N: 20, P: 125, K: 200, ph: 5.9, name: "Apple" },
        orange: { N: 40, P: 10, K: 10, ph: 6.0, name: "Orange" },
        papaya: { N: 50, P: 50, K: 50, ph: 6.5, name: "Papaya" },
        coconut: { N: 20, P: 10, K: 30, ph: 6.0, name: "Coconut" },
        cotton: { N: 120, P: 40, K: 40, ph: 6.5, name: "Cotton" },
        jute: { N: 80, P: 40, K: 40, ph: 6.5, name: "Jute" },
        coffee: { N: 100, P: 20, K: 30, ph: 6.2, name: "Coffee" }
    };

    let npkChartInstance = null;

    // Soil Nutrient Deficiency Calculator & Chart.js renderer
    function renderSoilAnalysis(cropName, currentN, currentP, currentK, currentPH) {
        const normalized = cropName.toLowerCase().replace(/\s+/g, '');
        const ideal = cropGuidelines[normalized] || { N: 80, P: 40, K: 40, ph: 6.5, name: cropName };

        // 1. Render Chart.js
        const ctx = document.getElementById('npk-chart').getContext('2d');
        if (npkChartInstance) {
            npkChartInstance.destroy();
        }

        npkChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
                datasets: [
                    {
                        label: 'Current Soil (mg/kg)',
                        data: [currentN, currentP, currentK],
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Ideal Requirement',
                        data: [ideal.N, ideal.P, ideal.K],
                        backgroundColor: 'rgba(16, 185, 129, 0.4)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc', font: { family: 'Outfit', size: 11 } }
                    }
                }
            }
        });

        // 2. Compute deficiency recommendations
        const adviceDiv = document.getElementById('fertilizer-advice');
        let adviceCardsHTML = '';

        if (currentN < ideal.N) {
            const diff = (ideal.N - currentN).toFixed(0);
            adviceCardsHTML += `
                <div class="fertilizer-card nitrogen">
                    <h5>🔵 Nitrogen deficient (-${diff} mg/kg)</h5>
                    <p>Nitrogen is essential for vegetative growth and green foliage.</p>
                    <div class="treatment">Booster: Apply Urea or farmyard compost.</div>
                </div>
            `;
        }

        if (currentP < ideal.P) {
            const diff = (ideal.P - currentP).toFixed(0);
            adviceCardsHTML += `
                <div class="fertilizer-card phosphorus">
                    <h5>🔴 Phosphorus deficient (-${diff} mg/kg)</h5>
                    <p>Phosphorus stimulates root development, flowering, and seed production.</p>
                    <div class="treatment">Booster: Apply DAP (Diammonium Phosphate) or bone meal.</div>
                </div>
            `;
        }

        if (currentK < ideal.K) {
            const diff = (ideal.K - currentK).toFixed(0);
            adviceCardsHTML += `
                <div class="fertilizer-card potassium">
                    <h5>🟡 Potassium deficient (-${diff} mg/kg)</h5>
                    <p>Potassium increases disease resistance, drought tolerance, and quality.</p>
                    <div class="treatment">Booster: Apply MOP (Muriate of Potash) or wood ash.</div>
                </div>
            `;
        }

        // Soil pH modifiers
        if (currentPH < ideal.ph - 0.5) {
            adviceCardsHTML += `
                <div class="fertilizer-card ph-booster">
                    <h5>🟣 Acidic Soil (pH ${currentPH} vs Ideal ${ideal.ph})</h5>
                    <p>High acidity limits nutrient intake. Sweeten the soil.</p>
                    <div class="treatment">Booster: Apply agricultural lime (calcium carbonate).</div>
                </div>
            `;
        } else if (currentPH > ideal.ph + 0.5) {
            adviceCardsHTML += `
                <div class="fertilizer-card ph-booster">
                    <h5>🟣 Alkaline Soil (pH ${currentPH} vs Ideal ${ideal.ph})</h5>
                    <p>High alkalinity locks iron and manganese. Acidify the soil.</p>
                    <div class="treatment">Booster: Apply elemental sulfur or peat moss.</div>
                </div>
            `;
        }

        if (adviceCardsHTML === '') {
            adviceCardsHTML = `
                <div class="fertilizer-card" style="border-left-color: #10b981;">
                    <h5>💚 Soil Ratios Optimal</h5>
                    <p>Your soil nutrient levels are perfectly optimized for cultivating ${ideal.name}!</p>
                    <div class="treatment" style="color:#10b981;">No chemical amendments required.</div>
                </div>
            `;
        }

        adviceDiv.innerHTML = adviceCardsHTML;
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
            
            setTimeout(() => {
                btn.textContent = "Message Sent Successfully!";
                btn.style.background = "linear-gradient(135deg, #34d399, #059669)";
                btn.style.color = "#fff";
                btn.style.opacity = "1";
                contactForm.reset();
                
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
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------------------------
    // 5. Advanced Multilingual AI Advisor
    // -------------------------
    const advisorBubble = document.getElementById('advisor-bubble');
    const advisorPanel = document.getElementById('advisor-panel');
    const closeAdvisor = document.getElementById('close-advisor');
    const advisorForm = document.getElementById('advisor-form');
    const advisorInput = document.getElementById('advisor-input');
    const advisorMessages = document.getElementById('advisor-messages');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const charCount = document.getElementById('char-count');
    const voiceBtn = document.getElementById('voice-btn');
    const sendBtn = document.getElementById('send-btn');
    const suggestedQuestions = document.getElementById('suggested-questions');

    let selectedLang = 'auto';
    let messageCount = 0;

    // --- Open/Close ---
    if (advisorBubble && advisorPanel) {
        advisorBubble.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            advisorPanel.classList.toggle('hidden');
            const badge = advisorBubble.querySelector('.bubble-badge');
            if (badge) badge.classList.add('hidden');
            if (!advisorPanel.classList.contains('hidden')) {
                advisorMessages.scrollTop = advisorMessages.scrollHeight;
            }
        });
    }

    if (closeAdvisor) {
        closeAdvisor.addEventListener('click', () => advisorPanel.classList.add('hidden'));
    }

    // --- Clear Chat ---
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            if (!confirm('Chat history clear karna chahte ho? 🗑️')) return;
            advisorMessages.innerHTML = `
                <div class="message bot-message">
                    <span class="msg-avatar">🤖</span>
                    <div class="msg-content">
                        <p>Chat clear ho gaya! 🌱 Koi naya sawaal puchho!</p>
                    </div>
                </div>`;
            messageCount = 0;
            if (suggestedQuestions) suggestedQuestions.style.display = '';
        });
    }

    // --- Language Chips ---
    document.querySelectorAll('.lang-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.lang-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedLang = chip.dataset.lang;
            // Update placeholder
            const placeholders = {
                auto: 'Hindi, English, Hinglish — kuch bhi likhein... 🌾',
                hi: 'अपना सवाल हिंदी में लिखें... 🌾',
                hinglish: 'Yaar, kuch bhi puchho Hinglish mein... 🌾',
                en: 'Ask your farming question in English... 🌾'
            };
            if (advisorInput) advisorInput.placeholder = placeholders[selectedLang] || placeholders.auto;
        });
    });

    // --- Auto-resize textarea ---
    if (advisorInput) {
        advisorInput.addEventListener('input', () => {
            advisorInput.style.height = 'auto';
            advisorInput.style.height = Math.min(advisorInput.scrollHeight, 120) + 'px';
            const len = advisorInput.value.length;
            if (charCount) {
                charCount.textContent = `${len}/500`;
                charCount.style.color = len > 400 ? '#ef4444' : len > 300 ? '#f59e0b' : '';
            }
        });

        // Submit on Enter (Shift+Enter for newline)
        advisorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (advisorInput.value.trim()) {
                    advisorForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    // --- Voice Input (Web Speech API) ---
    if (voiceBtn) {
        let recognition = null;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN'; // Indian English

            recognition.onstart = () => {
                voiceBtn.textContent = '🔴';
                voiceBtn.classList.add('recording');
            };
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(r => r[0].transcript).join('');
                advisorInput.value = transcript;
                if (charCount) charCount.textContent = `${transcript.length}/500`;
            };
            recognition.onend = () => {
                voiceBtn.textContent = '🎤';
                voiceBtn.classList.remove('recording');
            };
            recognition.onerror = () => {
                voiceBtn.textContent = '🎤';
                voiceBtn.classList.remove('recording');
            };

            voiceBtn.addEventListener('click', () => {
                if (voiceBtn.classList.contains('recording')) {
                    recognition.stop();
                } else {
                    recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
                    recognition.start();
                }
            });
        } else {
            voiceBtn.title = 'Voice input not supported in this browser';
            voiceBtn.style.opacity = '0.4';
            voiceBtn.style.cursor = 'not-allowed';
        }
    }

    // --- Suggested Question Chips ---
    document.querySelectorAll('.sq-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (advisorInput) {
                advisorInput.value = chip.dataset.query;
                advisorInput.dispatchEvent(new Event('input'));
                advisorForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // --- Quick Action Buttons ---
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            if (advisorInput) {
                advisorInput.value = query;
                advisorInput.dispatchEvent(new Event('input'));
                advisorForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // --- Render markdown-like formatting ---
    function renderMessageText(text) {
        return text
            // Bold: **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic: *text*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code: `text`
            .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>')
            // Bullet points: lines starting with - or •
            .replace(/^[-•]\s(.+)/gm, '<li>$1</li>')
            // Numbered lists
            .replace(/^\d+\.\s(.+)/gm, '<li>$1</li>')
            // Line breaks to <p>
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                if (line.startsWith('<li>')) return line;
                return `<p>${line}</p>`;
            })
            .join('');
    }

    // --- Add message to chat ---
    function addChatMessage(text, type, timestamp = true) {
        // Hide suggested questions after first user message
        if (type === 'user-message' && suggestedQuestions) {
            suggestedQuestions.style.display = 'none';
        }
        messageCount++;

        const msg = document.createElement('div');
        msg.className = `message ${type}`;

        const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        if (type === 'user-message') {
            msg.innerHTML = `
                <div class="msg-content user-msg-content">
                    <p>${text.replace(/\n/g, '<br>')}</p>
                    ${timestamp ? `<span class="msg-time">${timeStr}</span>` : ''}
                </div>
                <span class="msg-avatar user-avatar">👤</span>`;
        } else if (type === 'bot-message') {
            const rendered = renderMessageText(text);
            msg.innerHTML = `
                <span class="msg-avatar">🤖</span>
                <div class="msg-content">
                    ${rendered}
                    ${timestamp ? `<span class="msg-time">${timeStr}</span>` : ''}
                </div>`;
        } else {
            // system message
            msg.innerHTML = `<div class="msg-content system-msg-content"><p>${text}</p></div>`;
        }

        if (advisorMessages) {
            advisorMessages.appendChild(msg);
            advisorMessages.scrollTop = advisorMessages.scrollHeight;
        }
        return msg;
    }

    // --- Typing indicator ---
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-msg';
        indicator.innerHTML = `
            <span class="msg-avatar">🤖</span>
            <div class="msg-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-label">AI soch raha hai...</span>
                </div>
            </div>`;
        if (advisorMessages) {
            advisorMessages.appendChild(indicator);
            advisorMessages.scrollTop = advisorMessages.scrollHeight;
        }
        return indicator;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // --- Submit Handler ---
    if (advisorForm) {
        advisorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = advisorInput.value.trim();
            if (!query) return;

            advisorInput.value = '';
            advisorInput.style.height = 'auto';
            if (charCount) charCount.textContent = '0/500';

            addChatMessage(query, 'user-message');
            sendBtn.disabled = true;
            const typingEl = showTypingIndicator();

            // Get context
            const currentCrop = document.getElementById('predicted-crop')?.textContent || '';
            const currentN = parseFloat(document.getElementById('N')?.value) || null;
            const currentP = parseFloat(document.getElementById('P')?.value) || null;
            const currentK = parseFloat(document.getElementById('K')?.value) || null;
            const currentTemp = parseFloat(document.getElementById('temperature')?.value) || null;
            const currentHumidity = parseFloat(document.getElementById('humidity')?.value) || null;
            const currentPH = parseFloat(document.getElementById('ph')?.value) || null;
            const currentRainfall = parseFloat(document.getElementById('rainfall')?.value) || null;

            // Build language hint into message if language selected
            let finalQuery = query;
            if (selectedLang === 'hi') {
                finalQuery = `[User wants response in PURE HINDI/Devanagari script] ${query}`;
            } else if (selectedLang === 'hinglish') {
                finalQuery = `[User wants response in HINGLISH (Hindi+English mix)] ${query}`;
            } else if (selectedLang === 'en') {
                finalQuery = `[User wants response in English, but make it friendly Indian style] ${query}`;
            }

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: finalQuery,
                        crop: currentCrop || undefined,
                        N: currentN, P: currentP, K: currentK,
                        temperature: currentTemp, humidity: currentHumidity,
                        ph: currentPH, rainfall: currentRainfall,
                        language: selectedLang
                    })
                });

                removeTypingIndicator(typingEl);

                if (res.ok) {
                    const data = await res.json();
                    addChatMessage(data.response, 'bot-message');

                    // Update language badge if available
                    const langBadge = document.getElementById('lang-detected-badge');
                    if (langBadge) {
                        const langLabels = { auto: '🌐 Auto', hi: '🇮🇳 Hindi', hinglish: '🔀 Hinglish', en: '🇬🇧 English' };
                        langBadge.textContent = langLabels[selectedLang] || '🌐 Auto';
                        langBadge.classList.remove('hidden');
                    }

                    // Model indicator
                    if (data.model_used) {
                        const modelInfo = document.createElement('div');
                        modelInfo.className = 'model-badge';
                        modelInfo.textContent = `⚡ ${data.model_used}`;
                        const lastMsg = advisorMessages.lastElementChild;
                        if (lastMsg) lastMsg.querySelector('.msg-content')?.appendChild(modelInfo);
                    }
                } else {
                    addChatMessage('Arrey yaar, kuch gadbad ho gayi! Thodi der baad try karo. 🙏', 'bot-message');
                }
            } catch (error) {
                removeTypingIndicator(typingEl);
                console.error('Chat error:', error);
                addChatMessage('Network error! Internet connection check karo aur dobara try karo. 📡', 'bot-message');
            } finally {
                sendBtn.disabled = false;
            }
        });
    }

    // -------------------------
    // 6. Download / Print Soil Card (PDF)
    // -------------------------

    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const resultBox = document.getElementById('result-box');
            const today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
            resultBox.setAttribute('data-date', today);
            
            // Format for PDF generation
            resultBox.classList.add('pdf-generation');
            
            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     `Soil_Health_Card_${today.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate and save report via html2pdf library
            html2pdf().set(opt).from(resultBox).save().then(() => {
                resultBox.classList.remove('pdf-generation');
            }).catch(err => {
                console.error("PDF generation failed:", err);
                resultBox.classList.remove('pdf-generation');
                // Fallback to standard print
                window.print();
            });
        });
    }
});

// =====================================================================
// PHASE 1: Disease Detection Logic
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    let diseaseImageBase64 = null;
    const diseaseInput = document.getElementById('disease-image-input');
    const analyzeBtn = document.getElementById('analyze-disease-btn');
    const diseaseSpinner = document.getElementById('disease-spinner');
    const diseaseResult = document.getElementById('disease-result');
    const diseasePreviewContainer = document.getElementById('disease-preview-container');
    const diseasePreviewImg = document.getElementById('disease-preview-img');
    const uploadZone = document.getElementById('disease-upload-zone');

    if (!diseaseInput) return;

    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) processImageFile(file);
        });
    }

    diseaseInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processImageFile(file);
    });

    function processImageFile(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target.result;
            diseaseImageBase64 = result.split(',')[1];
            diseasePreviewImg.src = result;
            diseasePreviewContainer.classList.remove('hidden');
            analyzeBtn.disabled = false;
            diseaseResult.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            if (!diseaseImageBase64) return;
            const btnSpan = analyzeBtn.querySelector('span');
            btnSpan.textContent = 'Analyzing...';
            diseaseSpinner.classList.remove('hidden');
            analyzeBtn.disabled = true;
            diseaseResult.classList.add('hidden');
            const cropName = document.getElementById('disease-crop-name')?.value?.trim() || null;
            try {
                const res = await fetch('/api/disease-detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: diseaseImageBase64, crop_name: cropName })
                });
                const data = await res.json();
                renderDiseaseResult(data);
            } catch (err) {
                diseaseResult.innerHTML = `<div class="disease-error">❌ Analysis failed. Please check your connection.</div>`;
                diseaseResult.classList.remove('hidden');
            } finally {
                btnSpan.textContent = '🔬 Analyze';
                diseaseSpinner.classList.add('hidden');
                analyzeBtn.disabled = false;
            }
        });
    }

    function renderDiseaseResult(data) {
        const isHealthy = data.disease === 'Healthy';
        const severityColor = { 'None': '#10b981', 'Mild': '#eab308', 'Moderate': '#f97316', 'Severe': '#ef4444' }[data.severity] || '#94a3b8';
        diseaseResult.innerHTML = `
            <div class="disease-result-card ${isHealthy ? 'healthy' : 'diseased'}">
                <div class="disease-result-header">
                    <span class="disease-icon-big">${isHealthy ? '✅' : '🦠'}</span>
                    <div>
                        <h3>${data.disease}</h3>
                        <div class="disease-badges">
                            <span class="badge">Confidence: ${data.confidence}</span>
                            <span class="badge" style="background:${severityColor}22; border-color:${severityColor}; color:${severityColor}">Severity: ${data.severity}</span>
                        </div>
                    </div>
                </div>
                ${!isHealthy ? `
                <div class="disease-details">
                    <div class="disease-info-block"><h5>🔍 Symptoms</h5><p>${data.symptoms}</p></div>
                    <div class="disease-info-block organic-block"><h5>🌿 Organic Treatment</h5><p>${data.organic_treatment}</p></div>
                    <div class="disease-info-block chemical-block"><h5>🧪 Chemical Treatment</h5><p>${data.chemical_treatment}</p></div>
                    <div class="disease-info-block"><h5>🛡️ Prevention</h5><p>${data.prevention}</p></div>
                </div>` : `<p style="color:#34d399; margin-top:1rem">Your crop appears healthy! Keep up good agricultural practices.</p>`}
            </div>`;
        diseaseResult.classList.remove('hidden');
        diseaseResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// =====================================================================
// PHASE 2: Crop Calendar Logic
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    const calendarStateSelect = document.getElementById('calendar-state-select');
    const calendarGrid = document.getElementById('calendar-grid');
    const seasonTabs = document.querySelectorAll('.season-tab');
    if (!calendarStateSelect) return;

    let currentCalendarData = [];
    let activeSeasonFilter = 'all';

    calendarStateSelect.addEventListener('change', async () => {
        const state = calendarStateSelect.value;
        if (!state) return;
        calendarGrid.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">🌱 Loading calendar...</div>';
        try {
            const res = await fetch(`/api/crop-calendar/${encodeURIComponent(state)}`);
            const data = await res.json();
            currentCalendarData = data.calendar;
            renderCalendar(activeSeasonFilter);
        } catch (err) {
            calendarGrid.innerHTML = '<div style="color:#ef4444;text-align:center;padding:2rem">Failed to load calendar.</div>';
        }
    });

    seasonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            seasonTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeSeasonFilter = tab.getAttribute('data-season');
            renderCalendar(activeSeasonFilter);
        });
    });

    function renderCalendar(filter) {
        if (!currentCalendarData.length) return;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const filtered = filter === 'all' ? currentCalendarData : currentCalendarData.filter(c => c.season === filter);
        if (!filtered.length) {
            calendarGrid.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)">No ${filter} crops for this state.</div>`;
            return;
        }
        const seasonColors = { Kharif: '#3b82f6', Rabi: '#8b5cf6', Zaid: '#f59e0b' };
        calendarGrid.innerHTML = filtered.map(crop => {
            const monthBars = months.map((m, i) => {
                const month = i + 1;
                let type = '';
                const sowsInMonth = (crop.sow_end >= crop.sow_start)
                    ? (month >= crop.sow_start && month <= crop.sow_end)
                    : (month >= crop.sow_start || month <= crop.sow_end);
                const harvestsInMonth = (crop.harvest_end >= crop.harvest_start)
                    ? (month >= crop.harvest_start && month <= crop.harvest_end)
                    : (month >= crop.harvest_start || month <= crop.harvest_end);
                if (harvestsInMonth) type = 'harvest';
                if (sowsInMonth) type = 'sow';
                return `<div class="cal-month ${type}" title="${m}">${m}</div>`;
            }).join('');
            const waterMap = { 'Very High':'💧💧💧💧','High':'💧💧💧','Medium':'💧💧','Low':'💧' };
            const color = seasonColors[crop.season] || '#10b981';
            return `
                <div class="calendar-crop-card">
                    <div class="cal-crop-header">
                        <span class="cal-crop-name">🌾 ${crop.crop}</span>
                        <span class="cal-season-badge" style="background:${color}22;border-color:${color};color:${color}">${crop.season}</span>
                    </div>
                    <div class="cal-month-row">${monthBars}</div>
                    <div class="cal-legend">
                        <span class="cal-legend-item"><span class="sow-dot"></span>Sowing</span>
                        <span class="cal-legend-item"><span class="harvest-dot"></span>Harvesting</span>
                        <span class="cal-info">⏱️ ${crop.duration}</span>
                        <span class="cal-info">${waterMap[crop.water_requirement]||'💧'} ${crop.water_requirement} Water</span>
                    </div>
                </div>`;
        }).join('');
    }

    window.loadCalendarForState = function(stateName) {
        if (calendarStateSelect) {
            calendarStateSelect.value = stateName;
            calendarStateSelect.dispatchEvent(new Event('change'));
            document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };
});

// =====================================================================
// PHASE 3: Market Prices Logic
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loadPricesBtn = document.getElementById('load-prices-btn');
    const marketSearch = document.getElementById('market-search');
    const marketTbody = document.getElementById('market-tbody');
    const marketContainer = document.getElementById('market-table-container');
    const marketLoading = document.getElementById('market-loading');
    if (!loadPricesBtn) return;

    let allPrices = [];
    const priceChartInstances = {};

    loadPricesBtn.addEventListener('click', loadMarketPrices);

    if (marketSearch) {
        marketSearch.addEventListener('input', () => {
            const q = marketSearch.value.toLowerCase();
            renderPricesTable(allPrices.filter(p => p.crop.toLowerCase().includes(q)));
        });
    }

    async function loadMarketPrices() {
        marketLoading.classList.remove('hidden');
        marketContainer.classList.add('hidden');
        loadPricesBtn.disabled = true;
        try {
            const res = await fetch('/api/market-prices');
            const data = await res.json();
            allPrices = data.prices;
            renderPricesTable(allPrices);
        } catch (err) {
            marketLoading.innerHTML = '<p style="color:#ef4444;text-align:center">Failed to load prices.</p>';
        } finally {
            loadPricesBtn.disabled = false;
        }
    }

    function getTrendBadge(trend) {
        const map = { rising:'<span class="trend-badge rising">📈 Rising</span>', falling:'<span class="trend-badge falling">📉 Falling</span>', stable:'<span class="trend-badge stable">➡️ Stable</span>', volatile:'<span class="trend-badge volatile">⚡ Volatile</span>', seasonal:'<span class="trend-badge seasonal">🌸 Seasonal</span>' };
        return map[trend] || trend;
    }

    function renderPricesTable(prices) {
        marketLoading.classList.add('hidden');
        marketContainer.classList.remove('hidden');
        Object.values(priceChartInstances).forEach(c => c.destroy());
        marketTbody.innerHTML = prices.map((p, i) => {
            const canvasId = `mini-chart-${i}`;
            return `<tr>
                <td><strong>🌾 ${p.crop}</strong><br><small style="color:var(--text-muted)">${p.unit}</small></td>
                <td style="color:#94a3b8">₹${p.min_price.toLocaleString()}</td>
                <td style="color:#34d399;font-weight:700;font-size:1.1rem">₹${p.modal_price.toLocaleString()}</td>
                <td style="color:#60a5fa">₹${p.max_price.toLocaleString()}</td>
                <td>${getTrendBadge(p.trend)}</td>
                <td><canvas id="${canvasId}" width="120" height="40" style="max-width:120px"></canvas></td>
            </tr>`;
        }).join('');
        prices.forEach((p, i) => {
            const ctx = document.getElementById(`mini-chart-${i}`)?.getContext('2d');
            if (!ctx) return;
            const color = p.trend === 'rising' ? '#34d399' : p.trend === 'falling' ? '#ef4444' : '#60a5fa';
            priceChartInstances[i] = new Chart(ctx, {
                type: 'line',
                data: { labels: p.trend_data.map(d => d.date), datasets: [{ data: p.trend_data.map(d => d.price), borderColor: color, borderWidth: 2, pointRadius: 0, tension: 0.4, fill: false }] },
                options: { responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: { duration: 300 } }
            });
        });
    }

    // Auto-load prices on page init
    loadMarketPrices();
});

// =====================================================================
// PHASE 4 & 5: Yield Prediction + Irrigation (called after prediction)
// =====================================================================
async function fetchYieldAndIrrigation(payload, cropName) {
    try {
        const yRes = await fetch('/api/yield-estimate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (yRes.ok) {
            const y = await yRes.json();
            document.getElementById('yield-value').textContent = y.expected_yield_tons_per_ha;
            document.getElementById('yield-quality').textContent = y.quality_index;
            document.getElementById('yield-revenue').textContent = `₹${y.revenue_estimate_inr.toLocaleString()}`;
            document.getElementById('yield-cost').textContent = `₹${y.fertilizer_cost_estimate_inr.toLocaleString()}`;
            document.getElementById('yield-card').classList.remove('hidden');
        }
    } catch (e) { console.error('Yield error:', e); }

    try {
        const iRes = await fetch('/api/irrigation-schedule', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ crop: cropName, temperature: payload.temperature, humidity: payload.humidity, rainfall: payload.rainfall, soil_type: 'Loamy' })
        });
        if (iRes.ok) {
            const iData = await iRes.json();
            renderIrrigationSchedule(iData);
        }
    } catch (e) { console.error('Irrigation error:', e); }
}

function renderIrrigationSchedule(data) {
    const grid = document.getElementById('irrigation-grid');
    const src = document.getElementById('irrigation-source');
    if (!grid) return;
    if (src) src.textContent = data.source;
    grid.innerHTML = data.schedule.map(day => `
        <div class="irr-day ${day.irrigate ? 'irrigate-yes' : 'irrigate-no'}">
            <div class="irr-day-name">${day.day}</div>
            <div class="irr-icon">${day.irrigate ? '💧' : '☀️'}</div>
            <div class="irr-amount">${day.irrigate ? day.amount_liters_per_sqm + ' L/m²' : 'Rest'}</div>
            <div class="irr-method" style="font-size:0.75rem;color:var(--text-muted)">${day.method !== 'None' ? day.method : ''}</div>
        </div>`).join('');
    document.getElementById('irrigation-card').classList.remove('hidden');
}

// =====================================================================
// PHASE 6: Government Schemes Logic
// =====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    const schemesGrid = document.getElementById('schemes-grid');
    const schemesSearch = document.getElementById('schemes-search');
    const schemesCropFilter = document.getElementById('schemes-crop-filter');
    if (!schemesGrid) return;

    let allSchemes = [];

    async function loadSchemes(crop = '') {
        try {
            const url = crop ? `/api/schemes?crop=${encodeURIComponent(crop)}` : '/api/schemes';
            const res = await fetch(url);
            const data = await res.json();
            allSchemes = data.schemes;
            renderSchemes(allSchemes);
        } catch(e) { schemesGrid.innerHTML = '<p style="color:#ef4444">Failed to load schemes.</p>'; }
    }

    function renderSchemes(schemes) {
        if (!schemes.length) { schemesGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">No schemes found.</p>'; return; }
        schemesGrid.innerHTML = schemes.map(s => `
            <div class="scheme-card glass-card">
                <div class="scheme-icon-wrap">${s.icon}</div>
                <div class="scheme-body">
                    <div class="scheme-header">
                        <h4>${s.name}</h4>
                        <span class="scheme-ministry-tag">${s.ministry.replace('Ministry of ','')}</span>
                    </div>
                    <p class="scheme-full-name">${s.full_name}</p>
                    <div class="scheme-benefit"><span>💰</span><span>${s.benefit}</span></div>
                    <div class="scheme-eligibility"><span>✅</span><span>${s.eligibility}</span></div>
                    <a href="${s.link}" target="_blank" rel="noopener" class="scheme-apply-btn">Apply / Learn More →</a>
                </div>
            </div>`).join('');
    }

    if (schemesSearch) schemesSearch.addEventListener('input', () => {
        const q = schemesSearch.value.toLowerCase();
        renderSchemes(allSchemes.filter(s => s.name.toLowerCase().includes(q) || s.full_name.toLowerCase().includes(q) || s.benefit.toLowerCase().includes(q)));
    });

    if (schemesCropFilter) schemesCropFilter.addEventListener('change', () => loadSchemes(schemesCropFilter.value));

    await loadSchemes();
});

// =====================================================================
// PHASE 8: Save prediction to history
// =====================================================================
function saveToHistory(crop, payload, state = null) {
    const history = JSON.parse(localStorage.getItem('agriclimate_history') || '[]');
    history.push({ crop, state, timestamp: new Date().toISOString(), ...payload });
    if (history.length > 50) history.shift();
    localStorage.setItem('agriclimate_history', JSON.stringify(history));
}

// =====================================================================
// NEW FEATURES — Voice Input, Weather, GPS, Profit Calc, PDF, History
// =====================================================================

// ─── Auth & User State ───────────────────────────────────────────────
(function initUser() {
    const raw = localStorage.getItem('agri_user') || localStorage.getItem('agriclimate_user');
    if (!raw) return;
    try {
        const u = JSON.parse(raw);
        if (u && u.name) {
            // Show welcome banner
            const banner = document.createElement('div');
            banner.id = 'user-welcome-banner';
            banner.style.cssText = `position:fixed;top:70px;right:16px;z-index:9999;
                background:linear-gradient(135deg,rgba(15,74,46,0.95),rgba(10,35,22,0.98));
                border:1px solid rgba(74,222,128,0.25);border-radius:12px;padding:10px 16px;
                font-family:Outfit,sans-serif;font-size:13px;color:#a7f3d0;
                backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);
                display:flex;align-items:center;gap:8px;animation:slideInRight 0.4s ease;`;
            banner.innerHTML = `<span style="font-size:18px">👨‍🌾</span>
                <div><strong style="color:#4ade80">${u.name}</strong>
                <span style="display:block;font-size:11px;opacity:.7">${u.email || 'Guest Mode'}</span></div>
                <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#6ee7b7;cursor:pointer;font-size:16px;margin-left:4px">×</button>`;
            document.body.appendChild(banner);
            setTimeout(() => banner && banner.remove(), 4000);
        }
    } catch(e) {}
})();

// ─── Voice Input (Web Speech API) ────────────────────────────────────
(function initVoiceInput() {
    const voiceBtn = document.getElementById('voice-btn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        voiceBtn.title = 'Voice not supported in this browser';
        voiceBtn.style.opacity = '0.4';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi first
    recognition.continuous = false;
    recognition.interimResults = false;

    let listening = false;

    recognition.onstart = () => {
        listening = true;
        voiceBtn.textContent = '🔴';
        voiceBtn.title = 'Bol raha hoon... (listening)';
        voiceBtn.style.animation = 'pulse 0.8s infinite';
    };

    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = document.getElementById('advisor-input');
        if (input) {
            input.value = transcript;
            input.dispatchEvent(new Event('input'));
            // Auto-submit after voice
            setTimeout(() => {
                const form = document.getElementById('advisor-form');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }, 500);
        }
    };

    recognition.onend = () => {
        listening = false;
        voiceBtn.textContent = '🎤';
        voiceBtn.title = 'Voice input';
        voiceBtn.style.animation = '';
    };

    recognition.onerror = (e) => {
        listening = false;
        voiceBtn.textContent = '🎤';
        voiceBtn.style.animation = '';
        if (e.error !== 'aborted') {
            showToast('🎤 Voice error: ' + e.error, 'warning');
        }
    };

    voiceBtn.addEventListener('click', () => {
        if (listening) {
            recognition.stop();
        } else {
            // Try Hindi first, fallback to en-IN
            recognition.lang = 'hi-IN';
            recognition.start();
        }
    });
})();

// ─── Weather Widget ───────────────────────────────────────────────────
async function loadWeatherWidget(state) {
    if (!state) return;
    const existingWidget = document.getElementById('weather-widget');
    if (existingWidget) existingWidget.remove();

    try {
        const res = await fetch(`/api/weather?state=${encodeURIComponent(state)}`);
        const w = await res.json();

        const widget = document.createElement('div');
        widget.id = 'weather-widget';
        widget.style.cssText = `
            background: linear-gradient(135deg, rgba(6,20,40,0.92), rgba(0,60,30,0.85));
            border: 1px solid rgba(74,222,128,0.2); border-radius: 14px;
            padding: 14px 18px; margin: 12px 0; display: flex;
            align-items: center; justify-content: space-between; gap: 16px;
            backdrop-filter: blur(12px); animation: fadeInUp 0.4s ease;
            flex-wrap: wrap;`;

        const iconMap = {'01d':'☀️','02d':'⛅','03d':'☁️','04d':'☁️','09d':'🌧️','10d':'🌦️','11d':'⛈️','13d':'❄️','50d':'🌫️'};
        const icon = iconMap[w.icon] || '🌤️';
        const isLive = w.source && w.source.includes('Live');

        widget.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:32px">${icon}</span>
                <div>
                    <div style="font-size:20px;font-weight:700;color:#f0fdf4">${w.temperature}°C</div>
                    <div style="font-size:12px;color:#6ee7b7">${w.description}</div>
                    <div style="font-size:11px;color:#4ade80;font-weight:600">${w.city || state}</div>
                </div>
            </div>
            <div style="display:flex;gap:16px;font-size:12px;color:#a7f3d0">
                <div><div style="font-weight:600;color:#4ade80">${w.humidity}%</div><div>Humidity</div></div>
                <div><div style="font-weight:600;color:#4ade80">${w.wind_speed} m/s</div><div>Wind</div></div>
                <div><div style="font-weight:600;color:#4ade80">${w.feels_like}°C</div><div>Feels Like</div></div>
            </div>
            <div style="font-size:10px;color:${isLive?'#34d399':'#6b7280'};text-align:right">
                ${isLive ? '🟢 Live' : '⚪ Simulated'}<br>
                <a href="https://openweathermap.org/api" target="_blank" style="color:#4ade80;font-size:10px;text-decoration:none">${isLive ? 'OpenWeatherMap' : 'Add API key'}</a>
            </div>`;

        // Inject before state analysis section or result box
        const resultBox = document.getElementById('result-box');
        if (resultBox && !resultBox.classList.contains('hidden')) {
            resultBox.insertAdjacentElement('beforebegin', widget);
        } else {
            const stateGrid = document.getElementById('state-data-panel') || document.querySelector('.explore-section');
            if (stateGrid) stateGrid.insertAdjacentElement('afterbegin', widget);
        }
    } catch(e) { /* Weather load failed silently */ }
}

// Hook into state selection if it exists
const origLoadStateData = window.loadStateData;
if (typeof origLoadStateData === 'function') {
    window.loadStateData = function(state) {
        origLoadStateData(state);
        loadWeatherWidget(state);
    };
}

// Also auto-load on state card click
document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-state]');
    if (card && card.dataset.state) loadWeatherWidget(card.dataset.state);
});

// ─── GPS State Auto-Detect in Main App ───────────────────────────────
(function initGPSDetect() {
    // Add GPS detect button near state dropdown if it exists
    const stateDropdowns = document.querySelectorAll('#state-select, #state-selector, select[id*="state"]');
    stateDropdowns.forEach(sel => {
        const gpsBtn = document.createElement('button');
        gpsBtn.type = 'button';
        gpsBtn.id = 'gps-detect-btn';
        gpsBtn.style.cssText = `display:inline-flex;align-items:center;gap:6px;padding:6px 12px;
            background:rgba(22,163,74,0.1);border:1.5px dashed rgba(22,163,74,0.4);border-radius:8px;
            color:#4ade80;font-family:Outfit,sans-serif;font-size:12px;font-weight:600;
            cursor:pointer;transition:all 0.25s;margin-top:6px;width:100%;justify-content:center;`;
        gpsBtn.innerHTML = '📍 GPS se state auto-detect karo';
        gpsBtn.addEventListener('mouseenter', () => { gpsBtn.style.background = 'rgba(22,163,74,0.2)'; });
        gpsBtn.addEventListener('mouseleave', () => { gpsBtn.style.background = 'rgba(22,163,74,0.1)'; });
        gpsBtn.addEventListener('click', async () => {
            gpsBtn.innerHTML = '⏳ Detecting...';
            gpsBtn.disabled = true;
            try {
                const pos = await new Promise((r,j) => navigator.geolocation.getCurrentPosition(r,j,{timeout:8000}));
                const res = await fetch(`/api/location-to-state?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const d = await res.json();
                if (d.state && d.state !== 'Unknown') {
                    for (let i = 0; i < sel.options.length; i++) {
                        if (sel.options[i].text.toLowerCase().includes(d.state.toLowerCase().split(' ')[0])) {
                            sel.selectedIndex = i;
                            sel.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                    showToast(`📍 State detected: ${d.state}`, 'success');
                    loadWeatherWidget(d.state);
                } else showToast('State detect nahi hua — manually choose karo', 'warning');
            } catch(e) { showToast('Location permission denied', 'warning'); }
            gpsBtn.innerHTML = '📍 GPS se state auto-detect karo';
            gpsBtn.disabled = false;
        });
        sel.parentNode.insertBefore(gpsBtn, sel.nextSibling);
    });
})();

// ─── Profit / Loss Calculator Panel ──────────────────────────────────
(function initProfitCalculator() {
    // Find section to inject into (after yield card or schemes)
    const target = document.getElementById('schemes-section') || document.getElementById('market-section');
    if (!target) return;

    const section = document.createElement('section');
    section.id = 'profit-section';
    section.style.cssText = 'padding: 40px 20px; max-width: 900px; margin: 0 auto;';
    section.innerHTML = `
    <div style="text-align:center;margin-bottom:28px">
        <span style="font-size:11px;letter-spacing:2px;color:#4ade80;font-weight:600;text-transform:uppercase">Financial Planning</span>
        <h2 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#f0fdf4;margin-top:8px">
            💹 Profit &amp; Loss <span style="background:linear-gradient(90deg,#4ade80,#fcd34d);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Calculator</span>
        </h2>
        <p style="color:#6ee7b7;font-size:15px;margin-top:8px">Input costs daalo — net profit, ROI aur break-even price instantly pata karo</p>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:28px;backdrop-filter:blur(12px)">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px">
            ${[
                ['💊 Crop Name','profit-crop','text','e.g. Rice'],
                ['🌾 Area (hectares)','profit-area','number','e.g. 2.5'],
                ['🌱 Seed Cost (₹/ha)','profit-seed','number','e.g. 3000'],
                ['🧪 Fertilizer Cost (₹/ha)','profit-fert','number','e.g. 5000'],
                ['💧 Irrigation Cost (₹/ha)','profit-irr','number','e.g. 2000'],
                ['👷 Labor Cost (₹/ha)','profit-labor','number','e.g. 8000'],
            ].map(([lbl,id,type,ph]) => `
                <div>
                    <label style="font-size:12px;font-weight:600;color:#6ee7b7;display:block;margin-bottom:6px">${lbl}</label>
                    <input type="${type}" id="${id}" placeholder="${ph}" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#f0fdf4;font-family:Outfit,sans-serif;font-size:14px;outline:none;transition:border-color 0.2s" onfocus="this.style.borderColor='#22c55e'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                </div>`).join('')}
        </div>
        <button id="calc-profit-btn" onclick="calculateProfit()" style="width:100%;padding:14px;background:linear-gradient(135deg,#16a34a,#22c55e);border:none;border-radius:12px;color:white;font-family:Outfit,sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.3s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
            💹 Calculate Profit / Loss
        </button>
        <div id="profit-result" style="display:none;margin-top:20px;padding:20px;background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);border-radius:14px"></div>
    </div>`;

    target.insertAdjacentElement('beforebegin', section);
})();

window.calculateProfit = async function() {
    const crop = document.getElementById('profit-crop')?.value?.trim();
    const area = parseFloat(document.getElementById('profit-area')?.value);
    const seed = parseFloat(document.getElementById('profit-seed')?.value) || 0;
    const fert = parseFloat(document.getElementById('profit-fert')?.value) || 0;
    const irr  = parseFloat(document.getElementById('profit-irr')?.value) || 0;
    const labor= parseFloat(document.getElementById('profit-labor')?.value) || 0;

    if (!crop || !area) { showToast('Crop name aur area daalo!', 'warning'); return; }

    const btn = document.getElementById('calc-profit-btn');
    btn.innerHTML = '⏳ Calculating...'; btn.disabled = true;

    try {
        const res = await fetch('/api/profit-calculator', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ crop, area_hectares: area, seed_cost: seed, fertilizer_cost: fert, irrigation_cost: irr, labor_cost: labor })
        });
        const d = await res.json();
        const isProfit = d.net_profit_inr >= 0;
        const resultEl = document.getElementById('profit-result');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
            <div style="text-align:center;margin-bottom:16px">
                <div style="font-size:32px">${isProfit ? '✅' : '⚠️'}</div>
                <div style="font-size:24px;font-weight:800;color:${isProfit?'#34d399':'#f87171'}">${d.verdict}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
                ${[
                    ['Total Cost', '₹' + d.total_input_cost_inr.toLocaleString('en-IN'), '#fcd34d'],
                    ['Expected Yield', d.expected_yield_tons + ' tons', '#60a5fa'],
                    ['Gross Revenue', '₹' + d.gross_revenue_inr.toLocaleString('en-IN'), '#a78bfa'],
                    ['Net Profit', '₹' + d.net_profit_inr.toLocaleString('en-IN'), isProfit?'#34d399':'#f87171'],
                    ['ROI', d.roi_percent + '%', isProfit?'#4ade80':'#f87171'],
                    ['Break-even Price', '₹' + d.break_even_price_per_ton + '/ton', '#6ee7b7'],
                ].map(([k,v,c]) => `
                    <div style="text-align:center;padding:12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08)">
                        <div style="font-size:18px;font-weight:700;color:${c}">${v}</div>
                        <div style="font-size:11px;color:#6ee7b7;margin-top:4px">${k}</div>
                    </div>`).join('')}
            </div>
            <div style="margin-top:14px;padding:12px;background:rgba(22,163,74,0.08);border-radius:10px;font-size:13px;color:#a7f3d0">
                💡 <strong>Tip:</strong> ${d.tip}
            </div>`;
    } catch(e) { showToast('Calculation failed — please retry', 'warning'); }
    btn.innerHTML = '💹 Calculate Profit / Loss'; btn.disabled = false;
};

// ─── PDF Report Download ──────────────────────────────────────────────
window.downloadPDFReport = async function() {
    const user = JSON.parse(localStorage.getItem('agri_user') || '{}');
    const crop = document.getElementById('predicted-crop')?.textContent || '';
    const state = document.querySelector('[data-state].selected')?.dataset?.state || '';

    const payload = {
        farmer_name: user.name || 'Farmer',
        state: state,
        crop: crop,
        N: parseFloat(document.getElementById('N')?.value) || null,
        P: parseFloat(document.getElementById('P')?.value) || null,
        K: parseFloat(document.getElementById('K')?.value) || null,
        temperature: parseFloat(document.getElementById('temperature')?.value) || null,
        humidity: parseFloat(document.getElementById('humidity')?.value) || null,
        ph: parseFloat(document.getElementById('ph')?.value) || null,
        rainfall: parseFloat(document.getElementById('rainfall')?.value) || null,
        yield_estimate: parseFloat(document.getElementById('yield-value')?.textContent) || null,
    };

    showToast('📋 PDF generate ho raha hai...', 'info');

    try {
        const res = await fetch('/api/report/download', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        if (!res.ok) { const e = await res.json(); showToast('PDF Error: ' + e.detail, 'warning'); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `AgriReport_${crop}_${new Date().toISOString().slice(0,10)}.pdf`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        showToast('✅ PDF download ho gaya!', 'success');
    } catch(e) { showToast('PDF download failed', 'warning'); }
};

// Wire up existing "Download Soil Card" button to new PDF endpoint
document.addEventListener('DOMContentLoaded', () => {
    const dlBtn = document.getElementById('download-report-btn');
    if (dlBtn) {
        dlBtn.textContent = '📋 Download PDF Report';
        dlBtn.onclick = (e) => { e.preventDefault(); downloadPDFReport(); };
    }
});

// ─── Price Trend Panel ────────────────────────────────────────────────
window.showPriceTrend = async function(crop) {
    if (!crop) return;
    let panel = document.getElementById('price-trend-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'price-trend-panel';
        panel.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9000;width:340px;max-height:400px;overflow:auto;background:rgba(6,11,20,0.97);border:1px solid rgba(74,222,128,0.2);border-radius:16px;padding:20px;backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:slideInLeft 0.3s ease';
        document.body.appendChild(panel);
    }
    panel.innerHTML = '<div style="color:#6ee7b7;font-size:13px;text-align:center;padding:20px">⏳ Loading trend...</div>';
    try {
        const res = await fetch(`/api/price-trend/${encodeURIComponent(crop)}`);
        const d = await res.json();
        const isRising = d.slope_per_day > 0;
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
                <div><div style="font-size:15px;font-weight:700;color:#f0fdf4">📈 ${d.crop} Price Trend</div>
                <div style="font-size:11px;color:#6ee7b7">30-day history + 7-day forecast</div></div>
                <button onclick="this.closest('#price-trend-panel').remove()" style="background:none;border:none;color:#6ee7b7;cursor:pointer;font-size:18px">×</button>
            </div>
            <div style="display:flex;gap:12px;margin-bottom:14px">
                <div style="flex:1;text-align:center;padding:10px;background:rgba(22,163,74,0.1);border-radius:10px">
                    <div style="font-size:18px;font-weight:700;color:#4ade80">₹${d.current_modal.toLocaleString('en-IN')}</div>
                    <div style="font-size:11px;color:#6ee7b7">Current Modal</div>
                </div>
                <div style="flex:1;text-align:center;padding:10px;background:rgba(22,163,74,0.1);border-radius:10px">
                    <div style="font-size:18px;font-weight:700;color:${d.signal.includes('BUY')?'#34d399':d.signal.includes('SELL')?'#f87171':'#fbbf24'}">${d.signal}</div>
                    <div style="font-size:11px;color:#6ee7b7">AI Signal</div>
                </div>
            </div>
            <div style="font-size:11px;color:#6ee7b7;margin-bottom:8px">
                Trend: <strong style="color:#4ade80">${d.trend.toUpperCase()}</strong> · 
                Slope: <strong style="color:${isRising?'#34d399':'#f87171'}">${isRising?'+':''}${d.slope_per_day} ₹/day</strong>
            </div>
            <div style="max-height:180px;overflow-y:auto">
            ${[...d.history.slice(-7), ...d.forecast].map(h => `
                <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px">
                    <span style="color:${h.forecast?'#fcd34d':'#a7f3d0'}">${h.date}${h.forecast?' 🔮':''}</span>
                    <span style="font-weight:600;color:${h.forecast?'#fcd34d':'#f0fdf4'}">₹${h.price.toLocaleString('en-IN')}</span>
                </div>`).join('')}
            </div>`;
    } catch(e) { panel.innerHTML = '<div style="color:#f87171;text-align:center;padding:20px">Failed to load trend data</div>'; }
};

// Hook price trend to market price cards if they exist
document.addEventListener('click', (e) => {
    const card = e.target.closest('.market-card, .price-card');
    if (card) {
        const crop = card.dataset.crop || card.querySelector('h4, .crop-name')?.textContent?.trim();
        if (crop) showPriceTrend(crop);
    }
});

// ─── Toast Notification Helper ────────────────────────────────────────
window.showToast = function(msg, type = 'info') {
    const existing = document.getElementById('agri-toast');
    if (existing) existing.remove();

    const colors = { success: '#34d399', warning: '#fbbf24', error: '#f87171', info: '#60a5fa' };
    const icons  = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.id = 'agri-toast';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;
        background:rgba(6,20,40,0.97);border:1px solid ${colors[type]};border-radius:12px;
        padding:12px 18px;font-family:Outfit,sans-serif;font-size:14px;color:#f0fdf4;
        backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.4);
        display:flex;align-items:center;gap:10px;max-width:340px;
        animation:slideInRight 0.35s ease;`;
    toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => { if (toast.parentNode) { toast.style.animation='fadeOut 0.3s ease'; setTimeout(()=>toast.remove(),300); } }, 3500);
};

// ─── CSS Animations inject ────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideInLeft  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeInUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeOut      { from{opacity:1} to{opacity:0;transform:translateY(10px)} }
@keyframes pulse        { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
#gps-detect-btn { margin-top:8px !important; }
`;
document.head.appendChild(style);
