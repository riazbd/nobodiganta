import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';

export default function Terms() {
  const { lang, settings } = useApp();
  const siteName = lang === 'bn'
    ? (settings.site_name    || 'নব দিগন্ত')
    : (settings.site_name_en || settings.site_name || 'Nobo Digonto');
  const contactEmail = settings.contact_email || 'info@nobodigonto.com';

  return (
    <>
      <Head>
        <title>{lang === 'bn' ? `ব্যবহারের শর্তাবলী | ${siteName}` : `Terms of Use | ${siteName}`}</title>
      </Head>
      <div className="g-side">
        <div>
          <div className="sec" style={{ marginBottom: 18 }}>
            <div className="sec-hdr">
              <div className="sec-ttl">{lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}</div>
            </div>

            {lang === 'bn' ? (
              <div className="static-page-body">
                <p className="static-updated">সর্বশেষ আপডেট: ১ জানুয়ারি ২০২৬</p>

                <h2>গ্রহণযোগ্যতা</h2>
                <p>{siteName}-এর ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর সাথে একমত না হন, তাহলে আমাদের সাইট ব্যবহার থেকে বিরত থাকুন।</p>

                <h2>সেবার বিবরণ</h2>
                <p>{siteName} বাংলাদেশ ও বিশ্বের সর্বশেষ সংবাদ, বিশ্লেষণ, মতামত এবং মাল্টিমিডিয়া কন্টেন্ট প্রদান করে। আমরা যেকোনো সময় পূর্ব নোটিশ ছাড়াই আমাদের সেবা পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার রাখি।</p>

                <h2>মেধাস্বত্ব ও কপিরাইট</h2>
                <p>এই ওয়েবসাইটে প্রকাশিত সকল কন্টেন্ট — সংবাদ, ছবি, ভিডিও, গ্রাফিক্স, লোগো এবং লেআউট — {siteName} ও এর লাইসেন্সদাতাদের মেধাস্বত্ব দ্বারা সংরক্ষিত।</p>
                <p>নিষিদ্ধ কার্যক্রম:</p>
                <ul>
                  <li>অনুমতি ছাড়া কোনো কন্টেন্ট পুনঃপ্রকাশ, বিতরণ বা বাণিজ্যিক ব্যবহার</li>
                  <li>আমাদের লোগো বা ব্র্যান্ড উপাদান ব্যবহার</li>
                  <li>ওয়েবসাইটের কোনো অংশ স্ক্র্যাপ বা স্বয়ংক্রিয়ভাবে ডাউনলোড করা</li>
                  <li>কন্টেন্ট পরিবর্তন বা ডেরিভেটিভ কাজ তৈরি</li>
                </ul>
                <p>ব্যক্তিগত ও অ-বাণিজ্যিক ব্যবহারের জন্য সংবাদের সারাংশ বা ছোট উদ্ধৃতি শেয়ার করা অনুমোদিত, তবে অবশ্যই {siteName}-কে উৎস হিসেবে উল্লেখ করতে হবে।</p>

                <h2>ব্যবহারকারীর আচরণ</h2>
                <p>আমাদের সাইট ব্যবহার করার সময় আপনি নিম্নলিখিত কাজ থেকে বিরত থাকতে সম্মত হচ্ছেন:</p>
                <ul>
                  <li>মিথ্যা, বিভ্রান্তিকর বা ক্ষতিকর তথ্য প্রচার</li>
                  <li>ঘৃণামূলক, অশ্লীল বা হুমকিমূলক বক্তব্য</li>
                  <li>অন্যের ব্যক্তিগত তথ্য প্রকাশ বা হয়রানি</li>
                  <li>স্প্যাম বা অননুমোদিত বিজ্ঞাপন প্রচার</li>
                  <li>ভাইরাস বা ক্ষতিকর কোড প্রেরণ</li>
                  <li>অন্যের পরিচয় ধারণ করা</li>
                  <li>বাংলাদেশের প্রচলিত আইন লঙ্ঘন</li>
                </ul>

                <h2>মন্তব্য নীতি</h2>
                <p>আমাদের সংবাদে মন্তব্য করার সুযোগ রয়েছে। মন্তব্য প্রকাশের জন্য:</p>
                <ul>
                  <li>মন্তব্য অবশ্যই প্রাসঙ্গিক এবং সম্মানজনক হতে হবে</li>
                  <li>ব্যক্তিগত আক্রমণ, গালাগালি বা হুমকি গ্রহণযোগ্য নয়</li>
                  <li>সাম্প্রদায়িক উস্কানি বা ঘৃণামূলক বক্তব্য নিষিদ্ধ</li>
                  <li>আমরা যেকোনো মন্তব্য সম্পাদনা বা মুছে ফেলার অধিকার রাখি</li>
                  <li>বারবার নীতি লঙ্ঘনকারীদের অ্যাকাউন্ট বন্ধ করা হতে পারে</li>
                </ul>

                <h2>নিবন্ধন ও অ্যাকাউন্ট</h2>
                <p>কিছু সেবা ব্যবহারের জন্য নিবন্ধন প্রয়োজন। অ্যাকাউন্ট তৈরি করে আপনি নিশ্চিত করছেন যে:</p>
                <ul>
                  <li>আপনার বয়স কমপক্ষে ১৩ বছর</li>
                  <li>প্রদত্ত তথ্য সঠিক ও আপ-টু-ডেট</li>
                  <li>আপনি আপনার পাসওয়ার্ড গোপন রাখবেন</li>
                  <li>আপনার অ্যাকাউন্টের সকল কার্যক্রমের জন্য আপনি দায়ী</li>
                </ul>

                <h2>সাবস্ক্রিপশন ও পেমেন্ট</h2>
                <p>প্রিমিয়াম সদস্যতার ক্ষেত্রে:</p>
                <ul>
                  <li>সাবস্ক্রিপশন ফি নির্ধারিত মেয়াদের জন্য প্রযোজ্য</li>
                  <li>স্বয়ংক্রিয় নবায়নের ক্ষেত্রে পূর্বে অবহিত করা হবে</li>
                  <li>বাতিলকরণ পরবর্তী বিলিং চক্র থেকে কার্যকর হবে</li>
                  <li>ডিজিটাল কন্টেন্টের ক্ষেত্রে সাধারণত অর্থ ফেরত দেওয়া হয় না</li>
                </ul>

                <h2>দায়বদ্ধতার সীমা</h2>
                <p>{siteName} নিম্নলিখিত বিষয়ে দায়বদ্ধ নয়:</p>
                <ul>
                  <li>সংবাদের উপর ভিত্তি করে নেওয়া কোনো সিদ্ধান্তের পরিণতি</li>
                  <li>তৃতীয় পক্ষের ওয়েবসাইট বা পরিষেবার কন্টেন্ট</li>
                  <li>প্রযুক্তিগত ত্রুটির কারণে সেবা বাধা</li>
                  <li>ব্যবহারকারী-তৈরি কন্টেন্ট</li>
                </ul>

                <h2>তথ্যের নির্ভুলতা</h2>
                <p>{siteName} সর্বদা নির্ভুল ও আপ-টু-ডেট তথ্য প্রদানের চেষ্টা করে। তবে আমরা প্রকাশিত সকল তথ্যের সম্পূর্ণ নির্ভুলতার নিশ্চয়তা দিতে পারি না। ত্রুটি পরিলক্ষিত হলে আমরা যথাশীঘ্র সংশোধন করি।</p>

                <h2>লিঙ্ক নীতি</h2>
                <p>আপনি {siteName}-এর প্রথম পাতায় বা নির্দিষ্ট সংবাদের লিঙ্ক শেয়ার করতে পারেন। তবে ফ্রেমিং বা এমবেডিং পদ্ধতিতে আমাদের কন্টেন্ট প্রদর্শনে পূর্বানুমতি প্রয়োজন।</p>

                <h2>প্রযোজ্য আইন</h2>
                <p>এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত হবে। যেকোনো বিরোধের ক্ষেত্রে ঢাকার আদালতের এখতিয়ার প্রযোজ্য হবে।</p>

                <h2>শর্তাবলী পরিবর্তন</h2>
                <p>আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করতে পারি। পরিবর্তিত শর্তাবলী প্রকাশের পর সাইট ব্যবহার অব্যাহত রাখলে আপনি নতুন শর্তে সম্মত বলে গণ্য হবেন।</p>

                <h2>যোগাযোগ</h2>
                <p>এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে যোগাযোগ করুন:</p>
                <p><strong>ইমেইল:</strong> {contactEmail}</p>
                <p><strong>{siteName}</strong><br />
                {settings.office_address_bn || 'ঢাকা, বাংলাদেশ'}</p>
              </div>
            ) : (
              <div className="static-page-body">
                <p className="static-updated">Last Updated: January 1, 2026</p>

                <h2>Acceptance of Terms</h2>
                <p>By using {siteName}'s website, you agree to these Terms of Use. If you do not agree, please refrain from using our site.</p>

                <h2>Description of Service</h2>
                <p>{siteName} provides the latest news, analysis, opinions, and multimedia content from Bangladesh and around the world. We reserve the right to modify, suspend, or discontinue our services at any time without prior notice.</p>

                <h2>Intellectual Property & Copyright</h2>
                <p>All content published on this website — news articles, images, videos, graphics, logos, and layout — is protected by the intellectual property rights of {siteName} and its licensors.</p>
                <p>The following are prohibited without prior written consent:</p>
                <ul>
                  <li>Republishing, distributing, or commercial use of any content</li>
                  <li>Use of our logos or brand elements</li>
                  <li>Scraping or automated downloading of any part of the website</li>
                  <li>Modifying content or creating derivative works</li>
                </ul>
                <p>Sharing short excerpts or summaries for personal, non-commercial use is permitted, provided {siteName} is clearly credited as the source.</p>

                <h2>User Conduct</h2>
                <p>When using our site, you agree not to:</p>
                <ul>
                  <li>Post false, misleading, or harmful content</li>
                  <li>Use hate speech, obscene language, or make threats</li>
                  <li>Disclose others' personal information or engage in harassment</li>
                  <li>Send spam or unauthorised advertisements</li>
                  <li>Upload viruses or malicious code</li>
                  <li>Impersonate another person or organisation</li>
                  <li>Violate applicable laws of Bangladesh or the UK</li>
                </ul>

                <h2>Comments Policy</h2>
                <p>We provide the opportunity to comment on our articles. When commenting:</p>
                <ul>
                  <li>Comments must be relevant and respectful</li>
                  <li>Personal attacks, abuse, and threats are not acceptable</li>
                  <li>Sectarian incitement or hate speech is strictly prohibited</li>
                  <li>We reserve the right to edit or remove any comment</li>
                  <li>Repeat policy violators may have their accounts suspended</li>
                </ul>

                <h2>Registration & Accounts</h2>
                <p>Some services require registration. By creating an account, you confirm that:</p>
                <ul>
                  <li>You are at least 13 years of age</li>
                  <li>The information you provide is accurate and up to date</li>
                  <li>You will keep your password confidential</li>
                  <li>You are responsible for all activity under your account</li>
                </ul>

                <h2>Limitation of Liability</h2>
                <p>{siteName} is not liable for:</p>
                <ul>
                  <li>Consequences of decisions made based on our content</li>
                  <li>Content on third-party websites or services we link to</li>
                  <li>Service interruptions due to technical issues</li>
                  <li>User-generated content</li>
                </ul>

                <h2>Accuracy of Information</h2>
                <p>{siteName} strives to provide accurate and up-to-date information but cannot guarantee the complete accuracy of all published content. Errors, when identified, are corrected promptly.</p>

                <h2>Linking Policy</h2>
                <p>You may share links to {siteName}'s homepage or individual articles. However, framing or embedding our content requires prior written permission.</p>

                <h2>Governing Law</h2>
                <p>These Terms are governed by the laws of Bangladesh. Any disputes shall be subject to the jurisdiction of the courts of Dhaka.</p>

                <h2>Changes to Terms</h2>
                <p>We may update these Terms at any time. Continued use of the site after changes are published constitutes your acceptance of the revised Terms.</p>

                <h2>Contact Us</h2>
                <p>For any questions regarding these Terms, please contact:</p>
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
