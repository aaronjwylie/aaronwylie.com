'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
          website: form.get('website'), // honeypot
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'success') {
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold text-white">Thanks - message received. ✅</p>
        <p className="mt-2 text-sm text-slate-400">
          It was stored by the portfolio API and I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {/* Honeypot: hidden from humans, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Name</span>
          <input
            name="name"
            required
            maxLength={120}
            className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
