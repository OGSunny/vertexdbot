document.addEventListener('DOMContentLoaded', () => {
    // Array of apartment data
    const apartments = [
        {
            id: 'studio-sea-view',
            nameKey: 'room1_name',
            location: 'Orbi City, Block A',
            price: 80,
            images: [
                'assets/room1.jpeg',
                'https://i.imgur.com/k4nJ7wR.jpeg', // Example additional image
                'https://i.imgur.com/tB6qM91.jpeg' // Example additional image
            ],
            amenitiesKeys: ['amenity_balcony', 'amenity_kitchenette', 'amenity_wifi']
        },
        {
            id: 'panoramic-suite',
            nameKey: 'room2_name',
            location: 'Orbi City, Block B',
            price: 120,
            images: [
                'assets/room2.jpeg',
                'https://i.imgur.com/o5Xf9gT.jpeg',
                'https://i.imgur.com/f0sCgEB.jpeg'
            ],
            amenitiesKeys: ['amenity_balcony', 'amenity_fullkitchen', 'amenity_livingarea']
        },
        {
            id: 'family-apartment',
            nameKey: 'room3_name',
            location: 'Orbi City, Block C',
            price: 150,
            images: [
                'assets/room3.jpeg',
                'https://i.imgur.com/8aAdSzC.jpeg',
                'https://i.imgur.com/k4nJ7wR.jpeg'
            ],
            amenitiesKeys: ['amenity_2bedrooms', 'amenity_fullkitchen', 'amenity_washingmachine']
        }
    ];

    const apartmentListings = document.getElementById('apartment-listings');
    const langSelect = document.getElementById('lang-select'); // Get language selector
    const currentLang = langSelect ? langSelect.value : 'en'; // Default to English if selector not found

    // Dummy translations for direct use here (should match script.js for consistency)
    const showroomTranslations = {
        en: {
            room1_name: "Sea View Studio",
            room2_name: "Panoramic Suite",
            room3_name: "Family Apartment",
            price_prefix: "From",
            price_suffix: "/ night",
            amenity_balcony: "Sea View Balcony",
            amenity_kitchenette: "Kitchenette",
            amenity_wifi: "High-Speed WiFi",
            amenity_fullkitchen: "Full Kitchen",
            amenity_livingarea: "Living Area",
            amenity_2bedrooms: "2 Bedrooms",
            amenity_washingmachine: "Washing Machine",
            btn_view_details: "View Details",
            btn_purchase: "Purchase"
        },
        ka: { // Georgian
            room1_name: "სტუდიო ზღვის ხედით",
            room2_name: "პანორამული ლუქსი",
            room3_name: "საოჯახო აპარტამენტი",
            price_prefix: "",
            price_suffix: " / ღამე",
            amenity_balcony: "აივანი ზღვის ხედით",
            amenity_kitchenette: "სამზარეულო კუთხე",
            amenity_wifi: "სწრაფი WiFi",
            amenity_fullkitchen: "სრული სამზარეულო",
            amenity_livingarea: "მისაღები ზონა",
            amenity_2bedrooms: "2 საძინებელი",
            amenity_washingmachine: "სარეცხი მანქანა",
            btn_view_details: "დეტალების ნახვა",
            btn_purchase: "ყიდვა"
        },
        ar: { // Arabic
            room1_name: "استوديو بإطلالة على البحر",
            room2_name: "جناح بانورامي",
            room3_name: "شقة عائلية",
            price_prefix: "ابتداءً من",
            price_suffix: " / الليلة",
            amenity_balcony: "شرفة مطلة على البحر",
            amenity_kitchenette: "مطبخ صغير",
            amenity_wifi: "واي فاي عالي السرعة",
            amenity_fullkitchen: "مطبخ كامل",
            amenity_livingarea: "منطقة معيشة",
            amenity_2bedrooms: "غرفتي نوم",
            amenity_washingmachine: "غسالة ملابس",
            btn_view_details: "عرض التفاصيل",
            btn_purchase: "شراء"
        },
        ru: { // Russian
            room1_name: "Студия с видом на море",
            room2_name: "Панорамный люкс",
            room3_name: "Семейные апартаменты",
            price_prefix: "От",
            price_suffix: " / ночь",
            amenity_balcony: "Балкон с видом на море",
            amenity_kitchenette: "Мини-кухня",
            amenity_wifi: "Высокоскоростной Wi-Fi",
            amenity_fullkitchen: "Полная кухня",
            amenity_livingarea: "Гостиная зона",
            amenity_2bedrooms: "2 Спальни",
            amenity_washingmachine: "Стиральная машина",
            btn_view_details: "Посмотреть детали",
            btn_purchase: "Купить"
        },
        tr: { // Turkish
            room1_name: "Deniz Manzaralı Stüdyo",
            room2_name: "Panoramik Süit",
            room3_name: "Aile Dairesi",
            price_prefix: "Başlangıç",
            price_suffix: " / gece",
            amenity_balcony: "Deniz Manzaralı Balkon",
            amenity_kitchenette: "Mutfak Köşesi",
            amenity_wifi: "Yüksek Hızlı WiFi",
            amenity_fullkitchen: "Tam Donanımlı Mutfak",
            amenity_livingarea: "Oturma Alanı",
            amenity_2bedrooms: "2 Yatak Odası",
            amenity_washingmachine: "Çamaşır Makinesi",
            btn_view_details: "Detayları Görüntüle",
            btn_purchase: "Satın Al"
        }
    };

    const getTranslation = (key) => {
        const lang = localStorage.getItem('selectedLanguage') || 'en';
        return showroomTranslations[lang] && showroomTranslations[lang][key] ? showroomTranslations[lang][key] : showroomTranslations.en[key];
    };

    const createApartmentCard = (apartment) => {
        const card = document.createElement('div');
        card.classList.add('apartment-card');
        card.dataset.id = apartment.id;

        const amenitiesList = apartment.amenitiesKeys.map(key => `<li>${getTranslation(key)}</li>`).join('');

        card.innerHTML = `
            <div class="carousel-container" data-single-image="${apartment.images.length <= 1}">
                <div class="carousel-images">
                    ${apartment.images.map(imgSrc => `<img src="${imgSrc}" alt="${getTranslation(apartment.nameKey)}">`).join('')}
                </div>
                ${apartment.images.length > 1 ? '<button class="carousel-btn prev">&lt;</button><button class="carousel-btn next">&gt;</button>' : ''}
                ${apartment.images.length > 1 ? `<div class="carousel-dots">${apartment.images.map((_, i) => `<span class="dot" data-index="${i}"></span>`).join('')}</div>` : ''}
            </div>
            <div class="card-content">
                <h3 data-lang="${apartment.nameKey}">${getTranslation(apartment.nameKey)}</h3>
                <p class="location">${apartment.location}</p>
                <p class="price" data-lang-price="${apartment.price}">${getTranslation('price_prefix')} <span>$${apartment.price}</span> ${getTranslation('price_suffix')}</p>
                <ul class="amenities">
                    ${amenitiesList}
                </ul>
                <button class="btn-primary btn-purchase" data-lang="btn_purchase">${getTranslation('btn_purchase')}</button>
            </div>
        `;
        return card;
    };

    const initCarousel = (cardElement) => {
        const carouselContainer = cardElement.querySelector('.carousel-container');
        const carouselImages = carouselContainer.querySelector('.carousel-images');
        const prevBtn = carouselContainer.querySelector('.prev');
        const nextBtn = carouselContainer.querySelector('.next');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');
        const images = Array.from(carouselImages.children);

        if (images.length <= 1) {
             carouselContainer.dataset.singleImage = "true"; // Mark for CSS hiding
             return; // No need for carousel if only one image
        } else {
             carouselContainer.dataset.singleImage = "false";
        }

        let currentIndex = 0;

        const updateCarousel = () => {
            const offset = -currentIndex * 100;
            carouselImages.style.transform = `translateX(${offset}%)`;

            dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });
        };

        const goToNext = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        };

        const goToPrev = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
        };

        prevBtn.addEventListener('click', goToPrev);
        nextBtn.addEventListener('click', goToNext);

        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                currentIndex = parseInt(e.target.dataset.index);
                updateCarousel();
            }
        });

        // Initialize first dot as active
        updateCarousel();
    };

    // Render apartments
    apartments.forEach(apartment => {
        const card = createApartmentCard(apartment);
        apartmentListings.appendChild(card);
        initCarousel(card); // Initialize carousel for each new card
    });

    // --- Purchase Modal Logic ---
    const purchaseModal = document.getElementById('purchase-modal');
    const closeButton = purchaseModal.querySelector('.close-button');

    document.querySelectorAll('.btn-purchase').forEach(button => {
        button.addEventListener('click', () => {
            purchaseModal.style.display = 'flex'; // Show the modal
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });
    });

    closeButton.addEventListener('click', () => {
        purchaseModal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Re-enable scrolling
    });

    // Close modal if clicked outside content
    window.addEventListener('click', (event) => {
        if (event.target === purchaseModal) {
            purchaseModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Re-render apartments and carousels when language changes
    langSelect.addEventListener('change', () => {
        apartmentListings.innerHTML = ''; // Clear existing
        apartments.forEach(apartment => {
            const card = createApartmentCard(apartment);
            apartmentListings.appendChild(card);
            initCarousel(card);
        });
        // Ensure translations are applied to the modal as well
        // (script.js handles general data-lang, but for the modal specific text,
        //  we might need to explicitly call setLanguage on the modal if it doesn't get updated)
        // For simplicity, relying on script.js to refresh all data-lang attributes
    });

    // Apply translations on initial load for dynamically created content
    // This is a workaround as script.js might run before showroom.js adds content.
    // A better way would be to ensure script.js runs after all dynamic content is added.
    // For now, let's trigger it after creating elements.
    const fireLanguageUpdate = new Event('change');
    langSelect.dispatchEvent(fireLanguageUpdate);

});
