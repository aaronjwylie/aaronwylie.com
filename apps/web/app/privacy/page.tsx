import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How aaronwylie.com handles your data: what is collected via the contact form and analytics, why, who processes it, and your rights.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const UPDATED = 'July 22, 2026';

export default function PrivacyPage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-3">Legal</p>
      <h1 className="mb-2 text-3xl font-extrabold text-white sm:text-4xl">Privacy Policy</h1>
      <p className="mb-10 text-sm text-slate-500">Last updated: {UPDATED}</p>

      <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-accent prose-strong:text-white">
        <p>
          This site (<strong>aaronwylie.com</strong>) is the personal portfolio of Aaron Wylie. I
          take a deliberately minimal approach to data: I collect only what the site needs to
          function and to let you get in touch. I do not sell your data, and I do not use it for
          advertising.
        </p>

        <h2>What I collect</h2>
        <ul>
          <li>
            <strong>Contact form.</strong> When you send a message, I collect the name, email,
            optional project-budget range and message you provide. Your browser&apos;s user-agent
            string is also stored for basic abuse prevention.
          </li>
          <li>
            <strong>Analytics.</strong> I use Google Analytics 4 to understand aggregate traffic
            (pages viewed, approximate region, device type). This uses cookies and collects a
            truncated IP address. It tells me how many people visit and what they read - not who
            you are.
          </li>
          <li>
            <strong>Approximate location.</strong> For each page view, the site derives a coarse
            city and country from your IP address at the time of the request, so I can see where
            visitors come from (shown only in an aggregate daily summary). The IP address itself is
            not stored - only the city and country. To estimate unique visitors, the site also
            stores a daily-rotating, non-reversible hash derived from your IP and browser; it
            cannot be reversed to your IP or linked to you across days.
          </li>
          <li>
            <strong>Server logs.</strong> Like any web server, the infrastructure records requests
            (IP address, timestamp, path) transiently for security and reliability.
          </li>
        </ul>

        <h2>Why I collect it, and the legal basis</h2>
        <ul>
          <li>
            <strong>To respond to you.</strong> Contact-form data is used solely to reply to your
            enquiry. Legal basis: your consent, given by submitting the form.
          </li>
          <li>
            <strong>To improve the site.</strong> Analytics data is used in aggregate to improve
            content and performance. Legal basis: legitimate interest in running the site.
          </li>
          <li>
            <strong>To keep the site secure.</strong> Logs and the user-agent string support abuse
            prevention. Legal basis: legitimate interest in security.
          </li>
        </ul>

        <h2>Who processes your data</h2>
        <p>A few trusted third parties help run the site:</p>
        <ul>
          <li>
            <strong>DigitalOcean</strong> - hosting. The database and application run on a server I
            operate there.
          </li>
          <li>
            <strong>Resend</strong> - delivers the email notification when you use the contact form.
          </li>
          <li>
            <strong>Google Analytics</strong> - aggregate traffic analytics.
          </li>
          <li>
            <strong>ip-api.com</strong> - looks up the approximate city/country for a visitor&apos;s
            IP address. The IP is sent for the lookup only; I don&apos;t retain it.
          </li>
        </ul>
        <p>
          Each processes data under its own privacy terms. I do not share your data with anyone
          else.
        </p>

        <h2>Cookies</h2>
        <p>
          The only cookies set are those used by Google Analytics for aggregate measurement. The
          site sets no advertising or cross-site tracking cookies. You can block cookies in your
          browser, or use a tracker-blocking extension, and the site will still work normally.
        </p>

        <h2>How long it is kept</h2>
        <p>
          Contact messages are retained while I follow up with you and for a reasonable period
          afterwards for my records, then deleted on request. Analytics data is retained per Google
          Analytics&apos; default retention. Server logs rotate and are short-lived.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live (for example under GDPR or PIPEDA), you may have the right to
          access, correct, or delete the personal data I hold about you, or to withdraw consent.
          I&apos;m a one-person operation, so the fastest route is simply to email me and I&apos;ll
          take care of it.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy, or want your data removed? Email{' '}
          <a href="mailto:aaronwyliework@gmail.com">aaronwyliework@gmail.com</a> or use the{' '}
          <Link href="/#contact">contact form</Link>.
        </p>

        <h2>Changes</h2>
        <p>
          If this policy changes, I&apos;ll update this page and the date at the top. Material
          changes will be reflected here.
        </p>
      </div>
    </div>
  );
}
