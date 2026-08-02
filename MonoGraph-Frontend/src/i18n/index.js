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
        login: { en: 'Login', fa: 'دخول', ps: 'ننوتل' },
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

    return dictionary[key]?.[safeLanguage] || dictionary[key]?.en || key;
};
