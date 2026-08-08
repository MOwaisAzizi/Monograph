export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'fa', 'ps'];

export const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'fa', label: 'فارسی', short: 'FA' },
    { value: 'ps', label: 'پښتو', short: 'PS' },
];

export const LANGUAGE_NAMES = {
    en: 'English',
    fa: 'فارسی',
    ps: 'پښتو',
};

export const normalizeLanguage = (language = DEFAULT_LANGUAGE) =>
    SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

export const getLocalizedValue = (translation, language = DEFAULT_LANGUAGE, field = 'title') => {
    const safeLanguage = normalizeLanguage(language);
    const safeTranslation = translation || {};

    const direct = safeTranslation[safeLanguage]?.[field];
    const fallback = safeTranslation.en?.[field] || safeTranslation.fa?.[field] || safeTranslation.ps?.[field];

    if (typeof direct === 'string' && direct.trim()) return direct;
    if (typeof fallback === 'string' && fallback.trim()) return fallback;

    const flatValue = typeof safeTranslation === 'string' ? safeTranslation : null;
    if (typeof flatValue === 'string' && flatValue.trim()) return flatValue;

    return '';
};

export const getText = (language, key) => {
    const safeLanguage = normalizeLanguage(language);
    const dictionary = {
        profile: { en: 'Profile', fa: 'پروفایل', ps: 'پروفایل' },
        login: { en: 'Login', fa: 'ورود', ps: 'ننوتل' },
        logout: { en: 'Logout', fa: 'خروج', ps: 'وتل' },
        favoriteItems: { en: 'Favorite Items', fa: 'اقلام مورد علاقه', ps: 'موردعلاقې توکي' },
        favoriteShops: { en: 'Favorite Shops', fa: 'فروشگاه های مورد علاقه', ps: 'د خوښ کردو فروشونو' },
        settings: { en: 'Settings', fa: 'تنظیمات', ps: 'امستنې' },
        myListings: { en: 'My listings', fa: 'لیست های من', ps: 'زما لیستونه' },
        ordersMessages: { en: 'Orders & messages', fa: 'سفارشات و پیام ها', ps: 'یادگارونه او پیغامونه' },
        language: { en: 'Language', fa: 'زبان', ps: 'ژبه' },
        noFavoriteItems: { en: 'No favorite items yet.', fa: 'هنوز مورد علاقه ای وجود ندارد.', ps: 'تر اوسه پورې کوم مورد علاقه نشته.' },
        noFavoriteShops: { en: 'No favorite shops yet.', fa: 'هنوز فروشگاه مورد علاقه ای وجود ندارد.', ps: 'تر اوسه پورې کوم د خوښ شوي فروشگاه نشته.' },
        search: { en: 'Search', fa: 'جستجو', ps: 'پلټنه' },
        searchPlaceholder: { en: 'Search items or shops...', fa: 'جستجوی اقلام یا فروشگاه ها...', ps: 'د توکو یا فروشونو پلټنه...' },
        items: { en: 'Items', fa: 'اقلام', ps: 'توکي' },
        shops: { en: 'Shops', fa: 'فروشگاه ها', ps: 'فروشګاهونه' },
        noResults: { en: 'No results found', fa: 'نتیجه‌ای یافت نشد', ps: 'هیڅ پایله ونه موندل شوه' },
        category: { en: 'Category', fa: 'دسته بندی', ps: 'کټګوری' },
        similarItems: { en: 'Similar items', fa: 'اقلام مشابه', ps: 'مشابه توکي' },
        about: { en: 'About', fa: 'درباره', ps: 'په اړه' },
        noDescription: { en: 'No description available.', fa: 'توضیحی در دسترس نیست.', ps: 'هیڅ تشریح شتون نه لري.' },
        chat: { en: 'Chat', fa: 'چت', ps: 'دردشة' },
        reserveItem: { en: 'Reserve item', fa: 'رزرو کالا', ps: 'د توکي ساتنه' },
        addReview: { en: '+ Add a review', fa: '+ افزودن نظر', ps: '+ د نظر اضافه کول' },
        cancelReview: { en: 'Cancel review', fa: 'لغو نظر', ps: 'نظر لغوه کړئ' },
        submitReview: { en: 'Submit review', fa: 'ارسال نظر', ps: 'نظر وسپارئ' },
        yourRating: { en: 'Your rating', fa: 'امتیاز شما', ps: 'ستاسو درجه بندي' },
        shareExperience: { en: 'Share your experience', fa: 'تجربه خود را به اشتراک بگذارید', ps: 'خپله تجربه شریک کړئ' },
        writeReview: { en: 'Write a review', fa: 'یک نظر بنویسید', ps: 'د یوې لیدنې لیکنه' },
        noReviews: { en: 'No reviews yet. Be the first to review this shop.', fa: 'هنوز نظری ثبت نشده است. اولین نفر باشید.', ps: 'تر اوسه پورې کوم بیاجرګه نشته. لومړی ویئ چې نظری ولیکئ.' },
        noFavorites: { en: 'No favorite items yet.', fa: 'هنوز هیچ مورد علاقه‌ای ندارید.', ps: 'تر اوسه پورې کوم مورد علاقه نه لرئ.' },
        connectedAccount: { en: 'Connected account', fa: 'حساب متصل', ps: 'نښل شوی حساب' },
        yourProfile: { en: 'Your profile', fa: 'پروفایل شما', ps: 'ستاسو پروفایل' },
        addListing: { en: 'Add listing', fa: 'افزودن آگهی', ps: 'لیست اضافه کول' },
        newItems: { en: 'New Items', fa: 'اقلام جدید', ps: 'نوی توکي' },
        highlyRated: { en: 'Highly Rated', fa: 'بسیار امتیازدار', ps: 'بیا درجه بندي شوي' },
        cheap: { en: 'Cheap', fa: 'ارزان', ps: 'زحمت' },
        nearYou: { en: 'Near You', fa: 'نزدیک شما', ps: 'نزدیک تاسو' },
        shopsTitle: { en: 'Shops', fa: 'فروشگاه ها', ps: 'فروشګاهونه' },
        seeAll: { en: 'See all', fa: 'مشاهده همه', ps: 'ټول وګورئ' },
        itemTitleFallback: { en: 'Item title', fa: 'عنوان کالا', ps: 'د توکي عنوان' },
        categoryFallback: { en: 'Category', fa: 'دسته بندی', ps: 'کټګوری' },
        shopFallback: { en: 'Shop name', fa: 'نام فروشگاه', ps: 'د فروشګاه نوم' },
        herat: { en: 'Herat', fa: 'هرات', ps: 'هرات' },
    };

    const common = {
        register: { en: 'Register', fa: '\u062b\u0628\u062a \u0646\u0627\u0645', ps: '\u0646\u0648\u0645 \u0644\u06cc\u06a9\u0646\u0647' },
        email: { en: 'Email', fa: '\u0627\u06cc\u0645\u06cc\u0644', ps: '\u0628\u0631\u06d0\u069a\u0646\u0627\u0644\u06cc\u06a9' },
        password: { en: 'Password', fa: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631', ps: '\u067e\u067c\u0646\u0648\u0645' },
        fullName: { en: 'Full name', fa: '\u0646\u0627\u0645 \u06a9\u0627\u0645\u0644', ps: '\u0628\u0634\u067e\u0693 \u0646\u0648\u0645' },
        signInToManage: { en: 'Sign in to add businesses and items.', fa: '\u0628\u0631\u0627\u06cc \u0627\u0641\u0632\u0648\u062f\u0646 \u0641\u0631\u0648\u0634\u06af\u0627\u0647 \u0648 \u06a9\u0627\u0644\u0627 \u0648\u0627\u0631\u062f \u0634\u0648\u06cc\u062f.', ps: '\u062f \u062f\u0648\u06a9\u0627\u0646\u0648\u0646\u0648 \u0627\u0648 \u062a\u0648\u06a9\u0648 \u062f \u0632\u06cc\u0627\u062a\u0648\u0644\u0648 \u0644\u067e\u0627\u0631\u0647 \u0646\u0646\u0648\u0632\u0626.' },
        welcome: { en: 'Welcome to Docan.', fa: '\u0628\u0647 \u062f\u0648\u06a9\u0627\u0646 \u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f.', ps: '\u062f\u0648\u06a9\u0627\u0646 \u062a\u0647 \u069a\u0647 \u0631\u0627\u063a\u0644\u0627\u0633\u062a.' },
        loggingIn: { en: 'Logging in...', fa: '\u062f\u0631 \u062d\u0627\u0644 \u0648\u0631\u0648\u062f...', ps: '\u062f \u0646\u0646\u0648\u062a\u0644\u0648 \u067e\u0647 \u062d\u0627\u0644 \u06a9\u06d0...' },
        creatingAccount: { en: 'Creating account...', fa: '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a\u0646 \u062d\u0633\u0627\u0628...', ps: '\u06ab\u0689\u0648\u0646 \u062c\u0648\u0693\u06d0\u0696\u064a...' },
        noAccount: { en: 'No account? Register', fa: '\u062d\u0633\u0627\u0628 \u0646\u062f\u0627\u0631\u06cc\u062f\u061f \u062b\u0628\u062a \u0646\u0627\u0645 \u06a9\u0646\u06cc\u062f', ps: '\u06ab\u0689\u0648\u0646 \u0646\u0647 \u0644\u0631\u0626\u061f \u0646\u0648\u0645\u200c\u0644\u06cc\u06a9\u0646\u0647 \u0648\u06a9\u0693\u0626' },
        alreadyHaveAccount: { en: 'Already have an account? Login', fa: '\u062d\u0633\u0627\u0628 \u062f\u0627\u0631\u06cc\u062f\u061f \u0648\u0627\u0631\u062f \u0634\u0648\u06cc\u062f', ps: '\u062f\u0645\u062e\u0647 \u06ab\u0689\u0648\u0646 \u0644\u0631\u0626\u061f \u0646\u0646\u0648\u0632\u0626' },
        price: { en: 'Price', fa: '\u0642\u06cc\u0645\u062a', ps: '\u0628\u06cc\u0647' },
        rating: { en: 'Rating', fa: '\u0627\u0645\u062a\u06cc\u0627\u0632', ps: '\u062f\u0631\u062c\u0647' },
        follow: { en: 'Follow', fa: '\u062f\u0646\u0628\u0627\u0644 \u06a9\u0631\u062f\u0646', ps: '\u062a\u0639\u0642\u06cc\u0628' },
        following: { en: 'Following', fa: '\u062f\u0646\u0628\u0627\u0644 \u0645\u06cc\u200c\u06a9\u0646\u06cc\u062f', ps: '\u062a\u0639\u0642\u06cc\u0628\u0648\u0626' },
        reviews: { en: 'Reviews', fa: '\u0646\u0638\u0631\u0627\u062a', ps: '\u0628\u06cc\u0627\u06a9\u062a\u0646\u06d0' },
        similarShops: { en: 'Similar shops', fa: '\u0641\u0631\u0648\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u0645\u0634\u0627\u0628\u0647', ps: '\u0648\u0631\u062a\u0647 \u062f\u0648\u06a9\u0627\u0646\u0648\u0646\u0647' },
    };
    return common[key]?.[safeLanguage] || common[key]?.en || dictionary[key]?.[safeLanguage] || dictionary[key]?.en || key;
};
