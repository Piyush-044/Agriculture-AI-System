/**
 * Phase 7: Multi-Language Support (Hindi / English)
 * AgriClimate AI — translations.js
 */

const TRANSLATIONS = {
    en: {
        nav_dashboard: "Dashboard",
        nav_disease: "Disease AI",
        nav_calendar: "Crop Calendar",
        nav_market: "Market Prices",
        nav_schemes: "Gov Schemes",
        nav_map: "Satellite Map",
        nav_history: "My Dashboard",
        nav_logout: "Logout",
        hero_title: "Predict the Best Crop for your Land",
        hero_subtitle: "Leverage cutting-edge Machine Learning and real-time climatic intelligence to optimize your agricultural yield.",
        predict_btn: "Analyze & Predict",
        disease_subtitle: "Upload a photo of your crop leaf to get instant AI-powered disease diagnosis and treatment advice.",
        upload_title: "Drop or Click to Upload Crop Image",
        upload_subtitle: "Supports JPG, PNG — Max 10MB",
        crop_hint_label: "Crop Name (Optional, improves accuracy)",
        calendar_subtitle: "Monthly planting & harvesting guide for every Indian state. Select a state to see its seasonal crop cycle.",
        market_subtitle: "Live mandi prices across India — track trends, compare crops, sell at the best price.",
        schemes_subtitle: "Discover PM-KISAN, Fasal Bima, Soil Health Card, and 7 more central government schemes for Indian farmers.",
        explore_title: "Explore Data",
        explore_subtitle: "Click on an Indian state to instantly analyze its historical weather, verify soil dynamics, and predict the best optimal crop.",
    },
    hi: {
        nav_dashboard: "डैशबोर्ड",
        nav_disease: "रोग AI",
        nav_calendar: "फसल कैलेंडर",
        nav_market: "मंडी भाव",
        nav_schemes: "सरकारी योजनाएं",
        nav_map: "उपग्रह मानचित्र",
        nav_history: "मेरा डैशबोर्ड",
        nav_logout: "लॉगआउट",
        hero_title: "अपनी जमीन के लिए सर्वश्रेष्ठ फसल चुनें",
        hero_subtitle: "ML और वास्तविक समय के मौसम डेटा से अपनी फसल उत्पादकता बढ़ाएं।",
        predict_btn: "विश्लेषण करें और अनुमान लगाएं",
        disease_subtitle: "फसल की पत्ती की फोटो अपलोड करें और AI से तुरंत रोग निदान पाएं।",
        upload_title: "फसल की छवि अपलोड करें",
        upload_subtitle: "JPG, PNG समर्थित — अधिकतम 10MB",
        crop_hint_label: "फसल का नाम (वैकल्पिक, सटीकता बढ़ाता है)",
        calendar_subtitle: "हर भारतीय राज्य के लिए मासिक बुआई और कटाई मार्गदर्शिका।",
        market_subtitle: "पूरे भारत में मंडी भाव — रुझान ट्रैक करें, सर्वोत्तम मूल्य पर बेचें।",
        schemes_subtitle: "PM-KISAN, फसल बीमा, मृदा स्वास्थ्य कार्ड और 7 और सरकारी योजनाएं जानें।",
        explore_title: "डेटा एक्सप्लोर करें",
        explore_subtitle: "किसी भारतीय राज्य पर क्लिक करें और तुरंत मिट्टी व मौसम विश्लेषण पाएं।",
    }
};

let currentLang = localStorage.getItem('agriclimate_lang') || 'en';

function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('agriclimate_lang', lang);
    document.documentElement.setAttribute('data-lang', lang);

    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    // Apply data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // Update language toggle button
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = lang === 'en' ? '🌐 हिंदी' : '🌐 EN';
    }

    // Update hero section dynamically
    const heroH2 = document.querySelector('.hero-content h2');
    if (heroH2 && dict.hero_title) {
        const highlight = heroH2.querySelector('.highlight');
        const highlightText = highlight ? highlight.textContent : '';
        // Keep highlight span if present
        if (lang === 'hi') {
            heroH2.innerHTML = 'अपनी जमीन के लिए <span class="highlight">सर्वश्रेष्ठ फसल</span> चुनें';
        } else {
            heroH2.innerHTML = 'Predict the <span class="highlight">Best Crop</span> for your Land';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations(currentLang);

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'hi' : 'en';
            applyTranslations(newLang);
        });
    }
});
