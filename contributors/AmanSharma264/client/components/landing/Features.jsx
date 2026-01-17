'use client';

import { useState } from 'react';
import { Zap, TrendingUp, Shield, Bell, BarChart3, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Get notified before every payment so you\'re always in control of your spending.',
    color: 'from-yellow-400 to-orange-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Smart Analytics',
    description: 'Visualize your spending patterns and discover opportunities to save money.',
    color: 'from-green-400 to-emerald-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is encrypted end-to-end with industry-leading security protocols.',
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never forget to cancel unwanted subscriptions or miss important renewal dates.',
    color: 'from-purple-400 to-pink-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    icon: BarChart3,
    title: 'Expense Insights',
    description: 'Understand where your money goes with detailed reports and recommendations.',
    color: 'from-indigo-400 to-purple-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  {
    icon: CreditCard,
    title: 'Multi-Account Support',
    description: 'Track subscriptions across multiple credit cards and payment methods.',
    color: 'from-pink-400 to-rose-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  }
];

export default function Features() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="relative py-32 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything you need to
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              manage subscriptions
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to help you save money and stay organized
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative p-8 rounded-2xl border ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  hoveredIndex === index ? 'z-10' : ''
                }`}
              >
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Animated Corner Accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}