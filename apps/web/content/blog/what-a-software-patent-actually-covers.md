When APPIX's patent was granted, I did what I suspect most named inventors do: I opened the PDF, scrolled through thirty-odd pages of diagrams and description, felt vaguely impressed, and closed it again. It was months before I understood that almost none of what I'd skimmed was the part that legally mattered. A patent isn't a document that says "I built this." It's a fence, and only one section draws the fence line.

## The claims are the patent

Everything before the claims - the background, the drawings, the detailed description of embodiments - exists to *teach* and to *support*. It has to describe the invention well enough that someone skilled in the field could build it, and it has to back up every term the claims lean on. But it grants you nothing on its own.

The claims, that numbered list at the very end that reads like it was written by a lawyer allergic to punctuation, are the entire legal scope. If a thing you describe in loving detail in the body never appears in a claim, you have taught the public how to do it and reserved no right to stop them.

## Independent and dependent claims

Claims come in two flavours. **Independent claims** stand alone and are the broadest thing you were allowed to keep after the examiner was done with you. **Dependent claims** reference another claim and pile on extra limitations - "The system of claim 1, wherein the transmitter further comprises..."

Counterintuitively, more limitations means *less* coverage. Each added element is another condition that must be met before anything infringes. So why write them? Insurance. If your broad independent claim gets invalidated later by prior art nobody found during examination, the narrower dependent claims can survive it. You're laying down fallback positions.

## Every element has to be there

This is the rule that reframes how you read a competitor's patent: infringement of a claim generally requires **every element** of that claim to be present. Not most. All.

The consequences run in a direction that surprises engineers. Adding your own features on top doesn't get you clear of a claim - you still have all its elements, plus extras. But *leaving one out* usually does. That's what "designing around" a patent means in practice: read the independent claims, find an element you can genuinely do without or accomplish by a different mechanism, and build that instead.

It also means claim language deserves slow reading. "A plurality of" means two or more. "Comprising" is open-ended - the list that follows is a minimum, not a complete description. "Consisting of" is closed and much narrower. Those words are doing enormous work.

## What this changed about how I read them

Patents turn out to be a genuinely good technical literature, and the description sections are often clearer than the papers covering the same ground. But I read them differently now. The body tells me how something works. The claims tell me what's actually spoken for - and the gap between the two is frequently enormous.

For our own, the useful exercise was mapping claims back to the system: [US 11,838,834](https://patents.google.com/patent/US11838834B2/en) covers the beacon-driven synchronized display and the device self-positioning behind [APPIX](/projects/appix), and reading its claims tells you far more precisely what that means than any summary I could write.

One caveat worth stating plainly: I'm an engineer who has been through this process, not a patent attorney. The mental model above is the one I wish I'd had on day one, but anything with money or a deadline attached deserves a real practitioner.

*Working on something novel enough that this question comes up? [Let's talk](/#contact).*
