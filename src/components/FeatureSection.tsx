import React from 'react'
import { Search, Users, MessageSquare, BarChart3, Shield, Zap } from 'lucide-react'

export default function FeatureSection() {
  const features = [
    {
      icon: Search,
      title: 'Smart Job Matching',
      description: 'AI-powered algorithm matches job seekers with relevant opportunities based on skills, experience, and preferences.',
      forJobSeekers: true,
      forEmployers: true
    },
    {
      icon: Users,
      title: 'Applicant Tracking System',
      description: 'Comprehensive ATS to manage applications, track candidates through hiring pipeline, and collaborate with team members.',
      forJobSeekers: false,
      forEmployers: true
    },
    {
      icon: MessageSquare,
      title: 'On-Platform Communication',
      description: 'Built-in messaging system for seamless communication between employers and candidates throughout the hiring process.',
      forJobSeekers: true,
      forEmployers: true
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Detailed insights and analytics for job performance, application trends, and hiring metrics to optimize your strategy.',
      forJobSeekers: true,
      forEmployers: true
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Enhanced security with verified employer and candidate profiles, ensuring authentic and trustworthy connections.',
      forJobSeekers: true,
      forEmployers: true
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Real-time notifications for new job matches, application updates, and important messages to never miss opportunities.',
      forJobSeekers: true,
      forEmployers: true
    }
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Modern Hiring
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            SmartApply provides cutting-edge tools and features designed to streamline the hiring process 
            for both job seekers and employers across Southern Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-sky-700 transform hover:scale-[1.02]"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {feature.forJobSeekers && (
                    <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm font-medium">
                      Job Seekers
                    </span>
                  )}
                  {feature.forEmployers && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      Employers
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Hiring Process?</h3>
            <p className="text-sky-100 mb-6 max-w-2xl mx-auto">
              Join thousands of employers and job seekers who have already discovered the power of SmartApply's 
              comprehensive platform for modern recruitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Start Hiring Today
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-sky-600 transition-colors duration-200">
                Find Your Dream Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}