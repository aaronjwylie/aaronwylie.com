import Link from 'next/link';
import { MailIcon } from './icons';

/** "Got a project?" prompt — reused on the home and tools pages. */
export function ContactCallout() {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent-cyan/10 to-accent-violet/10 p-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet">
          <MailIcon className="h-5 w-5 text-white" />
        </div>
        <p className="text-slate-200">
          <span className="font-semibold text-white">Have a project in mind?</span> I&apos;m
          available for freelance and full-time work, remotely worldwide - let&apos;s talk.
        </p>
      </div>
      <Link href="/#contact" className="btn-primary shrink-0">
        Get in touch
      </Link>
    </div>
  );
}
