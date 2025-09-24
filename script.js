// Publisher data will be loaded dynamically from CSV
let publishersData = [];

// Global variables
let allPublishers = publishersData;
let filteredPublishers = publishersData;
let favorites = JSON.parse(localStorage.getItem('bookFairFavorites')) || [];
let currentView = 'grid';

// DOM elements
const searchInput = document.getElementById('searchInput');
const sectionFilter = document.getElementById('sectionFilter');
const countryFilter = document.getElementById('countryFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const publishersContainer = document.getElementById('publishersContainer');
const noResults = document.getElementById('noResults');
const favoritesCount = document.getElementById('favoritesCount');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesList = document.getElementById('favoritesList');
const clearFavoritesBtn = document.getElementById('clearFavorites');
const gridViewBtn = document.getElementById('gridView');
const listViewBtn = document.getElementById('listView');
const showMapBtn = document.getElementById('showMapBtn');
const mapModal = document.getElementById('mapModal');
const closeModal = document.querySelector('.close');

// XMLHttpRequest fallback for older mobile browsers
function fetchWithXHR(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({
                    ok: true,
                    status: xhr.status,
                    statusText: xhr.statusText,
                    text: () => Promise.resolve(xhr.responseText)
                });
            } else {
                reject(new Error(`XHR error! status: ${xhr.status}`));
            }
        };
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.send();
    });
}

function isInstagramBrowser() {
    
     const userAgent = navigator.userAgent.toLowerCase();
     
       console.log('userAgent' + userAgent);
    
    // Check for Instagram's in-app browser identifiers
    return userAgent.includes('instagram') || 
           userAgent.includes('fbav') || // Facebook app (Instagram uses similar)
           userAgent.includes('fban'); 
}

