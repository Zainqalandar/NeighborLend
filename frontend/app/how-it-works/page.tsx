import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Find what you need",
    text: "Browse useful items shared by people in your neighborhood. Use categories and search to find the right match.",
  },
  {
    number: "02",
    icon: "↗",
    title: "Send a request",
    text: "Open an item, check its details, and send a borrow request to the person who listed it.",
  },
  {
    number: "03",
    icon: "✓",
    title: "Borrow and return",
    text: "Agree on the handoff details, enjoy the item, and return it on time so someone else can use it too.",
  },
];

const values = [
  { icon: "♧", title: "Keep it local", text: "Connect with neighbors nearby and make sharing simple." },
  { icon: "↔", title: "Share more, spend less", text: "Borrow things you need instead of buying them for one-time use." },
  { icon: "✦", title: "Build trust", text: "Communicate clearly, respect every item, and keep your commitments." },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1 bg-[#f8faf5]">
      <section className="relative overflow-hidden bg-[#185c46] text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#dfff88]/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#dfff88]">Simple by design</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl">Sharing with your neighbors starts here.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#cbe0d2]">NeighborLend makes it easy to discover useful items, borrow with confidence, and give things a second life in your community.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/items" className="rounded-full bg-[#dfff88] px-6 py-3.5 text-sm font-semibold text-[#185c46] transition hover:bg-white">Browse items <span className="ml-2">↗</span></Link>
            <Link href="/signup" className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Join NeighborLend</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#163d31] sm:text-4xl">From a quick search to a helpful exchange.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="rounded-3xl border border-[#dfe8df] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f1cb] text-2xl text-[#185c46]">{step.icon}</span><span className="text-sm font-bold text-[#e86e43]">{step.number}</span></div>
              <h3 className="mt-8 text-xl font-semibold text-[#163d31]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#708178]">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e1e9df] bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">For borrowers</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#163d31]">Get what you need, without buying more.</h2>
            <p className="mt-4 max-w-xl leading-7 text-[#708178]">Search by category, review the item details, and contact the owner through a simple request. Always agree on a convenient place and time before collecting the item.</p>
          </div>
          <div className="rounded-3xl bg-[#f1f7e8] p-6 sm:p-8">
            <p className="text-sm font-semibold text-[#285347]">Borrowing checklist</p>
            <ul className="mt-5 space-y-4 text-sm text-[#587067]">
              <li className="flex gap-3"><span className="text-[#e86e43]">✓</span> Read the description and check availability.</li>
              <li className="flex gap-3"><span className="text-[#e86e43]">✓</span> Send a clear request with your preferred timing.</li>
              <li className="flex gap-3"><span className="text-[#e86e43]">✓</span> Treat the item carefully and return it as agreed.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">Why share?</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#163d31] sm:text-4xl">Small exchanges make a stronger neighborhood.</h2></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {values.map((value) => <div key={value.title} className="rounded-2xl border border-[#dfe8df] bg-white p-6"><span className="text-2xl text-[#e86e43]">{value.icon}</span><h3 className="mt-5 font-semibold text-[#285347]">{value.title}</h3><p className="mt-2 text-sm leading-6 text-[#708178]">{value.text}</p></div>)}
        </div>
      </section>

      <section className="bg-[#e4f1cb]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#163d31]">Ready to share something useful?</h2><p className="mt-2 text-sm text-[#587067]">List an item or find your next useful borrow today.</p></div>
          <Link href="/items" className="rounded-full bg-[#185c46] px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#124a38]">Explore items <span className="ml-2">↗</span></Link>
        </div>
      </section>
    </main>
  );
}
