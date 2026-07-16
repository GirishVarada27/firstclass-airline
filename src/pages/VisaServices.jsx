const FEATURES = [
  { icon: '📋', title: 'Document checklist', text: 'Personalized visa document requirements based on your nationality and destination.' },
  { icon: '🔍', title: 'Application review', text: 'Our specialists check your paperwork before you submit to avoid embassy rejections.' },
  { icon: '📅', title: 'Embassy scheduling', text: 'We help you book the earliest available appointment slot at your local consulate.' },
  { icon: '⚡', title: 'Fast-track processing', text: 'Expedited options available for over 100 destinations for urgent travel.' },
]

export default function VisaServices() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">FirstClass Visa Services</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">
          Your visa, handled.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Booking an international flight with FirstClass? Let our visa concierge team guide you through
          entry requirements, paperwork, and embassy appointments — so all you have to do is pack.
        </p>
        <a
          href="mailto:visa@firstclass.example?subject=Visa%20Assistance%20Request"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 px-7 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
        >
          Request Visa Assistance
        </a>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-3 text-lg font-bold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/10 to-cyan-500/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Traveling to over 100 countries? We've got you covered.</h2>
        <p className="mt-2 text-slate-400">From tourist visas to business entry permits — our team partners with licensed visa agencies worldwide.</p>
      </div>
    </div>
  )
}