// CSV parsing function
async function loadPublishersFromCSV() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const publishersContainer = document.getElementById('publishersContainer');

    console.log('🔍 Starting CSV load...');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 Browser:', navigator.appName, navigator.appVersion);

    try {
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        publishersContainer.style.display = 'none';

        console.log('📡 Fetching CSV file...');

        // Try fetch with different approaches for mobile compatibility
        const cacheBuster = '?v=' + Date.now();renderPublishers(allPublishers);
        const csvUrl = 'combined_publishers.csv' + cacheBuster;
    
    if (isInstagramBrowser()) {
        // Add cache-busting to avoid Instagram caching issues
        csvUrl += '?v=' + Date.now();
    }

        let response;
        try {
            response = await fetch(csvUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
        } catch (fetchError) {
            console.log('⚠️ Modern fetch failed, trying XMLHttpRequest fallback...', fetchError);
            // Fallback to XMLHttpRequest for older mobile browsers
            response = await fetchWithXHR(csvUrl);
        }

        console.log('📊 Response status:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log('📄 CSV loaded, length:', csvText.length);

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        console.log('📋 Headers:', headers);
        console.log('📊 Total lines:', lines.length);

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

        console.log('📚 Parsed publishers:', publishersData.length);
        
            
            const fallbackPublishers = [
        { booth: "A1", name: "الدار الأهلية للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A3", name: "وزارة الثقافة والرياضة والشباب - سلطنة عمان", country: "سلطنة عمان", section: "A" },
        { booth: "A4", name: "جمعية المحافظة على القرآن الكريم", country: "الأردن", section: "A" },
        { booth: "A5", name: "عصير الكتب", country: "مصر", section: "A" },
        { booth: "A6", name: "شركة تراس الحياة", country: "الأردن", section: "A" },
        { booth: "A7", name: "دار الكتب الجامعية", country: "الأردن", section: "A" },
        { booth: "A8", name: "مكتبة الغائب", country: "الأردن", section: "A" },
        { booth: "A9", name: "مكتبة الرشد", country: "السعودية", section: "A" },
        { booth: "A10", name: "مؤسسة إبداع للإعلام والنشر", country: "مصر", section: "A" },
        { booth: "A11", name: "هوم إبليد تراينينغ", country: "لبنان", section: "A" },
        { booth: "A12", name: "شركة دار مكتبة المعارف ناشرون", country: "لبنان", section: "A" },
        { booth: "A13", name: "جمعية دار الكتاب المقدس", country: "الأردن", section: "A" },
        { booth: "A14", name: "العلم للجميع-البرنامج للقنوات والملفات", country: "الأردن", section: "A" },
        { booth: "A15", name: "هيئة الشارقة", country: "الإمارات العربية المتحدة", section: "A" },
        { booth: "A16", name: "وزارة الثقافة الفلسطينية", country: "فلسطين", section: "A" },
        { booth: "A17", name: "مركز البحوث والدراسات العلمانية في جامعة آل البيت", country: "الأردن", section: "A" },
        { booth: "A18", name: "معهد الخالد للفكر الإسلامي", country: "الأردن", section: "A" },
        { booth: "A19", name: "دار الرياحين للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A20", name: "مركز التفكير والتطوير التربوي", country: "الأردن", section: "A" },
        { booth: "A21", name: "دار أصالة للنشر", country: "لبنان", section: "A" },
        { booth: "A22", name: "مركز إيصار للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A23", name: "دار رسلان / دار علاء الدين", country: "سوريا", section: "A" },
        { booth: "A25", name: "زيزم ناشرون وموزعون", country: "الأردن", section: "A" },
        { booth: "A26", name: "المركز العربي للأبحاث ودراسة السياسات", country: "قطر", section: "A" },
        { booth: "A27", name: "المجلس الوطني للثقافة والفنون والآداب", country: "الكويت", section: "A" },
        { booth: "A28", name: "دار النشر لجامعة يكين لإعتماد المعلمين", country: "الصين", section: "A" },
        { booth: "A29", name: "وزارة الإعلام-دولة الكويت", country: "الكويت", section: "A" },
        { booth: "A30", name: "دار الجندي للنشر والتوزيع", country: "فلسطين", section: "A" },
        { booth: "A31", name: "فنون التعليم للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A32", name: "دار الفكر للطباعة والنشر والتوزيع", country: "سوريا", section: "A" },
        { booth: "A33", name: "منشدي المعارف", country: "لبنان", section: "A" },
        { booth: "A34", name: "نور حوران للدراسات والنشر والتراث", country: "سوريا", section: "A" },
        { booth: "A35", name: "الدار المصرية اللبنانية", country: "مصر", section: "A" },
        { booth: "A36", name: "دار عالم الثقافة للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A37", name: "دار عليدا للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A38", name: "دار مكتبون الدولية للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A39", name: "دار ألفا للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A40", name: "شركة الناشر للدعاية والإعلان ودار أطباق للنشر والتوزيع", country: "فلسطين", section: "A" },
        { booth: "A41", name: "دار التراقدين", country: "لبنان", section: "A" },
        { booth: "A42", name: "دار اللؤلؤة للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A43", name: "شركة الوراق للنشر المحدودة", country: "المملكة المتحدة", section: "A" },
        { booth: "A44", name: "دار صفحافة للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A45", name: "كتب نون:مؤسسة تاهد الشؤا الثقافية", country: "كندا", section: "A" },
        { booth: "A46", name: "جبل عمان ناشرون", country: "الأردن", section: "A" },
        { booth: "A47", name: "دار الرواية العربية للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A48", name: "داريابا العلمية للنشر", country: "الأردن", section: "A" },
        { booth: "A49", name: "المركز المصري لتنسيط العلوم", country: "مصر", section: "A" },
        { booth: "A50", name: "دار البنية للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A51", name: "دار ورود للنشر والتوزيع", country: "سوريا", section: "A" },
        { booth: "A52", name: "دار الساق للتوزيع والنشر", country: "لبنان", section: "A" },
        { booth: "A53", name: "شركة كيان للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A54", name: "دار المستقبل للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A55", name: "دار المشرق العربي", country: "مصر", section: "A" },
        { booth: "A56", name: "مكتبة سمير منصور للطباعة والنشر والتوزيع", country: "فلسطين", section: "A" },
        { booth: "A57", name: "آفاق للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A58", name: "دار الأسماء للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A59", name: "دار الثقافة العربية الإسلامية للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A60", name: "دار مرمريس للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "A61", name: "كنوبيا", country: "مصر", section: "A" },
        { booth: "A62", name: "دار ممدوح عدوان للنشر والتوزيع", country: "سوريا", section: "A" },
        { booth: "A63", name: "الهيئة العامة لتدبير القرآن الكريم", country: "قطر", section: "A" },
        { booth: "A64", name: "دار الغين للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A65", name: "أقلام عربية للنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A66", name: "بيت الحكمة للنشر", country: "سوريا", section: "A" },
        { booth: "A67", name: "الشبكة العربية للأبحاث والنشر", country: "لبنان", section: "A" },
        { booth: "A68", name: "دار بيروت للطباعة والنشر والترجمة والتوزيع", country: "مصر", section: "A" },
        { booth: "A69", name: "شركة نسمات للتكنولوجيا المعلومات والنشر والتوزيع", country: "مصر", section: "A" },
        { booth: "A70", name: "دار ربيع للنشر ( إمارات سوريا )", country: "الإمارات العربية المتحدة", section: "A" },
        { booth: "A71", name: "أوست ماكولي للنشر", country: "الإمارات العربية المتحدة", section: "A" },
        { booth: "A72", name: "مركز التوثيق الملكي", country: "الأردن", section: "A" },
        { booth: "A73", name: "الهيئة الجامعة المصرية للكتاب", country: "مصر", section: "A" },
        { booth: "A74", name: "دار كنوز المعرفة للنشر والتوزيع", country: "الأردن", section: "A" },
        { booth: "B1", name: "دار فضاءات للنشر والتوزيع", country: "الأردن", section: "B" },
        { booth: "B2", name: "دار الرؤية للدراسات والنشر", country: "فلسطين", section: "B" },
        { booth: "B3", name: "منشورات العمل", country: "الإمارات العربية المتحدة", section: "B" },
        { booth: "B4", name: "رابطة الكتاب الأردنيين", country: "الأردن", section: "B" },
        { booth: "B5", name: "دار منار الفكر للنشر والتوزيع", country: "تركيا", section: "B" },
        { booth: "B6", name: "ما سنر للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B7", name: "المركز العربي للدراسات والبحوث العلمية للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B8", name: "مجموعة زاد للنشر", country: "السعودية", section: "B" },
        { booth: "B9", name: "اتحاد الكتاب الأردنيين", country: "الأردن", section: "B" },
        { booth: "B10", name: "دار الناهر للنشر والتوزيع", country: "لبنان", section: "B" },
        { booth: "B11", name: "مؤسسة دار المعارف", country: "مصر", section: "B" },
        { booth: "B12", name: "دار العصماء", country: "سوريا", section: "B" },
        { booth: "B13", name: "السراج للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B14", name: "دار ابن عباس للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B15", name: "مركز الأدب العربي للنشر والتوزيع", country: "السعودية", section: "B" },
        { booth: "B16", name: "مركز الرتونة للدراسات والاستشارات", country: "لبنان", section: "B" },
        { booth: "B17", name: "وزارة الثقافة الأردنية - مركز البيع", country: "الأردن", section: "B" },
        { booth: "B18", name: "دار الشروق للنشر والتوزيع", country: "الأردن", section: "B" },
        { booth: "B19", name: "دار المعرفة للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B20", name: "شركة مديا برونتك للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B21", name: "ديوان العرب للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B41", name: "دار الغرابي", country: "لبنان", section: "B" },
        { booth: "B42", name: "اتقان للخدمات التربوية", country: "الأردن", section: "B" },
        { booth: "B43", name: "مكتبة الولاء الشيخ للتراث", country: "مصر", section: "B" },
        { booth: "B44", name: "دار العلم والإيمان للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B45", name: "أطفال ومعلمون للنشر والتوزيع", country: "الإمارات العربية المتحدة", section: "B" },
        { booth: "B46", name: "شركة الإبداع الفكري للنشر والتوزيع", country: "الكويت", section: "B" },
        { booth: "B47", name: "دار الفارس للنشر والتوزيع", country: "الأردن", section: "B" },
        { booth: "B48", name: "دار سبيل للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B49", name: "إنسيكلوبيديا", country: "لبنان", section: "B" },
        { booth: "B50", name: "دار كلمات", country: "الكويت", section: "B" },
        { booth: "B51", name: "دار شهرزاد للنشر والتوزيع", country: "الأردن", section: "B" },
        { booth: "B52", name: "زهمة كتاب للثقافة والنشر", country: "مصر", section: "B" },
        { booth: "B53", name: "دار فاروس للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B54", name: "دار الجامعة الجديدة", country: "مصر", section: "B" },
        { booth: "B55", name: "شركة واحة الإبداء للحلول التعليمية", country: "الأردن", section: "B" },
        { booth: "B56", name: "الزاوي للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B57", name: "مؤسسة المصادر للدراسات والنشر", country: "تركيا", section: "B" },
        { booth: "B58", name: "دار الإرشاد للنشر", country: "سوريا", section: "B" },
        { booth: "B59", name: "الروصيل للطباعة والنشر والتوزيع ج.م.ع", country: "الإمارات العربية المتحدة", section: "B" },
        { booth: "B60", name: "مؤسسة خوريو الدولية", country: "مصر", section: "B" },
        { booth: "B61", name: "دار المعرفة", country: "سوريا", section: "B" },
        { booth: "B62", name: "دار كتاب للنشر والتوزيع", country: "مصر", section: "B" },
        { booth: "B63", name: "مبادرات للأبحاث والنشر", country: "مصر", section: "B" },
        { booth: "B64", name: "بوليمجه للنشر والتوزيع ج.م.ع", country: "الإمارات العربية المتحدة", section: "B" },
        { booth: "C1", name: "وزارة الثقافة الأردنية + المكتبة الوطنية", country: "الأردن", section: "C" },
        { booth: "C2", name: "أمانة عمان الكبرى", country: "الأردن", section: "C" },
        { booth: "C3", name: "دائرة الثقافة بالشارقة", country: "الإمارات العربية المتحدة", section: "C" },
        { booth: "C4", name: "المجلس العشائري الشركسي الأردني", country: "الأردن", section: "C" },
        { booth: "C5", name: "اتحاد العام للكتاب والأدباء الفلسطينيين", country: "فلسطين", section: "C" },
        { booth: "C6", name: "جمعية يوم القدس", country: "الأردن", section: "C" },
        { booth: "C7", name: "دار المعين للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C8", name: "مؤسسة إبداع للترجمة والنشر والتوزيع", country: "مصر", section: "C" },
        { booth: "C9", name: "مكتبة الثافة", country: "مصر", section: "C" },
        { booth: "C10", name: "دار الماج القويم للنشر والتوزيع", country: "سوريا", section: "C" },
        { booth: "C11", name: "المكتبة العربية ناشرون", country: "لبنان", section: "C" },
        { booth: "C12", name: "دار السدرة للنشر", country: "مصر", section: "C" },
        { booth: "C13", name: "دار شمس للنشر والتوزيع", country: "الإمارات العربية المتحدة", section: "C" },
        { booth: "C14", name: "دار أثر للنشر والتوزيع", country: "السعودية", section: "C" },
        { booth: "C15", name: "دار آل ياسر للطباعة والنشر", country: "سوريا", section: "C" },
        { booth: "C16", name: "وزارة الثقافة - قطر", country: "قطر", section: "C" },
        { booth: "C17", name: "الدار العربية للعلوم ناشرون", country: "لبنان", section: "C" },
        { booth: "C18", name: "شركة دار المهل ناشرون ذ.م.م", country: "الأردن", section: "C" },
        { booth: "C19", name: "دار الغوثاني", country: "سوريا", section: "C" },
        { booth: "C20", name: "مركز المخروسة للنشر والخدمات الصحفية والمعلومات", country: "مصر", section: "C" },
        { booth: "C21", name: "ألف باء تاء للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C22", name: "دار صفاء للطباعة والنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C23", name: "مركز دراسات الوحدة العربية", country: "لبنان", section: "C" },
        { booth: "C24", name: "دار شان للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C25", name: "دار فيرست بولث للنشر والتوزيع", country: "مصر", section: "C" },
        { booth: "C26", name: "نوفا بلس للنشر والتوزيع", country: "الكويت", section: "C" },
        { booth: "C27", name: "السلوى للدراسات والنشر", country: "الأردن", section: "C" },
        { booth: "C28", name: "مؤسسة الوراق للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C29", name: "دايموند للنشر والتوزيع", country: "مصر", section: "C" },
        { booth: "C30", name: "دار الماج للنشر والتوزيع", country: "السعودية", section: "C" },
        { booth: "C31", name: "شركة المطبوعات للتوزيع والنشر", country: "لبنان", section: "C" },
        { booth: "C32", name: "دار كنوز إشبيليا", country: "السعودية", section: "C" },
        { booth: "C33", name: "دار أسامة للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C34", name: "المركز الأكاديمي للطباعة والنشر", country: "مصر", section: "C" },
        { booth: "C35", name: "دار الفرقد للنشر والتوزيع", country: "سوريا", section: "C" },
        { booth: "C36", name: "دار التطبيق للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C37", name: "نهضة مصر للنشر", country: "مصر", section: "C" },
        { booth: "C38", name: "كيان للنشر kayan publishing", country: "مصر", section: "C" },
        { booth: "C39", name: "دار البارودي العلمية للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C40", name: "دار نيبوى للدراسات والنشر والتوزيع", country: "سوريا", section: "C" },
        { booth: "C41", name: "دار رهدي للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C42", name: "دار البيروقى للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C43", name: "دار سفيان للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C44", name: "دار ارتقاء للنشر والتوزيع", country: "الإمارات العربية المتحدة", section: "C" },
        { booth: "C45", name: "الدواية الذهبية", country: "لبنان", section: "C" },
        { booth: "C46", name: "دار الياسمين للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C47", name: "دار أمنة للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C48", name: "الشركة المصرية للاستيراد والتسويق ( إيملك )", country: "مصر", section: "C" },
        { booth: "C49", name: "المعرفة اللامحدودة للنشر والتوزيع", country: "مصر", section: "C" },
        { booth: "C50", name: "الآن ناشرون وموزعون", country: "الأردن", section: "C" },
        { booth: "C51", name: "دار جيرا للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C52", name: "دار اتلامون للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C53", name: "مؤسسة عبد الحميد شومان", country: "الأردن", section: "C" },
        { booth: "C54", name: "دار غد الأجيال للنشر والتوزيع", country: "الأردن", section: "C" },
        { booth: "C55", name: "مكتبة الرقيم", country: "الأردن", section: "C" },
        { booth: "C56", name: "مركز الديمولث للتوزيع", country: "الأردن", section: "C" },
        { booth: "C57", name: "دار أكورا للنشر والتوزيع", country: "المغرب", section: "C" },
        { booth: "C58", name: "مكتبة كل شيء - حيفا", country: "فلسطين", section: "C" }
    ];


        if (publishersData.length === 0) {
            console.warn("⚠️ CSV returned empty. Falling back to hardcoded data.");
            publishersData = fallbackPublishers;
        }
        
        // Update global variables
        allPublishers = publishersData;
        filteredPublishers = publishersData;

        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        publishersContainer.style.display = 'grid';

        console.log('🎨 About to render publishers...');
        // Initialize the app with loaded data
        renderPublishers(allPublishers);
        updateStatistics();
        populateMap();
        updateFavoritesDisplay();

        console.log(`✅ Successfully loaded ${publishersData.length} publishers from CSV`);

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
sectionFilter.addEventListener('change', filterPublishers);
countryFilter.addEventListener('change', filterPublishers);
clearFiltersBtn.addEventListener('click', clearFilters);
clearFavoritesBtn.addEventListener('click', clearFavorites);
gridViewBtn.addEventListener('click', () => switchView('grid'));
listViewBtn.addEventListener('click', () => switchView('list'));
if (showMapBtn) {
    showMapBtn.addEventListener('click', () => mapModal.style.display = 'block');
}
if (closeModal) {
    closeModal.addEventListener('click', () => mapModal.style.display = 'none');
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === mapModal) {
        mapModal.style.display = 'none';
    }
});

// Functions
function renderPublishers(publishers) {
    console.log('🎨 renderPublishers called with:', publishers.length, 'publishers');
    console.log('📦 publishersContainer element:', publishersContainer);

    publishersContainer.innerHTML = '';

    if (publishers.length === 0) {
        console.log('⚠️ No publishers to render, showing no results');
        noResults.style.display = 'block';
        return;
    }

    console.log('✅ Rendering', publishers.length, 'publishers');
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
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }
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