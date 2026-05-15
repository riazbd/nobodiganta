import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';

export default function Privacy() {
  const { lang, settings } = useApp();
  const siteName = lang === 'bn'
    ? (settings.site_name    || 'নব দিগন্ত')
    : (settings.site_name_en || settings.site_name || 'Nobo Digonto');
  const contactEmail = settings.contact_email || 'info@nobodigonto.com';

  return (
    <>
      <Head>
        <title>{lang === 'bn' ? `গোপনীয়তা নীতি | ${siteName}` : `Privacy Policy | ${siteName}`}</title>
      </Head>
      <div className="g-side">
        <div>
          <div className="sec" style={{ marginBottom: 18 }}>
            <div className="sec-hdr">
              <div className="sec-ttl">{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</div>
            </div>

            {lang === 'bn' ? (
              <div className="static-page-body">
                <p className="static-updated">সর্বশেষ আপডেট: ১ জানুয়ারি ২০২৬</p>

                <h2>ভূমিকা</h2>
                <p>{siteName} ("আমরা", "আমাদের") আপনার গোপনীয়তাকে অত্যন্ত গুরুত্বের সাথে বিবেচনা করে। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আপনি যখন আমাদের ওয়েবসাইট ব্যবহার করেন তখন আমরা কী ধরনের তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি।</p>

                <h2>আমরা কী তথ্য সংগ্রহ করি</h2>
                <h3>স্বেচ্ছায় প্রদত্ত তথ্য</h3>
                <p>আপনি যখন আমাদের সাথে যোগাযোগ করেন, নিবন্ধন করেন বা সাবস্ক্রাইব করেন, তখন আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:</p>
                <ul>
                  <li>নাম এবং যোগাযোগের তথ্য (ইমেইল, ফোন নম্বর)</li>
                  <li>ব্যবহারকারীর নাম এবং পাসওয়ার্ড</li>
                  <li>মন্তব্য ও মতামত</li>
                  <li>যোগাযোগ ফর্মের মাধ্যমে প্রেরিত বার্তা</li>
                </ul>

                <h3>স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য</h3>
                <p>আমাদের সাইট ভিজিট করলে স্বয়ংক্রিয়ভাবে নিম্নলিখিত তথ্য সংগ্রহ হতে পারে:</p>
                <ul>
                  <li>আইপি ঠিকানা ও ডিভাইসের তথ্য</li>
                  <li>ব্রাউজারের ধরন ও ভাষা</li>
                  <li>পরিদর্শন করা পাতাসমূহ এবং সময়কাল</li>
                  <li>রেফারিং ওয়েবসাইট</li>
                  <li>কুকিজ এবং অনুরূপ প্রযুক্তি</li>
                </ul>

                <h2>তথ্যের ব্যবহার</h2>
                <p>আমরা সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
                <ul>
                  <li>আমাদের সেবা প্রদান ও উন্নত করা</li>
                  <li>আপনার অ্যাকাউন্ট পরিচালনা করা</li>
                  <li>ব্রেকিং নিউজ ও নিউজলেটার পাঠানো (আপনার সম্মতিক্রমে)</li>
                  <li>আপনার অভিজ্ঞতা ব্যক্তিগতকৃত করা</li>
                  <li>আইনি বাধ্যবাধকতা পূরণ করা</li>
                  <li>প্রতারণা ও নিরাপত্তা লঙ্ঘন প্রতিরোধ করা</li>
                </ul>

                <h2>কুকিজ নীতি</h2>
                <p>আমরা আমাদের ওয়েবসাইটের কার্যকারিতা উন্নত করতে কুকিজ ব্যবহার করি। কুকিজ হলো ছোট টেক্সট ফাইল যা আপনার ব্রাউজারে সংরক্ষিত হয়। আমরা নিম্নলিখিত ধরনের কুকিজ ব্যবহার করি:</p>
                <ul>
                  <li><strong>প্রয়োজনীয় কুকিজ:</strong> সাইটের মৌলিক কার্যকারিতার জন্য অপরিহার্য।</li>
                  <li><strong>বিশ্লেষণ কুকিজ:</strong> ব্যবহারকারীরা কীভাবে আমাদের সাইট ব্যবহার করেন তা বুঝতে সাহায্য করে।</li>
                  <li><strong>পছন্দ কুকিজ:</strong> আপনার পছন্দ ও সেটিংস মনে রাখে।</li>
                </ul>
                <p>আপনি আপনার ব্রাউজার সেটিংসের মাধ্যমে কুকিজ নিয়ন্ত্রণ করতে পারেন, তবে কিছু কুকিজ নিষ্ক্রিয় করলে সাইটের কার্যকারিতা সীমিত হতে পারে।</p>

                <h2>তথ্য ভাগাভাগি</h2>
                <p>আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে বিক্রি করি না। তবে নিম্নলিখিত ক্ষেত্রে তথ্য শেয়ার করা হতে পারে:</p>
                <ul>
                  <li>আইনি বাধ্যবাধকতা পূরণে (আদালতের আদেশ, সরকারি নির্দেশ)</li>
                  <li>আমাদের সেবা প্রদানকারী বিশ্বস্ত অংশীদারদের সাথে (যেমন: হোস্টিং, ইমেইল সার্ভিস)</li>
                  <li>আমাদের ও ব্যবহারকারীদের অধিকার সুরক্ষায়</li>
                </ul>

                <h2>তথ্য সংরক্ষণ ও সুরক্ষা</h2>
                <p>আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি, যার মধ্যে রয়েছে SSL এনক্রিপশন, ফায়ারওয়াল এবং নিয়মিত নিরাপত্তা অডিট। আপনার তথ্য কেবল ততক্ষণ সংরক্ষণ করা হয় যতক্ষণ প্রয়োজন বা আইনগতভাবে বাধ্যবাধক।</p>

                <h2>আপনার অধিকার</h2>
                <p>আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
                <ul>
                  <li>আপনার সম্পর্কে সংরক্ষিত তথ্য দেখার অধিকার</li>
                  <li>ভুল তথ্য সংশোধনের অনুরোধ করার অধিকার</li>
                  <li>তথ্য মুছে ফেলার অনুরোধ করার অধিকার</li>
                  <li>নিউজলেটার বা মার্কেটিং যোগাযোগ থেকে বেরিয়ে যাওয়ার অধিকার</li>
                </ul>
                <p>এই অধিকারগুলো প্রয়োগ করতে আমাদের সাথে যোগাযোগ করুন: <strong>{contactEmail}</strong></p>

                <h2>তৃতীয় পক্ষের লিংক</h2>
                <p>আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকতে পারে। এই সাইটগুলোর নিজস্ব গোপনীয়তা নীতি রয়েছে এবং সেগুলোর জন্য আমরা দায়ী নই।</p>

                <h2>শিশুদের গোপনীয়তা</h2>
                <p>আমাদের সেবা ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা জেনে-শুনে শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না।</p>

                <h2>নীতি পরিবর্তন</h2>
                <p>আমরা এই গোপনীয়তা নীতি যেকোনো সময় পরিবর্তন করতে পারি। পরিবর্তনের ক্ষেত্রে আমরা এই পাতায় আপডেট তারিখ জানাব। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে নিবন্ধিত ব্যবহারকারীদের ইমেইলে জানানো হবে।</p>

                <h2>যোগাযোগ</h2>
                <p>গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন বা উদ্বেগের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
                <p><strong>ইমেইল:</strong> {contactEmail}</p>
                <p><strong>{siteName}</strong><br />
                {settings.office_address_bn || 'ঢাকা, বাংলাদেশ'}</p>
              </div>
            ) : (
              <div className="static-page-body">
                <p className="static-updated">Last Updated: January 1, 2026</p>

                <h2>Introduction</h2>
                <p>{siteName} ("we", "our", "us") takes your privacy seriously. This Privacy Policy explains what information we collect when you use our website, how we use it, and how we keep it secure.</p>

                <h2>Information We Collect</h2>
                <h3>Information You Provide Voluntarily</h3>
                <p>When you contact us, register, or subscribe, we may collect:</p>
                <ul>
                  <li>Name and contact details (email address, phone number)</li>
                  <li>Username and password</li>
                  <li>Comments and opinions</li>
                  <li>Messages submitted via contact forms</li>
                </ul>

                <h3>Information Collected Automatically</h3>
                <p>When you visit our site, we may automatically collect:</p>
                <ul>
                  <li>IP address and device information</li>
                  <li>Browser type and language</li>
                  <li>Pages visited and time spent</li>
                  <li>Referring website</li>
                  <li>Cookies and similar technologies</li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>We use collected information to:</p>
                <ul>
                  <li>Provide and improve our services</li>
                  <li>Manage your account</li>
                  <li>Send breaking news alerts and newsletters (with your consent)</li>
                  <li>Personalise your experience</li>
                  <li>Fulfil legal obligations</li>
                  <li>Prevent fraud and security breaches</li>
                </ul>

                <h2>Cookie Policy</h2>
                <p>We use cookies to enhance website functionality. Cookies are small text files stored in your browser. We use the following types:</p>
                <ul>
                  <li><strong>Essential cookies:</strong> Required for basic site functionality.</li>
                  <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site.</li>
                  <li><strong>Preference cookies:</strong> Remember your settings and preferences.</li>
                </ul>
                <p>You can control cookies through your browser settings, though disabling some may limit site functionality.</p>

                <h2>Sharing Your Information</h2>
                <p>We do not sell your personal information. We may share it only in the following circumstances:</p>
                <ul>
                  <li>To comply with legal obligations (court orders, government directives)</li>
                  <li>With trusted service providers (hosting, email services) under strict confidentiality</li>
                  <li>To protect the rights and safety of our users and organisation</li>
                </ul>

                <h2>Data Storage & Security</h2>
                <p>We use industry-standard security measures including SSL encryption, firewalls, and regular security audits to protect your data. Your information is retained only as long as necessary or legally required.</p>

                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of newsletters or marketing communications</li>
                </ul>
                <p>To exercise these rights, contact us at: <strong>{contactEmail}</strong></p>

                <h2>Third-Party Links</h2>
                <p>Our website may contain links to third-party websites. These sites have their own privacy policies and we are not responsible for their practices.</p>

                <h2>Children's Privacy</h2>
                <p>Our services are not directed at children under the age of 13. We do not knowingly collect personal information from children.</p>

                <h2>Changes to This Policy</h2>
                <p>We may update this Privacy Policy at any time. Changes will be reflected by an updated date on this page. Registered users will be notified by email of significant changes.</p>

                <h2>Contact Us</h2>
                <p>For any privacy-related questions or concerns, please contact:</p>
                <p><strong>Email:</strong> {contactEmail}</p>
                <p><strong>{siteName}</strong><br />
                {settings.office_address_en || 'Dhaka, Bangladesh'}</p>
              </div>
            )}
          </div>
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
