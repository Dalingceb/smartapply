import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Job } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import JobCard from '../components/JobCard'
import FeatureSection from '../components/FeatureSection'
import ContactSection from '../components/ContactSection'
import { Briefcase, Users, Award, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
    
    // Set up real-time subscription for jobs on home page
    const subscription = supabase
      .channel('home_jobs_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          console.log('Real-time update on home:', payload)
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as Job, ...prev.slice(0, 5)]) // Keep only 6 jobs
          } else if (payload.eventType === 'UPDATE') {
            setJobs(prev => prev.map(job => 
              job.id === payload.new.id ? payload.new as Job : job
            ))
          } else if (payload.eventType === 'DELETE') {
            setJobs(prev => prev.filter(job => job.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        throw error
      }

      setJobs(data || [])
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
      setError(error.message || 'Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string, location: string, salary: string) => {
    setLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      let searchQuery = supabase.from('jobs').select('*')

      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`)
      }
      
      if (location) {
        searchQuery = searchQuery.ilike('location', `%${location}%`)
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSearchResults(data || [])
    } catch (error: any) {
      console.error('Error searching jobs:', error)
      setError('Failed to search jobs. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`)
  }

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '450+' },
    { icon: Users, label: 'Companies', value: '120+' },
    { icon: Award, label: 'Success Rate', value: '92%' },
    { icon: TrendingUp, label: 'Avg Salary', value: 'E/M/P 35K' },
  ]

  const displayJobs = hasSearched ? searchResults : jobs

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Find Your <span className="text-sky-400">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
              Discover exciting career opportunities across the Kingdom of Eswatini, 
              Lesotho, and Botswana.
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Connect with leading employers in Southern Africa and take the next step in your career journey.
            </p>
            
            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/jobs')}
                  className="bg-sky-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-200 flex items-center justify-center"
                >
                  Browse Jobs
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-slate-900 transition-colors duration-200">
                  Post a Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Southern Africa's Premier Job Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connecting talent with opportunities across Eswatini, Lesotho, and Botswana
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {hasSearched ? 'Search Results' : 'Featured Opportunities'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {hasSearched 
                ? `Found ${displayJobs.length} job${displayJobs.length !== 1 ? 's' : ''} matching your criteria`
                : 'Explore career opportunities from leading organizations across Southern Africa'
              }
            </p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : displayJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {hasSearched 
                  ? 'Try adjusting your search criteria to find more opportunities.'
                  : 'Check back later for new opportunities.'
                }
              </p>
            </div>
          )}

          {!hasSearched && displayJobs.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/jobs')}
                className="bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition duration-200"
              >
                View All Jobs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <FeatureSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  )
}