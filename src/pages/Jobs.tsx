import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, Job } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import JobCard from '../components/JobCard'
import { ArrowLeft, MapPin, DollarSign, Building2, Calendar, CheckCircle, ExternalLink, Briefcase, Send, AlertCircle } from 'lucide-react'

export default function Jobs() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
    
    // Set up real-time subscription for jobs
    const subscription = supabase
      .channel('jobs_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          console.log('Real-time update:', payload)
          if (payload.eventType === 'INSERT') {
            setJobs(prev => [payload.new as Job, ...prev])
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

  useEffect(() => {
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId)
      if (job) {
        setSelectedJob(job)
      } else {
        // If job not found in current list, fetch it specifically
        fetchSpecificJob(jobId)
      }
    }
  }, [jobId, jobs])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setJobs(data || [])
    } catch (error: any) {
      console.error('Error fetching jobs:', error)
      setError(error.message || 'Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecificJob = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setSelectedJob(data)
        // Add to jobs list if not already there
        setJobs(prev => {
          const exists = prev.find(job => job.id === data.id)
          return exists ? prev : [data, ...prev]
        })
      }
    } catch (error: any) {
      console.error('Error fetching specific job:', error)
      setError('Job not found or failed to load.')
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    navigate(`/jobs/${job.id}`)
  }

  const handleApply = async () => {
    if (!user) {
      alert('Please sign in to apply for jobs')
      return
    }

    if (!selectedJob) return

    setApplying(true)
    try {
      // Check if user has a resume
      const { data: resumes, error: resumeError } = await supabase
        .from('resumes')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (resumeError) {
        throw resumeError
      }

      if (!resumes || resumes.length === 0) {
        alert('Please create a resume first before applying for jobs.')
        navigate('/resume')
        return
      }

      // Check if already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', selectedJob.id)
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingApplication) {
        alert('You have already applied for this job.')
        return
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: selectedJob.id,
          user_id: user.id,
          resume_id: resumes[0].id,
          status: 'pending',
          cover_letter: ''
        })

      if (applicationError) {
        throw applicationError
      }

      alert('Application submitted successfully! We\'ll be in touch soon.')
    } catch (error: any) {
      console.error('Error applying for job:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleBackToJobs = () => {
    setSelectedJob(null)
    navigate('/jobs')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading jobs...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Jobs</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchJobs}
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToJobs}
            className="flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12">
              <h1 className="text-3xl font-bold text-white mb-4">{selectedJob.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">{selectedJob.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-semibold text-green-400">{selectedJob.salary}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Posted {new Date(selectedJob.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </section>

                  {selectedJob.requirements && (
                    <section>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                      <div className="space-y-2">
                        {selectedJob.requirements.split(',').map((req, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{req.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-6 border border-sky-100 dark:border-sky-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ready to Apply?</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                      Join {selectedJob.company} and take your career to the next level.
                    </p>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Applying...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          Apply Now
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Info</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</span>
                        <p className="text-gray-900 dark:text-white">{selectedJob.company}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</span>
                        <p className="text-gray-900 dark:text-white">{selectedJob.location}</p>
                      </div>
                      <div>
                        <a
                          href="#"
                          className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium"
                        >
                          View Company Profile
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Jobs</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} available across Southern Africa
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs available</h3>
            <p className="text-gray-600 dark:text-gray-300">Check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  )
}