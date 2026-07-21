"Check if your password has been breached" sounds like a paradox. To check, you'd have to send your password *somewhere* - and sending your password to a third party is exactly what you're trying to avoid. The clever cryptographic trick that resolves this is called k-anonymity, and it's the model behind [Have I Been Pwned](https://haveibeenpwned.com)'s Pwned Passwords service. Here's how it works, and how to build a checker on top of it.

## The problem

You have a password. A service has a database of hundreds of millions of passwords that appeared in known breaches (stored as hashes). You want to know if yours is in there - without revealing your password, and ideally without the service learning which password you asked about.

## The trick: send a prefix, not the password

Everything happens in three steps, and the password never leaves the browser:

1. **Hash locally.** In the browser, compute `SHA-1(password)` - a 40-character hex string.
2. **Send only the first 5 characters.** That prefix is all the server receives.
3. **Match locally.** The server returns *every* hash suffix that shares that prefix (a few hundred of them). Your browser checks whether its own suffix is in that list.

Because a 5-character prefix matches hundreds of different passwords, the server can't tell which one you were checking. That's the "k" in k-anonymity: your query is hidden in a crowd of *k* others.

## In the browser

Modern browsers hash with the Web Crypto API, so no library is needed:

    async function sha1Hex(input) {
      const data = new TextEncoder().encode(input);
      const buf = await crypto.subtle.digest('SHA-1', data);
      return [...new Uint8Array(buf)]
        .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);   // sent to the server
    const suffix = hash.slice(5);      // stays local

## On the server

The server relays the prefix to HIBP's range API and returns the matching suffixes and their breach counts:

    GET https://api.pwnedpasswords.com/range/{prefix}

The response is a list of `SUFFIX:COUNT` lines. Your browser searches for its `suffix`; if it's there, the count tells you how many breaches that password has appeared in. Not found means it's not in the corpus.

A nice touch: send the `Add-Padding: true` header, and HIBP pads the response with decoy entries so even the *size* of the reply doesn't leak information.

## Why the split matters

It's tempting to just hash and match on the server - but then the server sees the full hash, which combined with the prefix is the whole password fingerprint. Keeping the final match in the browser is the entire point. When I built a breach checker with this model, the server only ever handles a 5-character prefix. It couldn't reverse-engineer which password you tested even if it wanted to.

## The lesson

k-anonymity is a small, elegant idea with a big payoff: you can answer a question about sensitive data without ever holding the sensitive data. It's worth understanding beyond passwords - the same "query in a crowd" pattern shows up anywhere privacy and lookups collide.

*Building something where privacy and correctness both matter? [Let's talk](/#contact).*
