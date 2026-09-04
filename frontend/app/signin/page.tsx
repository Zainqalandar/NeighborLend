import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe7df] bg-white shadow-[0_24px_70px_rgba(37,72,55,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#163d31]">Sign in to NeighborLend</h1>
            <p className="mt-2 text-sm leading-6 text-[#708178]">Pick up where you left off with your neighborhood community.</p>

            <div className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-[#285347]">
                Email address
                <input type="email" placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-[#d6e1d8] bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10" />
              </label>
              <label className="block text-sm font-semibold text-[#285347]">
                Password
                <input type="password" placeholder="Enter your password" className="mt-2 h-12 w-full rounded-xl border border-[#d6e1d8] bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10" />
              </label>
              <div className="flex items-center justify-between text-xs text-[#708178]">
                <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-[#cddbd0] accent-[#185c46]" /> Remember me</label>
                <button type="button" className="font-semibold text-[#185c46] hover:underline">Forgot password?</button>
              </div>
              <button type="button" className="h-12 w-full rounded-xl bg-[#185c46] text-sm font-semibold text-white transition hover:bg-[#124a38]">Sign in</button>
            </div>

            <p className="mt-7 text-center text-sm text-[#708178]">New to NeighborLend? <Link href="/signup" className="font-semibold text-[#185c46] hover:underline">Create an account</Link></p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[#f1f6e9] p-10 lg:block">
          <div className="absolute right-[-70px] top-[-70px] h-64 w-64 rounded-full bg-[#dfff88]" />
          <div className="absolute bottom-[-90px] left-[-70px] h-64 w-64 rounded-full bg-[#f28a5b]/25" />
          <div className="relative flex h-full flex-col justify-center">
            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#185c46] text-[#dfff88] shadow-lg">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.8 4.7 7.2v5.3c0 4 2.9 6.8 7.3 8 4.4-1.2 7.3-4 7.3-8V7.2L12 3.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m8.8 12 2.1 2.1 4.4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#163d31]">Good things are better when shared.</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#62766a]">Find what you need nearby, lend what you have, and make everyday life a little more connected.</p>
            <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-[#285347]"><span className="h-2.5 w-2.5 rounded-full bg-[#e86e43]" /> Trusted by local communities</div>
          </div>
        </div>
      </section>
    </main>
  );
}
