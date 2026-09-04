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
    const fallback =
        safeTranslation.en?.[field] || safeTranslation.fa?.[field] || safeTranslation.ps?.[field];

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

        offerAccepted: {
            en: 'Offer accepted',
            fa: 'پیشنهاد پذیرفته شد',
            ps: 'وړاندیز ومنل شو',
        },

        offerDeclined: {
            en: 'Offer declined',
            fa: 'پیشنهاد رد شد',
            ps: 'وړاندیز رد شو',
        },

        chatLabel: {
            en: 'Chat',
            fa: 'گفت‌وگو',
            ps: 'خبرې',
        },

        youOrdered: {
            en: 'You ordered:',
            fa: 'شما سفارش دادید:',
            ps: 'تاسو سفارش ورکړی:',
        },

        youOffered: {
            en: 'You offered:',
            fa: 'شما پیشنهاد دادید:',
            ps: 'تاسو وړاندیز کړی:',
        },

        noMessagesYet: {
            en: 'No messages yet',
            fa: 'هنوز پیامی وجود ندارد',
            ps: 'تر اوسه کوم پیغام نشته',
        },

        orderPending: {
            en: 'pending',
            fa: 'حال بررسی',
            ps: 'د بیاکتنې په حال کې دی',
        },
        orderRejected: {
            en: 'rejected',
            fa: 'رد شد',
            ps: 'رد شو',
        },
        orderAccepted: {
            en: 'accepted',
            fa: 'پذیرفته شد',
            ps: 'ومنل شو',
        },
        orderCompleted: {
            en: 'completed',
            fa: 'تکمیل شد',
            ps: 'بشپړ شو',
        },


        ordersMessages: {
            en: 'Orders & messages',
            fa: 'سفارشات و پیام ها',
            ps: 'یادگارونه او پیغامونه',
        },
        language: { en: 'Language', fa: 'زبان', ps: 'ژبه' },
        noFavoriteItems: {
            en: 'No favorite items yet.',
            fa: 'هنوز مورد علاقه ای وجود ندارد.',
            ps: 'تر اوسه پورې کوم مورد علاقه نشته.',
        },
        noFavoriteShops: {
            en: 'No favorite shops yet.',
            fa: 'هنوز فروشگاه مورد علاقه ای وجود ندارد.',
            ps: 'تر اوسه پورې کوم د خوښ شوي فروشگاه نشته.',
        },
        search: { en: 'Search', fa: 'جستجو', ps: 'پلټنه' },
        searchPlaceholder: {
            en: 'Search items or shops...',
            fa: 'جستجوی اقلام یا فروشگاه ها...',
            ps: 'د توکو یا فروشونو پلټنه...',
        },
        items: { en: 'Items', fa: 'اقلام', ps: 'توکي' },
        shops: { en: 'Shops', fa: 'فروشگاه ها', ps: 'فروشګاهونه' },
        noResults: { en: 'No results found', fa: 'نتیجه‌ای یافت نشد', ps: 'هیڅ پایله ونه موندل شوه' },
        category: { en: 'Category', fa: 'دسته بندی', ps: 'کټګوری' },
        similarItems: { en: 'Similar items', fa: 'اقلام مشابه', ps: 'مشابه توکي' },
        about: { en: 'About', fa: 'درباره', ps: 'په اړه' },
        noDescription: {
            en: 'No description available.',
            fa: 'توضیحی در دسترس نیست.',
            ps: 'هیڅ تشریح شتون نه لري.',
        },
        chat: { en: 'Chat', fa: 'چت', ps: 'دردشة' },
        reserveItem: { en: 'Reserve item', fa: 'رزرو کالا', ps: 'د توکي ساتنه' },
        offerPrice: { en: 'Offer a price', fa: 'پیشنهاد قیمت', ps: 'د نرخ وړاندیز' },
        buyNow: { en: 'Buy now', fa: 'همین الان بخرید', ps: 'همدا اوس خرید کړئ' },
        purchaseLocation: { en: 'Purchase location', fa: 'محل خرید', ps: 'د پیرود ځای' },
        unableToBuy: { en: 'Unable to buy', fa: 'خرید انجام نشد', ps: 'پیرود ونه شو' },
        purchaseFailed: { en: 'Purchase failed.', fa: 'خرید ناموفق بود.', ps: 'پیرود ناکام شو.' },
        offerPlaceholder: {
            en: 'Enter your offer',
            fa: 'قیمت پیشنهادی خود را وارد کنید',
            ps: 'خپله وړاندیز قیمت داخل کړئ',
        },
        submitOffer: { en: 'Send offer', fa: 'ارسال پیشنهاد', ps: 'وړاندیز ووستئ' },
        offerSaved: { en: 'Offer saved successfully.', fa: 'پیشنهاد با موفقیت ذخیره شد.', ps: 'وړاندیز په بریالیتوب سره خوندي شو.' },
        offerSaveFailed: { en: 'Could not save offer.', fa: 'ذخیره پیشنهاد انجام نشد.', ps: 'وړاندیز خوندي نه شو.' },
        offerInvalidPrice: { en: 'Please enter a valid price.', fa: 'لطفا یک قیمت معتبر وارد کنید.', ps: 'مهرباني وکړئ یو معتبر قیمت داخل کړئ.' },
        cancel: { en: 'Cancel', fa: 'لغو', ps: 'لغوه' },
        saving: { en: 'Saving...', fa: 'در حال ذخیره...', ps: 'خوندي کېږي...' },
        directBuy: { en: 'Direct purchase', fa: 'خرید مستقیم', ps: 'مستقیم پیرودنه' },
        offerStatus: { en: 'Offer status', fa: 'وضعیت پیشنهاد', ps: 'د وړاندیز وضعیت' },
        offerSubmitted: {
            en: 'Offer submitted',
            fa: 'پیشنهاد شما ارسال شد',
            ps: 'ستاسو وړاندیز واستول شو',
        },
        offerPending: { en: 'Pending', fa: 'در حال بررسی', ps: 'د بیاکتنې په حال کې' },
        chatWithSeller: {
            en: 'Chat with seller',
            fa: 'گفت‌وگوی با فروشنده',
            ps: 'د پلورونکي سره خبرې',
        },
        backToProduct: { en: 'Back to product', fa: 'بازگشت به محصول', ps: 'بېرته محصول ته' },
        confirmPurchase: { en: 'Confirm purchase', fa: 'تأیید خرید', ps: 'د پیرودنې تایید' },
        message: { en: 'Message', fa: 'پیام', ps: 'پیغام' },
        send: { en: 'Send', fa: 'ارسال', ps: 'لیږل' },
        addReview: { en: '+ Add a review', fa: '+ افزودن نظر', ps: '+ د نظر اضافه کول' },
        cancelReview: { en: 'Cancel review', fa: 'لغو نظر', ps: 'نظر لغوه کړئ' },
        submitReview: { en: 'Submit review', fa: 'ارسال نظر', ps: 'نظر وسپارئ' },
        yourRating: { en: 'Your rating', fa: 'امتیاز شما', ps: 'ستاسو درجه بندي' },
        shareExperience: {
            en: 'Share your experience',
            fa: 'تجربه خود را به اشتراک بگذارید',
            ps: 'خپله تجربه شریک کړئ',
        },
        writeReview: { en: 'Write a review', fa: 'یک نظر بنویسید', ps: 'د یوې لیدنې لیکنه' },
        noReviews: {
            en: 'No reviews yet. Be the first to review this shop.',
            fa: 'هنوز نظری ثبت نشده است. اولین نفر باشید.',
            ps: 'تر اوسه پورې کوم بیاجرګه نشته. لومړی ویئ چې نظری ولیکئ.',
        },
        noReviewsForTarget: {
            en: 'No reviews yet for this {target}.',
            fa: 'هنوز نظری برای این {target} ثبت نشده است.',
            ps: 'د دې {target} لپاره تر اوسه بیاکتنه نشته.',
        },
        reviewCommentRequired: {
            en: 'Please add a short comment.',
            fa: 'لطفاً یک نظر کوتاه اضافه کنید.',
            ps: 'مهرباني وکړئ لنډه تبصره اضافه کړئ.',
        },
        reviewSaveFailed: {
            en: 'Could not save review',
            fa: 'ذخیره نظر ناموفق بود',
            ps: 'بیاکتنه خوندي نه شوه',
        },
        tryAgain: { en: 'Please try again.', fa: 'لطفاً دوباره تلاش کنید.', ps: 'مهرباني وکړئ بیا هڅه وکړئ.' },
        item: { en: 'item', fa: 'کالا', ps: 'توکی' },
        shop: { en: 'shop', fa: 'فروشگاه', ps: 'دوکان' },
        user: { en: 'MonoGraph user', fa: 'کاربر مونوگراف', ps: 'د مونوګراف کارن' },
        noFavorites: {
            en: 'No favorite items yet.',
            fa: 'هنوز هیچ مورد علاقه‌ای ندارید.',
            ps: 'تر اوسه پورې کوم مورد علاقه نه لرئ.',
        },
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
        scheduleMeetup: { en: 'Schedule meetup', fa: 'زمان ملاقات را تعیین کنید', ps: 'د لیدنې وخت وټاکئ' },
        meetupDate: { en: 'Date', fa: 'تاریخ', ps: 'نېټه' },
        time: { en: 'Time', fa: 'زمان', ps: 'وخت' },
        meetupArea: { en: 'Area', fa: 'منطقه', ps: 'سیمه' },
        selectMeetingArea: { en: 'Select a meeting area', fa: 'منطقه ملاقات را انتخاب کنید', ps: 'د لیدنې سیمه وټاکئ' },
        hour: { en: 'Hour', fa: 'ساعت', ps: 'ساعت' },
        minute: { en: 'Minute', fa: 'دقیقه', ps: 'دقیقه' },
        period: { en: 'AM / PM', fa: 'قبل/بعد از ظهر', ps: 'غرمې مخکې/وروسته' },
        confirmMeetup: { en: 'Confirm meetup', fa: 'تأیید ملاقات', ps: 'لیدنه تایید کړئ' },
        meetupInfo: { en: 'Meetup information', fa: 'اطلاعات ملاقات', ps: 'د لیدنې معلومات' },
        directions: { en: 'Directions', fa: 'مسیر', ps: 'لارښوونې' },
        acceptOrder: { en: 'Accept order', fa: 'پذیرش سفارش', ps: 'غوښتنه ومنئ' },
        confirm: { en: 'Confirm', fa: 'تأیید', ps: 'تایید' },
        requestChange: { en: 'Request change', fa: 'درخواست تغییر', ps: 'د بدلون غوښتنه' },
        changeReasonOptional: { en: 'Reason (optional)', fa: 'دلیل (اختیاری)', ps: 'دلیل (اختیاري)' },
        orderUpdateFailed: { en: 'Order update failed', fa: 'به‌روزرسانی سفارش ناموفق بود', ps: 'د غوښتنې تازه کول ناکام شول' },
        unableToUpdateOrder: { en: 'Unable to update order.', fa: 'امکان به‌روزرسانی سفارش نیست.', ps: 'غوښتنه تازه کېدای نه شي.' },
        meetupStatusPending: { en: 'Awaiting buyer confirmation', fa: 'در انتظار تأیید خریدار', ps: 'د پېرودونکي تایید ته په تمه' },
        meetupStatusConfirmed: { en: 'Confirmed', fa: 'تأیید شد', ps: 'تایید شو' },
        meetupStatusChangeRequested: { en: 'Change requested', fa: 'درخواست تغییر', ps: 'د بدلون غوښتنه شوې' },
        register: {
            en: 'Register',
            fa: '\u062b\u0628\u062a \u0646\u0627\u0645',
            ps: '\u0646\u0648\u0645 \u0644\u06cc\u06a9\u0646\u0647',
        },
        email: {
            en: 'Email',
            fa: '\u0627\u06cc\u0645\u06cc\u0644',
            ps: '\u0628\u0631\u06d0\u069a\u0646\u0627\u0644\u06cc\u06a9',
        },
        password: {
            en: 'Password',
            fa: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631',
            ps: '\u067e\u067c\u0646\u0648\u0645',
        },
        fullName: {
            en: 'Full name',
            fa: '\u0646\u0627\u0645 \u06a9\u0627\u0645\u0644',
            ps: '\u0628\u0634\u067e\u0693 \u0646\u0648\u0645',
        },
        signInToManage: {
            en: 'Sign in to add businesses and items.',
            fa: '\u0628\u0631\u0627\u06cc \u0627\u0641\u0632\u0648\u062f\u0646 \u0641\u0631\u0648\u0634\u06af\u0627\u0647 \u0648 \u06a9\u0627\u0644\u0627 \u0648\u0627\u0631\u062f \u0634\u0648\u06cc\u062f.',
            ps: '\u062f \u062f\u0648\u06a9\u0627\u0646\u0648\u0646\u0648 \u0627\u0648 \u062a\u0648\u06a9\u0648 \u062f \u0632\u06cc\u0627\u062a\u0648\u0644\u0648 \u0644\u067e\u0627\u0631\u0647 \u0646\u0646\u0648\u0632\u0626.',
        },
        welcome: {
            en: 'Welcome to Docan.',
            fa: '\u0628\u0647 \u062f\u0648\u06a9\u0627\u0646 \u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f.',
            ps: '\u062f\u0648\u06a9\u0627\u0646 \u062a\u0647 \u069a\u0647 \u0631\u0627\u063a\u0644\u0627\u0633\u062a.',
        },
        loggingIn: {
            en: 'Logging in...',
            fa: '\u062f\u0631 \u062d\u0627\u0644 \u0648\u0631\u0648\u062f...',
            ps: '\u062f \u0646\u0646\u0648\u062a\u0644\u0648 \u067e\u0647 \u062d\u0627\u0644 \u06a9\u06d0...',
        },
        creatingAccount: {
            en: 'Creating account...',
            fa: '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a\u0646 \u062d\u0633\u0627\u0628...',
            ps: '\u06ab\u0689\u0648\u0646 \u062c\u0648\u0693\u06d0\u0696\u064a...',
        },
        noAccount: {
            en: 'No account? Register',
            fa: '\u062d\u0633\u0627\u0628 \u0646\u062f\u0627\u0631\u06cc\u062f\u061f \u062b\u0628\u062a \u0646\u0627\u0645 \u06a9\u0646\u06cc\u062f',
            ps: '\u06ab\u0689\u0648\u0646 \u0646\u0647 \u0644\u0631\u0626\u061f \u0646\u0648\u0645\u200c\u0644\u06cc\u06a9\u0646\u0647 \u0648\u06a9\u0693\u0626',
        },
        alreadyHaveAccount: {
            en: 'Already have an account? Login',
            fa: '\u062d\u0633\u0627\u0628 \u062f\u0627\u0631\u06cc\u062f\u061f \u0648\u0627\u0631\u062f \u0634\u0648\u06cc\u062f',
            ps: '\u062f\u0645\u062e\u0647 \u06ab\u0689\u0648\u0646 \u0644\u0631\u0626\u061f \u0646\u0646\u0648\u0632\u0626',
        },
        price: { en: 'Price', fa: '\u0642\u06cc\u0645\u062a', ps: '\u0628\u06cc\u0647' },
        rating: {
            en: 'Rating',
            fa: '\u0627\u0645\u062a\u06cc\u0627\u0632',
            ps: '\u062f\u0631\u062c\u0647',
        },
        follow: {
            en: 'Follow',
            fa: '\u062f\u0646\u0628\u0627\u0644 \u06a9\u0631\u062f\u0646',
            ps: '\u062a\u0639\u0642\u06cc\u0628',
        },
        following: {
            en: 'Following',
            fa: '\u062f\u0646\u0628\u0627\u0644 \u0645\u06cc\u200c\u06a9\u0646\u06cc\u062f',
            ps: '\u062a\u0639\u0642\u06cc\u0628\u0648\u0626',
        },
        reviews: {
            en: 'Reviews',
            fa: '\u0646\u0638\u0631\u0627\u062a',
            ps: '\u0628\u06cc\u0627\u06a9\u062a\u0646\u06d0',
        },
        similarShops: {
            en: 'Similar shops',
            fa: '\u0641\u0631\u0648\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u0645\u0634\u0627\u0628\u0647',
            ps: '\u0648\u0631\u062a\u0647 \u062f\u0648\u06a9\u0627\u0646\u0648\u0646\u0647',
        },
    };
    return (
        common[key]?.[safeLanguage] ||
        common[key]?.en ||
        dictionary[key]?.[safeLanguage] ||
        dictionary[key]?.en ||
        key
    );
};
