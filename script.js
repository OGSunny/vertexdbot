document.addEventListener('DOMContentLoaded', () => {

    const translations = {
        en: {
            site_title: "Orbi City | Premium Apartments in Batumi",
            showroom_site_title: "Showroom | Orbi City Apartments",
            about_site_title: "About Us | Orbi City Apartments",
            contact_site_title: "Contact Us | Orbi City Apartments",
            hotel_name: "Orbi City",
            nav_home: "Home",
            nav_showroom: "Showroom",
            nav_about: "About Us",
            nav_contact: "Contact",
            hero_title: "Experience Batumi From Above",
            hero_subtitle: "Luxury apartments with panoramic sea views in the heart of the city.",
            btn_view_apartments: "View Apartments",
            features_title: "Why Choose Orbi City?",
            feature1_title: "Prime Location",
            feature1_desc: "Nestled in the heart of Batumi, with easy access to attractions, dining, and entertainment.",
            feature2_title: "Stunning Sea Views",
            feature2_desc: "Wake up to breathtaking panoramic views of the Black Sea and city skyline.",
            feature3_title: "Luxury Amenities",
            feature3_desc: "Enjoy modern, fully-equipped apartments with all the comforts of home.",
            about_preview_title: "About Orbi City",
            about_preview_desc: "Orbi City offers an unparalleled living experience in Batumi, combining luxury, comfort, and prime location. Our apartments are meticulously designed to provide you with a memorable stay, whether for vacation or investment.",
            btn_learn_more: "Learn More",
            showroom_title: "Our Premium Apartments",
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
            btn_purchase: "Purchase",
            modal_title: "Contact Owner for Purchase",
            modal_desc: "To inquire about purchasing this apartment, please contact the owner directly via WhatsApp:",
            btn_whatsapp_modal: "Chat on WhatsApp",
            modal_phone: "Or call: +995 555 123 456",
            about_page_title: "Our Story",
            about_paragraph1: "Orbi City Apartments emerged from a vision to offer an unparalleled luxury experience in Batumi, Georgia. Located in the iconic Orbi City complex, our properties combine modern design with breathtaking panoramic views of the Black Sea and the vibrant city.",
            about_paragraph2: "We believe in providing more than just accommodation; we offer a lifestyle. Each apartment is meticulously furnished and equipped with high-end amenities to ensure maximum comfort and convenience for our guests and residents. From spacious living areas to fully-equipped kitchens, every detail is crafted with your enjoyment in mind.",
            about_paragraph3: "Whether you're looking for a memorable vacation spot, a promising investment opportunity, or a new home in a thriving city, Orbi City Apartments is your ideal choice. Our dedicated team is committed to delivering exceptional service and ensuring your experience with us is nothing short of perfect.",
            contact_page_title: "Get in Touch",
            contact_info_heading: "Contact Information",
            phone_label: "Phone:",
            email_label: "Email:",
            address_label: "Address:",
            whatsapp_title: "Direct Contact",
            whatsapp_desc: "For immediate assistance or special requests, contact us directly on WhatsApp.",
            btn_whatsapp: "Chat on WhatsApp",
            contact_form_heading: "Send Us a Message",
            form_name: "Your Name",
            form_email: "Your Email",
            form_subject: "Subject",
            form_message: "Message",
            btn_send_message: "Send Message",
            footer_text: "© 2025 Orbi City Apartments. All Rights Reserved.",
        },
        ka: { // Georgian
            site_title: "ორბი სითი | პრემიუმ აპარტამენტები ბათუმში",
            showroom_site_title: "შოურუმი | ორბი სითი აპარტამენტები",
            about_site_title: "ჩვენს შესახებ | ორბი სითი აპარტამენტები",
            contact_site_title: "კონტაქტი | ორბი სითი აპარტამენტები",
            hotel_name: "ორბი სითი",
            nav_home: "მთავარი",
            nav_showroom: "შოურუმი",
            nav_about: "ჩვენს შესახებ",
            nav_contact: "კონტაქტი",
            hero_title: "განიცადე ბათუმი მაღლიდან",
            hero_subtitle: "ფეშენებელური აპარტამენტები ზღვის პანორამული ხედებით ქალაქის გულში.",
            btn_view_apartments: "აპარტამენტების ნახვა",
            features_title: "რატომ ავირჩიოთ ორბი სითი?",
            feature1_title: "საუკეთესო ლოკაცია",
            feature1_desc: "მდებარეობს ბათუმის გულში, მარტივი წვდომით ატრაქციონებზე, რესტორნებსა და გასართობებზე.",
            feature2_title: "განუმეორებელი ზღვის ხედები",
            feature2_desc: "გაიღვიძეთ შავი ზღვისა და ქალაქის პანორამული ხედებით.",
            feature3_title: "ფუფუნების საყოფაცხოვრებო პირობები",
            feature3_desc: "ისიამოვნეთ თანამედროვე, სრულად აღჭურვილი აპარტამენტებით სახლის ყველა კომფორტით.",
            about_preview_title: "ორბი სითის შესახებ",
            about_preview_desc: "ორბი სითი გთავაზობთ შეუდარებელ საცხოვრებელ გამოცდილებას ბათუმში, ფუფუნების, კომფორტისა და საუკეთესო ლოკაციის შერწყმით. ჩვენი აპარტამენტები ზედმიწევნით არის შექმნილი, რათა დაუვიწყარი დასვენება მოგანიჭოთ, იქნება ეს შვებულება თუ ინვესტიცია.",
            btn_learn_more: "გაიგეთ მეტი",
            showroom_title: "ჩვენი პრემიუმ აპარტამენტები",
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
            btn_purchase: "ყიდვა",
            modal_title: "მფლობელთან დაკავშირება შესყიდვისთვის",
            modal_desc: "აპარტამენტის შესაძენად, გთხოვთ, დაუკავშირდეთ მფლობელს უშუალოდ WhatsApp-ის საშუალებით:",
            btn_whatsapp_modal: "ჩატი WhatsApp-ზე",
            modal_phone: "ან დარეკეთ: +995 555 123 456",
            about_page_title: "ჩვენი ისტორია",
            about_paragraph1: "ორბი სითი აპარტამენტები შეიქმნა ბათუმში, საქართველო, შეუდარებელი ფუფუნების გამოცდილების შეთავაზების ხედვით. მდებარეობს საკულტო ორბი სითის კომპლექსში, ჩვენი თვისებები აერთიანებს თანამედროვე დიზაინს შავი ზღვისა და ცოცხალი ქალაქის თვალწარმტაც პანორამულ ხედებთან.",
            about_paragraph2: "ჩვენ გვჯერა, რომ ვაძლევთ უბრალოდ განთავსებას; ჩვენ ვთავაზობთ ცხოვრების წესს. თითოეული აპარტამენტი ზედმიწევნით არის მოწყობილი და აღჭურვილი მაღალი დონის კეთილმოწყობით, რათა უზრუნველყოფილი იყოს მაქსიმალური კომფორტი და მოხერხებულობა ჩვენი სტუმრებისა და მაცხოვრებლებისთვის. ფართო საცხოვრებელი ფართებიდან სრულად აღჭურვილი სამზარეულოებით, ყოველი დეტალი თქვენი სიამოვნებისთვის არის შექმნილი.",
            about_paragraph3: "მიუხედავად იმისა, ეძებთ დასამახსოვრებელ დასასვენებელ ადგილს, პერსპექტიულ საინვესტიციო შესაძლებლობას, თუ ახალ სახლს აყვავებულ ქალაქში, ორბი სითი აპარტამენტები თქვენი იდეალური არჩევანია. ჩვენი ერთგული გუნდი მზად არის უზრუნველყოს განსაკუთრებული მომსახურება და გარანტიას გაძლევთ, რომ თქვენი გამოცდილება ჩვენთან არ იქნება სრულყოფილი.",
            contact_page_title: "დაგვიკავშირდით",
            contact_info_heading: "საკონტაქტო ინფორმაცია",
            phone_label: "ტელეფონი:",
            email_label: "ელ-ფოსტა:",
            address_label: "მისამართი:",
            whatsapp_title: "პირდაპირი კონტაქტი",
            whatsapp_desc: "დაუყოვნებელი დახმარებისთვის ან სპეციალური მოთხოვნებისთვის, დაგვიკავშირდით პირდაპირ WhatsApp-ზე.",
            btn_whatsapp: "ჩატი WhatsApp-ზე",
            contact_form_heading: "გამოგვიგზავნეთ შეტყობინება",
            form_name: "თქვენი სახელი",
            form_email: "თქვენი ელ-ფოსტა",
            form_subject: "თემა",
            form_message: "შეტყობინება",
            btn_send_message: "შეტყობინების გაგზავნა",
            footer_text: "© 2025 ორბი სითი აპარტამენტები. ყველა უფლება დაცულია.",
        },
        ar: { // Arabic
            site_title: "أوربي سيتي | شقق فاخرة في باتومي",
            showroom_site_title: "معرض الشقق | أوربي سيتي",
            about_site_title: "عنا | أوربي سيتي",
            contact_site_title: "اتصل بنا | أوربي سيتي",
            hotel_name: "أوربي سيتي",
            nav_home: "الرئيسية",
            nav_showroom: "معرض الشقق",
            nav_about: "عنا",
            nav_contact: "اتصل بنا",
            hero_title: "استمتع بتجربة باتومي من الأعلى",
            hero_subtitle: "شقق فاخرة بإطلالات بانورامية على البحر في قلب المدينة.",
            btn_view_apartments: "عرض الشقق",
            features_title: "لماذا تختار أوربي سيتي؟",
            feature1_title: "موقع متميز",
            feature1_desc: "تقع في قلب باتومي، مع سهولة الوصول إلى المعالم السياحية والمطاعم والترفيه.",
            feature2_title: "إطلالات بحرية خلابة",
            feature2_desc: "استيقظ على إطلالات بانورامية خلابة للبحر الأسود وأفق المدينة.",
            feature3_title: "وسائل راحة فاخرة",
            feature3_desc: "استمتع بشقق عصرية ومجهزة بالكامل مع جميع وسائل الراحة المنزلية.",
            about_preview_title: "عن أوربي سيتي",
            about_preview_desc: "تقدم أوربي سيتي تجربة معيشية لا مثيل لها في باتومي، تجمع بين الفخامة والراحة والموقع المتميز. تم تصميم شققنا بدقة لتزويدك بإقامة لا تُنسى، سواء كانت لقضاء عطلة أو للاستثمار.",
            btn_learn_more: "معرفة المزيد",
            showroom_title: "شققنا الفاخرة",
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
            btn_purchase: "شراء",
            modal_title: "تواصل مع المالك للشراء",
            modal_desc: "للاستفسار عن شراء هذه الشقة، يرجى الاتصال بالمالك مباشرة عبر الواتساب:",
            btn_whatsapp_modal: "الدردشة على واتساب",
            modal_phone: "أو اتصل: +995 555 123 456",
            about_page_title: "قصتنا",
            about_paragraph1: "ظهرت شقق أوربي سيتي من رؤية لتقديم تجربة فاخرة لا مثيل لها في باتومي، جورجيا. تقع عقاراتنا في مجمع أوربي سيتي الشهير، وتجمع بين التصميم الحديث والإطلالات البانورامية الخلابة على البحر الأسود وأفق المدينة النابض بالحياة.",
            about_paragraph2: "نحن نؤمن بتقديم أكثر من مجرد إقامة؛ نحن نقدم أسلوب حياة. تم تأثيث كل شقة وتجهيزها بدقة بوسائل راحة عالية الجودة لضمان أقصى قدر من الراحة والملاءمة لضيوفنا والمقيمين. من مناطق المعيشة الفسيحة إلى المطابخ المجهزة بالكامل، تم تصميم كل التفاصيل مع مراعاة استمتاعك.",
            about_paragraph3: "سواء كنت تبحث عن مكان عطلة لا يُنسى، أو فرصة استثمار واعدة، أو منزل جديد في مدينة مزدهرة، فإن شقق أوربي سيتي هي خيارك المثالي. يلتزم فريقنا المتفاني بتقديم خدمة استثنائية وضمان أن تكون تجربتك معنا لا تقل عن الكمال.",
            contact_page_title: "تواصل معنا",
            contact_info_heading: "معلومات الاتصال",
            phone_label: "الهاتف:",
            email_label: "البريد الإلكتروني:",
            address_label: "العنوان:",
            whatsapp_title: "اتصال مباشر",
            whatsapp_desc: "للمساعدة الفورية أو الطلبات الخاصة، تواصل معنا مباشرة عبر الواتساب.",
            btn_whatsapp: "الدردشة على واتساب",
            contact_form_heading: "أرسل لنا رسالة",
            form_name: "اسمك",
            form_email: "بريدك الإلكتروني",
            form_subject: "الموضوع",
            form_message: "الرسالة",
            btn_send_message: "إرسال الرسالة",
            footer_text: "© 2025 شقق أوربي سيتي. جميع الحقوق محفوظة.",
        },
        ru: { // Russian
            site_title: "Орби Сити | Премиум Апартаменты в Батуми",
            showroom_site_title: "Шоурум | Орби Сити Апартаменты",
            about_site_title: "О нас | Орби Сити Апартаменты",
            contact_site_title: "Контакты | Орби Сити Апартаменты",
            hotel_name: "Орби Сити",
            nav_home: "Главная",
            nav_showroom: "Шоурум",
            nav_about: "О нас",
            nav_contact: "Контакты",
            hero_title: "Почувствуйте Батуми с высоты",
            hero_subtitle: "Роскошные апартаменты с панорамным видом на море в самом сердце города.",
            btn_view_apartments: "Посмотреть Апартаменты",
            features_title: "Почему стоит выбрать Орби Сити?",
            feature1_title: "Идеальное расположение",
            feature1_desc: "Расположен в самом центре Батуми, с легким доступом к достопримечательностям, ресторанам и развлечениям.",
            feature2_title: "Потрясающие виды на море",
            feature2_desc: "Просыпайтесь с захватывающими панорамными видами на Черное море и городской пейзаж.",
            feature3_title: "Роскошные удобства",
            feature3_desc: "Наслаждайтесь современными, полностью оборудованными апартаментами со всеми домашними удобствами.",
            about_preview_title: "Об Орби Сити",
            about_preview_desc: "Орби Сити предлагает несравненный опыт проживания в Батуми, сочетая роскошь, комфорт и превосходное расположение. Наши апартаменты тщательно спроектированы, чтобы предоставить вам незабываемый отдых, будь то отпуск или инвестиция.",
            btn_learn_more: "Узнать больше",
            showroom_title: "Наши Премиум Апартаменты",
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
            btn_purchase: "Купить",
            modal_title: "Свяжитесь с владельцем для покупки",
            modal_desc: "Чтобы узнать о покупке этой квартиры, пожалуйста, свяжитесь с владельцем напрямую через WhatsApp:",
            btn_whatsapp_modal: "Чат в WhatsApp",
            modal_phone: "Или позвоните: +995 555 123 456",
            about_page_title: "Наша История",
            about_paragraph1: "Апартаменты Орби Сити возникли из идеи предложить несравненный роскошный опыт в Батуми, Грузия. Расположенные в знаковом комплексе Орби Сити, наши объекты сочетают современный дизайн с захватывающими панорамными видами на Черное море и оживленный городской пейзаж.",
            about_paragraph2: "Мы верим, что предлагаем не просто жилье; мы предлагаем образ жизни. Каждая квартира тщательно меблирована и оборудована высококлассными удобствами для обеспечения максимального комфорта и удобства для наших гостей и жителей. От просторных гостиных до полностью оборудованных кухонь, каждая деталь создана для вашего наслаждения.",
            about_paragraph3: "Будь то незабываемое место для отпуска, многообещающая инвестиционная возможность или новый дом в процветающем городе, апартаменты Орби Сити — ваш идеальный выбор. Наша преданная команда стремится предоставлять исключительный сервис и гарантировать, что ваш опыт с нами будет идеальным.",
            contact_page_title: "Свяжитесь с нами",
            contact_info_heading: "Контактная информация",
            phone_label: "Телефон:",
            email_label: "Электронная почта:",
            address_label: "Адрес:",
            whatsapp_title: "Прямой контакт",
            whatsapp_desc: "Для немедленной помощи или специальных запросов, свяжитесь с нами напрямую через WhatsApp.",
            btn_whatsapp: "Чат в WhatsApp",
            contact_form_heading: "Отправьте нам сообщение",
            form_name: "Ваше имя",
            form_email: "Ваш Email",
            form_subject: "Тема",
            form_message: "Сообщение",
            btn_send_message: "Отправить сообщение",
            footer_text: "© 2025 Орби Сити Апартаменты. Все права защищены.",
        },
        tr: { // Turkish
            site_title: "Orbi City | Batum'da Premium Daireler",
            showroom_site_title: "Showroom | Orbi City Daireleri",
            about_site_title: "Hakkımızda | Orbi City Daireleri",
            contact_site_title: "Bize Ulaşın | Orbi City Daireleri",
            hotel_name: "Orbi City",
            nav_home: "Ana Sayfa",
            nav_showroom: "Showroom",
            nav_about: "Hakkımızda",
            nav_contact: "İletişim",
            hero_title: "Batum'u Yukarıdan Deneyimleyin",
            hero_subtitle: "Şehrin kalbinde, panoramik deniz manzaralı lüks daireler.",
            btn_view_apartments: "Daireleri Görüntüle",
            features_title: "Neden Orbi City'yi Seçmelisiniz?",
            feature1_title: "Harika Konum",
            feature1_desc: "Batum'un kalbinde yer alır, cazibe merkezlerine, yemek ve eğlenceye kolay erişim imkanı sunar.",
            feature2_title: "Muhteşem Deniz Manzaraları",
            feature2_desc: "Karadeniz'in ve şehir silüetinin nefes kesen panoramik manzaralarıyla uyanın.",
            feature3_title: "Lüks Olanaklar",
            feature3_desc: "Ev konforunda, modern, tam donanımlı dairelerin keyfini çıkarın.",
            about_preview_title: "Orbi City Hakkında",
            about_preview_desc: "Orbi City, Batum'da lüks, konfor ve birinci sınıf konumu bir araya getiren eşsiz bir yaşam deneyimi sunuyor. Dairelerimiz, ister tatil ister yatırım amaçlı olsun, size unutulmaz bir konaklama sağlamak için titizlikle tasarlanmıştır.",
            btn_learn_more: "Daha Fazla Bilgi Edinin",
            showroom_title: "Premium Dairelerimiz",
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
            btn_purchase: "Satın Al",
            modal_title: "Satın Alma İçin Sahibine Ulaşın",
            modal_desc: "Bu daireyi satın alma hakkında bilgi almak için lütfen doğrudan WhatsApp üzerinden sahibiyle iletişime geçin:",
            btn_whatsapp_modal: "WhatsApp'ta Sohbet Et",
            modal_phone: "Veya arayın: +995 555 123 456",
            about_page_title: "Hikayemiz",
            about_paragraph1: "Orbi City Daireleri, Batum, Gürcistan'da eşsiz bir lüks deneyimi sunma vizyonuyla ortaya çıktı. İkonik Orbi City kompleksinde yer alan mülklerimiz, modern tasarımı Karadeniz'in ve hareketli şehir silüetinin nefes kesen panoramik manzaralarıyla birleştiriyor.",
            about_paragraph2: "Sadece konaklama değil, bir yaşam tarzı sunduğumuza inanıyoruz. Her daire, misafirlerimize ve sakinlerimize maksimum konfor ve kolaylık sağlamak için titizlikle döşenmiş ve yüksek kaliteli olanaklarla donatılmıştır. Geniş yaşam alanlarından tam donanımlı mutfaklara kadar her ayrıntı, sizin keyfiniz düşünülerek tasarlanmıştır.",
            about_paragraph3: "İster unutulmaz bir tatil yeri, ister umut vadeden bir yatırım fırsatı, isterse gelişen bir şehirde yeni bir ev arıyor olun, Orbi City Daireleri ideal seçiminizdir. Özel ekibimiz, olağanüstü hizmet sunmaya ve bizimle olan deneyiminizin mükemmel olmasını sağlamaya kararlıdır.",
            contact_page_title: "Bize Ulaşın",
            contact_info_heading: "İletişim Bilgileri",
            phone_label: "Telefon:",
            email_label: "E-posta:",
            address_label: "Adres:",
            whatsapp_title: "Doğrudan İletişim",
            whatsapp_desc: "Acil yardım veya özel istekleriniz için doğrudan WhatsApp üzerinden bizimle iletişime geçin.",
            btn_whatsapp: "WhatsApp'ta Sohbet Et",
            contact_form_heading: "Bize Mesaj Gönderin",
            form_name: "Adınız",
            form_email: "E-postanız",
            form_subject: "Konu",
            form_message: "Mesaj",
            btn_send_message: "Mesaj Gönder",
            footer_text: "© 2025 Orbi City Daireleri. Tüm Hakları Saklıdır.",
        }
    };

    const langSelect = document.getElementById('lang-select');
    
    const setLanguage = (lang) => {
        const t = translations[lang] || translations.en;

        // Set all data-lang elements
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.dataset.lang;
            if (t[key]) {
                el.textContent = t[key];
            }
        });

        // Handle price formatting (if present on the page)
        document.querySelectorAll('[data-lang-price]').forEach(el => {
            const price = el.dataset.langPrice;
            el.innerHTML = `${t.price_prefix} <span>$${price}</span> ${t.price_suffix}`;
        });

        // Set document direction for Arabic
        document.body.className = lang === 'ar' ? 'rtl' : '';
        document.documentElement.lang = lang;
        
        // Update specific title tags based on the current page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '') {
            document.title = t.site_title;
        } else if (currentPage === 'showroom.html') {
            document.title = t.showroom_site_title;
        } else if (currentPage === 'about.html') {
            document.title = t.about_site_title;
        } else if (currentPage === 'contact.html') {
            document.title = t.contact_site_title;
        }
    };

    // Set initial language from localStorage or default to 'en'
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang && translations[storedLang]) {
        langSelect.value = storedLang;
    } else {
        localStorage.setItem('selectedLanguage', 'en'); // Set default if none
    }

    langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        localStorage.setItem('selectedLanguage', newLang); // Save selected language
        setLanguage(newLang);
    });

    // Highlight active navigation link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Initial language setup
    setLanguage(langSelect.value);
});
