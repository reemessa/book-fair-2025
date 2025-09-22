// Publisher data will be loaded dynamically from CSV
let publishersData = [];

// Global variables
let allPublishers = publishersData;
let filteredPublishers = publishersData;
let favorites = JSON.parse(localStorage.getItem('bookFairFavorites')) || [];
let currentView = 'grid';

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sectionFilter = document.getElementById('sectionFilter');
const countryFilter = document.getElementById('countryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const publishersContainer = document.getElementById('publishersContainer');
const noResults = document.getElementById('noResults');
const totalPublishers = document.getElementById('totalPublishers');
const totalCountries = document.getElementById('totalCountries');
const favoritesCount = document.getElementById('favoritesCount');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesList = document.getElementById('favoritesList');
const clearFavoritesBtn = document.getElementById('clearFavorites');
const gridViewBtn = document.getElementById('gridView');
const listViewBtn = document.getElementById('listView');
const showMapBtn = document.getElementById('showMapBtn');
const mapModal = document.getElementById('mapModal');
const closeModal = document.querySelector('.close');

// CSV parsing function
async function loadPublishersFromCSV() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const publishersContainer = document.getElementById('publishersContainer');

    try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        publishersContainer.style.display = 'none';

        const response = await fetch('combined_publishers.csv');
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        publishersData = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = parseCSVLine(line);

                if (values.length >= 3) {
                    const publisher = {
                        booth: values[0],
                        name: values[1],
                        country: values[2],
                        section: values[3] || values[0].charAt(0) // Extract section from booth ID
                    };
                    publishersData.push(publisher);
                }
            }
        }

        // Update global variables
        allPublishers = publishersData;
        filteredPublishers = publishersData;

        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        publishersContainer.style.display = 'grid';

        // Initialize the app with loaded data
        renderPublishers(allPublishers);
        updateStatistics();
        populateMap();
        updateFavoritesDisplay();

        console.log(`Loaded ${publishersData.length} publishers from CSV`);

    } catch (error) {
        console.error('Error loading publishers from CSV:', error);

        // Hide loading indicator and show error
        loadingIndicator.innerHTML = '<p>❌ خطأ في تحميل البيانات</p>';

        // Fallback to empty data
        publishersData = [];
        allPublishers = [];
        filteredPublishers = [];
        renderPublishers([]);
    }
}

// Helper function to parse CSV line with proper comma handling
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add the last field
    result.push(current.trim());

    return result;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPublishersFromCSV();
});

// Event listeners
searchInput.addEventListener('input', filterPublishers);
searchBtn.addEventListener('click', filterPublishers);
sectionFilter.addEventListener('change', filterPublishers);
countryFilter.addEventListener('change', filterPublishers);
clearFiltersBtn.addEventListener('click', clearFilters);
clearFavoritesBtn.addEventListener('click', clearFavorites);
gridViewBtn.addEventListener('click', () => switchView('grid'));
listViewBtn.addEventListener('click', () => switchView('list'));
showMapBtn.addEventListener('click', () => mapModal.style.display = 'block');
closeModal.addEventListener('click', () => mapModal.style.display = 'none');

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === mapModal) {
        mapModal.style.display = 'none';
    }
});

