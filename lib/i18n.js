export const LANGUAGES = [
  { code: 'he', label: 'עברית', dir: 'rtl', flag: '🇮🇱' },
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
]

export const translations = {
  he: {
    howWasYourExperience: 'איך הייתה החוויה שלך אצלנו?',
    tapToRate: 'לחץ על הכוכב המתאים לך',
    sorryToHear: 'נשמח לשמוע מה יש לך לומר',
    tellUsWhatWentWrong: 'שתף אותנו בחוויה שלך — המשוב שלך עוזר לנו להשתפר.',
    yourComment: 'ספר לנו על החוויה שלך...',
    yourName: 'שם (אופציונלי)',
    yourPhone: 'טלפון (אופציונלי)',
    submitFeedback: 'שלח משוב',
    sending: 'שולח...',
    thankYou: 'תודה רבה!',
    thankYouMsg: 'הודעתך נשלחה ישירות למנהל החנות. נשתדל להשתפר.',
    goBack: '← חזור',
    feedbackHelper: 'המשוב שלך עוזר לנו להשתפר.',
    errorMsg: 'משהו השתבש. נסה שוב.',
    labels: ['איום', 'גרוע', 'סביר', 'טוב', 'מדהים!'],
  },
  en: {
    howWasYourExperience: 'How was your experience with us?',
    tapToRate: 'Tap a star to rate',
    sorryToHear: "We'd love to hear from you",
    tellUsWhatWentWrong: 'Share your experience with us — your feedback helps us improve.',
    yourComment: 'Tell us about your experience…',
    yourName: 'Your name (optional)',
    yourPhone: 'Phone number (optional)',
    submitFeedback: 'Submit Feedback',
    sending: 'Sending…',
    thankYou: 'Thank You!',
    thankYouMsg: 'Your message has been sent directly to the store manager to help us improve.',
    goBack: '← Go back',
    feedbackHelper: 'Your feedback helps us serve you better.',
    errorMsg: 'Something went wrong. Please try again.',
    labels: ['Terrible', 'Poor', 'Okay', 'Good', 'Amazing!'],
  },
  ar: {
    howWasYourExperience: 'كيف كانت تجربتك معنا؟',
    tapToRate: 'اضغط على النجمة لتقييمنا',
    sorryToHear: 'يسعدنا سماع رأيك',
    tellUsWhatWentWrong: 'شاركنا تجربتك — ملاحظاتك تساعدنا على التحسين.',
    yourComment: 'حدثنا عن تجربتك...',
    yourName: 'اسمك (اختياري)',
    yourPhone: 'رقم الهاتف (اختياري)',
    submitFeedback: 'إرسال الملاحظات',
    sending: 'جارٍ الإرسال...',
    thankYou: 'شكراً جزيلاً!',
    thankYouMsg: 'تم إرسال رسالتك مباشرة إلى مدير المتجر لمساعدتنا على التحسين.',
    goBack: '← العودة',
    feedbackHelper: 'ملاحظاتك تساعدنا على تقديم خدمة أفضل.',
    errorMsg: 'حدث خطأ ما. حاول مرة أخرى.',
    labels: ['سيئ جداً', 'سيئ', 'مقبول', 'جيد', 'رائع!'],
  },
}

export function getLang(code) {
  return translations[code] ?? translations['he']
}

export function getLangMeta(code) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}
