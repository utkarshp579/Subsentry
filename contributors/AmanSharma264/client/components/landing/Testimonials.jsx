'use client';

const testimonials = [
  {
    quote: "SubSentry helped me discover I was paying for 3 services I forgot about. Saved me $600 this year!",
    author: "Sarah Mitchell",
    role: "Product Manager",
    avatar: "from-purple-400 to-pink-400"
  },
  {
    quote: "The instant alerts feature is a game-changer. I never miss a payment or renewal date anymore.",
    author: "James Chen",
    role: "Software Engineer",
    avatar: "from-blue-400 to-cyan-400"
  },
  {
    quote: "Finally, a subscription manager that actually works. The analytics helped me cut my monthly expenses by 40%.",
    author: "Emily Rodriguez",
    role: "Entrepreneur",
    avatar: "from-green-400 to-emerald-400"
  }
];

export default function Testimonials() {
  return (
    <section className="relative py-32 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loved by thousands
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            See what our users have to say
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-8 italic text-lg leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.avatar}`} />
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}