// Functions
function renderPublishers(publishers) {
    publishersContainer.innerHTML = '';

    if (publishers.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    publishers.forEach(publisher => {
        const publisherCard = createPublisherCard(publisher);
        publishersContainer.appendChild(publisherCard);
    });

    // Apply current view
    publishersContainer.className = currentView === 'grid' ? 'publishers-grid' : 'publishers-list';
}

function createPublisherCard(publisher) {
    const card = document.createElement('div');
    card.className = `publisher-card ${favorites.includes(publisher.booth) ? 'favorite' : ''}`;

    const isFavorite = favorites.includes(publisher.booth);
    const heartIcon = isFavorite ? '❤️' : '🤍';

    card.innerHTML = `
        <div class="publisher-header">
            <span class="booth-number">${publisher.booth}</span>
            <button class="favorite-btn" onclick="toggleFavorite('${publisher.booth}')">${heartIcon}</button>
        </div>
        <h3 class="publisher-name">${publisher.name}</h3>
        <div class="publisher-country">${getCountryFlag(publisher.country)} ${publisher.country}</div>
    `;

    return card;
}

function toggleFavorite(boothNumber) {
    const index = favorites.indexOf(boothNumber);

    if (index === -1) {
        favorites.push(boothNumber);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('bookFairFavorites', JSON.stringify(favorites));
    renderPublishers(filteredPublishers);
    updateFavoritesDisplay();
    updateStatistics();
}

function filterPublishers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedSection = sectionFilter.value;
    const selectedCountry = countryFilter.value;

    filteredPublishers = allPublishers.filter(publisher => {
        const matchesSearch = publisher.name.toLowerCase().includes(searchTerm) ||
                            publisher.booth.toLowerCase().includes(searchTerm);
        const matchesSection = !selectedSection || publisher.section === selectedSection;
        const matchesCountry = !selectedCountry || publisher.country === selectedCountry;

        return matchesSearch && matchesSection && matchesCountry;
    });

    renderPublishers(filteredPublishers);
}

function clearFilters() {
    searchInput.value = '';
    sectionFilter.value = '';
    countryFilter.value = '';
    filteredPublishers = allPublishers;
    renderPublishers(filteredPublishers);
}

function switchView(view) {
    currentView = view;

    gridViewBtn.classList.toggle('active', view === 'grid');
    listViewBtn.classList.toggle('active', view === 'list');

    publishersContainer.className = view === 'grid' ? 'publishers-grid' : 'publishers-list';
}

function updateStatistics() {
    const uniqueCountries = [...new Set(allPublishers.map(p => p.country))];

    totalPublishers.textContent = allPublishers.length;
    totalCountries.textContent = uniqueCountries.length;
    favoritesCount.textContent = favorites.length;
}

function updateFavoritesDisplay() {
    if (favorites.length === 0) {
        favoritesSection.style.display = 'none';
        return;
    }

    favoritesSection.style.display = 'block';
    favoritesList.innerHTML = '';

    const favoritePublishers = allPublishers.filter(p => favorites.includes(p.booth));

    favoritePublishers.forEach(publisher => {
        const card = createPublisherCard(publisher);
        favoritesList.appendChild(card);
    });

    favoritesList.className = 'publishers-grid';
}

function clearFavorites() {
    if (confirm('هل أنت متأكد من أنك تريد مسح جميع المفضلة؟')) {
        favorites = [];
        localStorage.setItem('bookFairFavorites', JSON.stringify(favorites));
        renderPublishers(filteredPublishers);
        updateFavoritesDisplay();
        updateStatistics();
    }
}

function populateMap() {
    const hallA = document.getElementById('hallA');
    const hallB = document.getElementById('hallB');
    const hallC = document.getElementById('hallC');

    // Clear existing content
    hallA.innerHTML = '';
    hallB.innerHTML = '';
    hallC.innerHTML = '';

    // Group publishers by section
    const sectionA = allPublishers.filter(p => p.section === 'A');
    const sectionB = allPublishers.filter(p => p.section === 'B');
    const sectionC = allPublishers.filter(p => p.section === 'C');

    // Populate each hall
    sectionA.forEach(publisher => {
        const booth = createBoothElement(publisher);
        hallA.appendChild(booth);
    });

    sectionB.forEach(publisher => {
        const booth = createBoothElement(publisher);
        hallB.appendChild(booth);
    });

    sectionC.forEach(publisher => {
        const booth = createBoothElement(publisher);
        hallC.appendChild(booth);
    });
}

function createBoothElement(publisher) {
    const booth = document.createElement('div');
    booth.className = `booth ${favorites.includes(publisher.booth) ? 'favorite' : ''}`;
    booth.textContent = publisher.booth;
    booth.title = `${publisher.name} - ${getCountryFlag(publisher.country)} ${publisher.country}`;

    booth.addEventListener('click', () => {
        // Highlight the publisher in the main list
        searchInput.value = publisher.name;
        sectionFilter.value = publisher.section;
        countryFilter.value = '';
        filterPublishers();
        mapModal.style.display = 'none';

        // Scroll to the publishers section
        document.querySelector('.publishers-section').scrollIntoView({
            behavior: 'smooth'
        });
    });

    return booth;
}

// Additional utility functions
function getCountryFlag(country) {
    const flags = {
        'الأردن': '🇯🇴',
        'مصر': '🇪🇬',
        'لبنان': '🇱🇧',
        'سوريا': '🇸🇾',
        'فلسطين': '🇵🇸',
        'الإمارات العربية المتحدة': '🇦🇪',
        'الكويت': '🇰🇼',
        'السعودية': '🇸🇦',
        'قطر': '🇶🇦',
        'المغرب': '🇲🇦',
        'تركيا': '🇹🇷',
        'كندا': '🇨🇦',
        'الصين': '🇨🇳',
        'المملكة المتحدة': '🇬🇧',
        'سلطنة عمان': '🇴🇲'
    };

    return flags[country] || '🌍';
}

// Export functionality for potential future use
function exportFavorites() {
    const favoritePublishers = allPublishers.filter(p => favorites.includes(p.booth));
    const csv = 'الجناح,دار النشر,البلد\n' +
                favoritePublishers.map(p => `${p.booth},"${p.name}","${getCountryFlag(p.country)} ${p.country}"`).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'book_fair_favorites.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print functionality
function printFavorites() {
    const favoritePublishers = allPublishers.filter(p => favorites.includes(p.booth));

    if (favoritePublishers.length === 0) {
        alert('لا توجد مفضلة للطباعة');
        return;
    }

    const printContent = `
        <html>
        <head>
            <title>قائمة المفضلة - معرض عمان للكتاب</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; }
                h1 { color: #667eea; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                th { background-color: #f8f9fa; }
            </style>
        </head>
        <body>
            <h1>🏛️ قائمة المفضلة - معرض عمان للكتاب</h1>
            <table>
                <thead>
                    <tr><th>الجناح</th><th>دار النشر</th><th>البلد</th></tr>
                </thead>
                <tbody>
                    ${favoritePublishers.map(p =>
                        `<tr><td>${p.booth}</td><td>${p.name}</td><td>${getCountryFlag(p.country)} ${p.country}</td></tr>`
                    ).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}