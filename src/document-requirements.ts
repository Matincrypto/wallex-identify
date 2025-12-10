
export type Relationship = 'child' | 'parent' | 'spouse' | 'sibling';

export interface RequiredDocument {
  id: string;
  title: string;
  description: string;
}

export const RELATIONSHIP_OPTIONS: { id: Relationship, name: string }[] = [
    { id: 'child', name: 'فرزندم از حسابم استفاده کرده' },
    { id: 'parent', name: 'پدر / مادرم از حسابم استفاده کرده' },
    { id: 'spouse', name: 'همسرم از حسابم استفاده کرده' },
    { id: 'sibling', name: 'خواهر / برادرم از حسابم استفاده کرده' },
];

export const DOCUMENT_REQUIREMENTS: Record<Relationship, RequiredDocument[]> = {
  child: [
    { id: 'account_holder_shenasname', title: 'صفحه اول شناسنامه صاحب حساب (شما)', description: 'لطفا تصویر واضح از صفحه اول شناسنامه خود را بارگذاری کنید.' },
    { id: 'user_shenasname', title: 'صفحه اول شناسنامه فرزند', description: 'لطفا تصویر واضح از صفحه اول شناسنامه فرزندتان را بارگذاری کنید.' }
  ],
  parent: [
    { id: 'account_holder_shenasname', title: 'صفحه اول شناسنامه صاحب حساب (شما)', description: 'لطفا تصویر واضح از صفحه اول شناسنامه خود را بارگذاری کنید.' },
    { id: 'user_shenasname', title: 'صفحه اول شناسنامه پدر/مادر', description: 'لطفا تصویر واضح از صفحه اول شناسنامه پدر/مادر خود را بارگذاری کنید.' }
  ],
  spouse: [
    { id: 'account_holder_shenasname', title: 'صفحه اول شناسنامه صاحب حساب (شما)', description: 'لطفا تصویر واضح از صفحه اول شناسنامه خود را بارگذاری کنید.' },
    { id: 'spouse_shenasname', title: 'صفحه اول شناسنامه همسر', description: 'لطفا تصویر واضح از صفحه اول شناسنامه همسرتان را بارگذاری کنید.' },
    { id: 'account_holder_spouse_page', title: 'صفحه اطلاعات همسران در شناسنامه شما', description: 'تصویر واضح از صفحه مشخصات همسر در شناسنامه خود را بارگذاری کنید.' },
    { id: 'spouse_spouse_page', title: 'صفحه اطلاعات همسران در شناسنامه همسر', description: 'تصویر واضح از صفحه مشخصات همسر در شناسنامه همسرتان را بارگذاری کنید.' }
  ],
  sibling: [
    { id: 'account_holder_shenasname', title: 'صفحه اول شناسنامه صاحب حساب (شما)', description: 'لطفا تصویر واضح از صفحه اول شناسنامه خود را بارگذاری کنید.' },
    { id: 'sibling_shenasname', title: 'صفحه اول شناسنامه خواهر/برادر', description: 'لطفا تصویر واضح از صفحه اول شناسنامه خواهر/برادر خود را بارگذاری کنید.' }
  ]
};

export const COMMON_DOCUMENTS: RequiredDocument[] = [
    { id: 'verification_photo', title: 'تصویر احراز هویت', description: 'این تصویر باید شامل چهره شما، متن دست‌نوشته زیر و کارت ملی یا شناسنامه جدید باشد.' }
];

export const OLD_SHENASNAME_DOCUMENT: RequiredDocument = {
    id: 'alternative_id', title: 'مدرک هویتی جایگزین برای شناسنامه قدیمی', description: 'در صورتی که شناسنامه شما قدیمی است، یکی از این موارد را بارگذاری کنید: گواهینامه، کارت پایان خدمت، کارت معافیت یا پاسپورت.'
};

export const HANDWRITTEN_NOTE_TEXT = `اینجانب ......... به کد ملی ......... در تاریخ ......... با مطالعه کامل قوانین و موافقت‌نامه سایت والکس، متعهد می‌شوم حساب کاربری خود را در اختیار شخص دیگری قرار ندهم. در صورت تخلف، مسئول جبران خسارات طبق قوانین والکس هستم.\n\nنام و نام خانوادگی – امضا – تاریخ`;
