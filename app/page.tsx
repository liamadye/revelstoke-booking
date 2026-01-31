import BookingForm from "@/components/BookingForm";
import { MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10" />
        {/* Real Revelstoke / Mountain Image */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=2626&auto=format&fit=crop')] bg-cover bg-center"
          aria-label="Snowy mountains in Revelstoke"
        />

        <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-end pb-32 text-white">
          <span className="text-sm font-medium tracking-[0.2em] uppercase mb-4 opacity-90">Revelstoke, BC</span>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter max-w-4xl">
            Alpine Sanctuary.
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 flex items-center gap-2 max-w-2xl">
            <MapPin className="w-5 h-5" />
            24-414 Humbert Street
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-20">

            <section className="prose prose-lg text-stone-600 max-w-none">
              <h2 className="text-4xl font-bold text-stone-900 mb-8 font-display tracking-tight">The Space</h2>
              <p className="text-xl leading-relaxed">
                Nestled in the heart of British Columbia's interior, our mountain home offers a
                refined escape for those seeking adventure and tranquility. Designed with modern
                aesthetics and comfort in mind, it's the perfect basecamp for your Revelstoke experience.
              </p>
              <p className="text-lg leading-relaxed mt-6">
                Wake up to mountain views, spend your days exploring world-class terrain, and
                unwind in a space that feels like home.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-stone-900 mb-10 font-display tracking-tight">Things to Do</h2>
              <div className="space-y-12">
                {[
                  {
                    title: "Revelstoke Mountain Resort",
                    desc: "Boasting the most vertical in North America, RMR offers incredible skiing in winter and pipe coaster thrilling in summer.",
                    img: "https://images.unsplash.com/photo-1565992441121-4367c2967103?q=80&w=2727&auto=format&fit=crop",
                    link: "https://www.revelstokemountainresort.com"
                  },
                  {
                    title: "Downtown Dining & Après",
                    desc: "Explore the vibrant downtown core just minutes away. Enjoy craft breweries, distilleries, and locally sourced dining.",
                    img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2574&auto=format&fit=crop",
                    link: "https://www.tripadvisor.ca/Restaurants-g181775-Revelstoke_Kootenay_Rockies_British_Columbia.html"
                  },
                  {
                    title: "Mount Revelstoke National Park",
                    desc: "Drive the Meadows in the Sky Parkway for breathtaking views and alpine wildflowers in the summer months.",
                    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop",
                    link: "https://parks.canada.ca/pn-np/bc/revelstoke"
                  }
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col md:flex-row gap-8 items-start block"
                  >
                    <div className="w-full md:w-1/3 aspect-[4/3] relative overflow-hidden rounded-lg bg-stone-200">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold text-stone-900 mb-3 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-stone-600 leading-relaxed mb-4">{item.desc}</p>
                      <span className="inline-flex items-center text-sm font-medium text-stone-900 hover:text-blue-600 transition-colors cursor-pointer group-hover:translate-x-1 duration-300">
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Booking Form */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-12">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-50 to-stone-50 rounded-3xl blur-2xl opacity-50 -z-10" />
              <BookingForm />
              <div className="text-center mt-8 space-y-2">
                <p className="text-stone-500 text-sm">Have questions?</p>
                <a href="mailto:revelstoke@liamdye.com" className="text-stone-900 font-medium hover:underline">Contact Host</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-stone-900 text-white py-16 border-t border-stone-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-60 text-sm">
          <p>&copy; {new Date().getFullYear()} Liam & Partner</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>24-414 Humbert Street, Revelstoke</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
