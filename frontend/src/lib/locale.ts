export type Locale = "en" | "bn";

const labels: Record<string, string> = {
  "Home": "হোম", "About": "পরিচিতি", "History": "ইতিহাস", "Mission & Vision": "লক্ষ্য ও দৃষ্টিভঙ্গি",
  "Administration": "প্রশাসন", "Programs": "শিক্ষাক্রম", "Academic Programs": "শিক্ষাক্রম", "Academic programs": "শিক্ষাক্রম",
  "Departments": "বিভাগ", "Courses": "কোর্স", "Research": "গবেষণা", "Publications": "প্রকাশনা",
  "Researchers": "গবেষক", "Research areas": "গবেষণার ক্ষেত্র", "Research projects": "গবেষণা প্রকল্প",
  "Repository and resources": "ডিজিটাল সংগ্রহ ও উপকরণ", "Academic calendar": "শিক্ষা বর্ষপঞ্জি", "Download calendar": "বর্ষপঞ্জি ডাউনলোড",
  "Repository": "ডিজিটাল সংগ্রহ", "Resources": "উপকরণ", "Category": "বিভাগধারা", "Language": "ভাষা",
  "Department": "বিভাগ", "Faculty": "শিক্ষক", "Profile type": "প্রোফাইলের ধরন",
  "Admission guidance": "ভর্তি নির্দেশনা", "Published programs": "প্রকাশিত শিক্ষাক্রম",
  "No admission guidance has been published yet.": "ভর্তির নির্দেশনা এখনো প্রকাশিত হয়নি।",
  "Admission resources": "ভর্তির সংস্থান", "Forms and resources": "ফরম ও উপকরণ",
  "Unit type": "ইউনিটের ধরন", "Unit head": "ইউনিট প্রধান", "Objectives": "উদ্দেশ্য", "Program type": "শিক্ষাক্রমের ধরন",
  "Delivery mode": "শিক্ষাদানের পদ্ধতি", "Eligibility": "যোগ্যতা", "Admissions": "ভর্তি", "Application status": "আবেদনের অবস্থা",
  "Learning outcomes": "শিখনফল", "Education": "শিক্ষাগত যোগ্যতা", "Research interests": "গবেষণার আগ্রহ",
  "Project status": "প্রকল্পের অবস্থা", "Funding": "অর্থায়ন", "Outputs": "ফলাফল", "Publication type": "প্রকাশনার ধরন",
  "Authors": "লেখক", "Editors": "সম্পাদক", "Keywords": "সূচক শব্দ", "Publisher": "প্রকাশক", "Journal": "গবেষণা পত্রিকা",
  "Version": "সংস্করণ", "Rights statement": "অধিকার বিবৃতি", "Official email": "দাপ্তরিক ইমেইল", "Expires": "মেয়াদ শেষ",
  "Preview PDF": "পিডিএফ দেখুন", "Download document": "নথি ডাউনলোড", "Download syllabus": "পাঠ্যসূচি ডাউনলোড",
  "Download brochure": "বিবরণপত্র ডাউনলোড", "External link": "বাহ্যিক লিংক", "Citation": "উদ্ধৃতির তথ্য",
  "Copy citation": "উদ্ধৃতি কপি করুন", "Citation copied.": "উদ্ধৃতি কপি হয়েছে।", "Could not copy citation.": "উদ্ধৃতি কপি করা যায়নি।",
  "People": "সংশ্লিষ্ট ব্যক্তি", "Projects led": "নেতৃত্ব দেওয়া প্রকল্প", "Units headed": "নেতৃত্ব দেওয়া ইউনিট",
  "Program": "শিক্ষাক্রম", "Instructor": "শিক্ষক", "Prerequisites": "পূর্বশর্ত", "Research area": "গবেষণার ক্ষেত্র",
  "Research project": "গবেষণা প্রকল্প", "Project lead": "প্রকল্প প্রধান", "Project team": "প্রকল্প দল",
  "Contributors": "অবদানকারী", "Replacement": "বিকল্প নথি",
  "Gallery": "গ্যালারি", "News": "সংবাদ", "Notices": "নোটিশ", "Events": "অনুষ্ঠান", "Contact": "যোগাযোগ",
  "Institute": "প্রতিষ্ঠান", "Academics": "শিক্ষা", "Updates": "হালনাগাদ", "Services": "সেবা",
  "Search": "অনুসন্ধান", "Search terms": "অনুসন্ধানের শব্দ", "Content type": "কনটেন্টের ধরন",
  "Pages": "পৃষ্ঠা", "All content": "সব কনটেন্ট", "Enter at least two characters.": "অন্তত দুইটি অক্ষর লিখুন।",
  "No matching published content.": "মিল আছে এমন কোনো প্রকাশিত কনটেন্ট পাওয়া যায়নি।",
  "Search is temporarily unavailable.": "অনুসন্ধান সাময়িকভাবে বন্ধ আছে।",
  "This content is temporarily unavailable.": "এই কনটেন্ট সাময়িকভাবে পাওয়া যাচ্ছে না।",
  "No published records.": "প্রকাশিত কোনো তথ্য নেই।", "No published news.": "প্রকাশিত কোনো সংবাদ নেই।",
  "News is temporarily unavailable.": "সংবাদ সাময়িকভাবে পাওয়া যাচ্ছে না।",
  "Previous": "আগের পৃষ্ঠা", "Next": "পরের পৃষ্ঠা", "Pagination": "পৃষ্ঠা বাছাই",
  "View all": "সব দেখুন", "Skip to content": "মূল কনটেন্টে যান", "Open menu": "মেনু খুলুন", "Close menu": "মেনু বন্ধ করুন",
  "Primary navigation": "প্রধান নেভিগেশন", "Mobile navigation": "মোবাইল নেভিগেশন", "Breadcrumb": "পৃষ্ঠা অবস্থান",
  "English content": "ইংরেজি কনটেন্ট", "Some content is available in English only.": "কিছু কনটেন্ট শুধু ইংরেজিতে রয়েছে।",
  "Name": "নাম", "Email": "ইমেইল", "Phone": "ফোন", "Subject": "বিষয়", "Message": "বার্তা",
  "Sending...": "পাঠানো হচ্ছে...", "Submit message": "বার্তা পাঠান", "Your message has been submitted.": "আপনার বার্তা জমা হয়েছে।",
  "Message could not be submitted right now.": "এখন বার্তা পাঠানো যায়নি।",
  "Please complete all required fields correctly.": "প্রয়োজনীয় ঘরগুলো সঠিকভাবে পূরণ করুন।",
  "Send IRRI a message about research, programs, publications, or collaboration.": "গবেষণা, শিক্ষাক্রম, প্রকাশনা বা সহযোগিতা বিষয়ে বার্তা পাঠান।",
  "Explore Programs": "শিক্ষাক্রম দেখুন", "Learn About IRRI": "আইআরআরআই সম্পর্কে জানুন",
  "Established": "প্রতিষ্ঠিত", "Operations started": "কার্যক্রম শুরু", "Motto": "মূলমন্ত্র",
  "Mission": "লক্ষ্য", "Vision": "দৃষ্টিভঙ্গি", "Mission and Vision": "লক্ষ্য ও দৃষ্টিভঙ্গি",
  "English Name": "ইংরেজি নাম", "Bengali Name": "বাংলা নাম", "Location": "অবস্থান", "Operations Started": "কার্যক্রম শুরু",
  "Institute at a Glance": "এক নজরে প্রতিষ্ঠান", "Leadership and institute administration": "নেতৃত্ব ও প্রশাসন",
  "No published profiles.": "প্রকাশিত কোনো প্রোফাইল নেই।", "Profiles are temporarily unavailable.": "প্রোফাইল সাময়িকভাবে পাওয়া যাচ্ছে না।",
  "Latest News": "সর্বশেষ সংবাদ", "Latest Notices": "সর্বশেষ নোটিশ", "Recent events": "সাম্প্রতিক অনুষ্ঠান",
  "No published events.": "প্রকাশিত কোনো অনুষ্ঠান নেই।", "Events are temporarily unavailable.": "অনুষ্ঠানের তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না।",
  "No notices to display.": "দেখানোর মতো কোনো নোটিশ নেই।", "No published albums.": "প্রকাশিত কোনো অ্যালবাম নেই।",
  "Albums are temporarily unavailable.": "অ্যালবাম সাময়িকভাবে পাওয়া যাচ্ছে না।",
  "Contact IRRI": "আইআরআরআইয়ের সঙ্গে যোগাযোগ", "Contact Us": "যোগাযোগ করুন", "Address": "ঠিকানা",
  "Open publication": "প্রকাশনা খুলুন", "Related courses": "সম্পর্কিত কোর্স", "Department programs": "বিভাগের শিক্ষাক্রম",
  "All rights reserved.": "সর্বস্বত্ব সংরক্ষিত।", "Loading IRRI content": "কনটেন্ট লোড হচ্ছে",
  "Page not found": "পৃষ্ঠা পাওয়া যায়নি", "Back to home": "হোমে ফিরুন",
  "Something went wrong": "একটি সমস্যা হয়েছে", "Try again": "আবার চেষ্টা করুন"
};

export function tr(locale: Locale, text: string) {
  return locale === "bn" ? labels[text] ?? text : text;
}

export function localePath(locale: Locale, href: string) {
  if (locale !== "bn" || !href.startsWith("/") || href.startsWith("//")) return href;
  return href === "/" ? "/bn" : `/bn${href}`;
}

export function localized(locale: Locale, original: string, translation?: string | null) {
  return locale === "bn" && translation?.trim()
    ? { text: translation, lang: "bn" as const }
    : { text: original, lang: "en" as const };
}
