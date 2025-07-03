import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BarChart3, Users, Briefcase, MessageSquare, TrendingUp, Calendar, Plus, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Application {
  id: string
  status: string
  created_at: string
  cover_letter: string
  user_id: string
  job_id: string
  jobs: {
    title: string
    company: string
  }
  profiles: {
    full_name: string
    email: string
  }
  resumes: {
    name: string
    email: string
    phone: string
    skills: string[]
  }
}

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviews: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewDetails, setInterviewDetails] = useState({
    interview_date: '',
    interview_time: '',
    location: '',
    dress_code: '',
    items_to_bring: '',
    additional_instructions: ''
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load employer's jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false })
      
      setRecentJobs(jobs || [])
      
      // Load applications for employer's jobs
      const { data: applicationsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            title,
            company,
            employer_id
          ),
          profiles!applications_user_id_fkey (
            full_name,
            email
          ),
          resumes (
            name,
            email,
            phone,
            skills
          )
        `)
        .eq('jobs.employer_id', user?.id)
        .order('created_at', { ascending: false })

      if (appsError) {
        console.error('Error loading applications:', appsError)
      } else {
        setApplications(applicationsData || [])
      }
      
      // Calculate stats
      const jobsCount = jobs?.length || 0
      const appsCount = applicationsData?.length || 0
      const newAppsCount = applicationsData?.filter(app => app.status === 'pending').length || 0
      const interviewsCount = applicationsData?.filter(app => app.status === 'interview').length || 0
      
      setStats({
        activeJobs: jobsCount,
        totalApplications: appsCount,
        newApplications: newAppsCount,
        interviews: interviewsCount
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      // If accepting for interview, show interview details modal
      if (newStatus === 'interview') {
        const application = applications.find(app => app.id === applicationId)
        setSelectedApplication(application || null)
        setShowInterviewModal(true)
      }

      // Reload applications
      await loadDashboardData()
      
      alert(`Application ${newStatus === 'accepted' ? 'accepted' : newStatus === 'rejected' ? 'rejected' : 'updated'} successfully!`)
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Failed to update application status.')
    } finally {
      setUpdating(false)
    }
  }

  const saveInterviewDetails = async () => {
    if (!selectedApplication) return

    try {
      const { error } = await supabase
        .from('interview_details')
        .upsert({
          application_id: selectedApplication.id,
          ...interviewDetails
        })

      if (error) throw error

      setShowInterviewModal(false)
      setInterviewDetails({
        interview_date: '',
        interview_time: '',
        location: '',
        dress_code: '',
        items_to_bring: '',
        additional_instructions: ''
      })
      
      alert('Interview details saved successfully!')
    } catch (error) {
      console.error('Error saving interview details:', error)
      alert('Failed to save interview details.')
    }
  }

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'bg-green-500',
      change: '+23 this week'
    },
    {
      title: 'New Applications',
      value: stats.newApplications,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '5 today'
    },
    {
      title: 'Interviews Scheduled',
      value: stats.interviews,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '3 this week'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'reviewed':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'interview':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
      case 'accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock
      case 'reviewed':
        return Eye
      case 'interview':
        return Calendar
      case 'accepted':
        return CheckCircle
      case 'rejected':
        return XCircle
      default:
        return AlertCircle
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please sign in</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Employer Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your job postings and track applications.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {stat.title}
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-sky-500" />
                Recent Applications
              </h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {applications.length > 0 ? (
                applications.slice(0, 10).map((application) => {
                  const StatusIcon = getStatusIcon(application.status)
                  return (
                    <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-sky-200 dark:hover:border-sky-700 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {application.profiles?.full_name || 'Unknown Applicant'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Applied for {application.jobs?.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {application.status}
                          </span>
                        </div>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'interview')}
                            disabled={updating}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                          >
                            Schedule Interview
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            disabled={updating}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {application.status === 'interview' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            disabled={updating}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            disabled={updating}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Applications will appear here when candidates apply to your jobs</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Job Postings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-sky-500" />
                Your Job Postings
              </h2>
              <button 
                onClick={() => window.location.href = '/post-job'}
                className="flex items-center space-x-1 bg-sky-500 text-white px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Post Job</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {recentJobs.slice(0, 4).map((job: any) => (
                <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sky-200 dark:hover:border-sky-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {job.location}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        <span>{applications.filter(app => app.job_id === job.id).length} applications</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentJobs.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No job postings yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Create your first job posting to start receiving applications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/post-job'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors"
            >
              <Plus className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Post New Job</h3>
              <p className="text-sm text-sky-100">Create a job listing</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <Users className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Review Applications</h3>
              <p className="text-sm text-sky-100">Check new candidates</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <MessageSquare className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Messages</h3>
              <p className="text-sm text-sky-100">Communicate with candidates</p>
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
              <BarChart3 className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-sky-100">View detailed reports</p>
            </button>
          </div>
        </div>
      </div>

      {/* Interview Details Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Schedule Interview
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Provide interview details for {selectedApplication?.profiles?.full_name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewDetails.interview_date}
                    onChange={(e) => setInterviewDetails(prev => ({ ...prev, interview_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewDetails.interview_time}
                    onChange={(e) => setInterviewDetails(prev => ({ ...prev, interview_time: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Location
                </label>
                <input
                  type="text"
                  required
                  value={interviewDetails.location}
                  onChange={(e) => setInterviewDetails(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Company Office, 123 Main Street, Mbabane"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dress Code
                </label>
                <select
                  value={interviewDetails.dress_code}
                  onChange={(e) => setInterviewDetails(prev => ({ ...prev, dress_code: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select dress code</option>
                  <option value="Business Formal">Business Formal</option>
                  <option value="Business Casual">Business Casual</option>
                  <option value="Smart Casual">Smart Casual</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items to Bring
                </label>
                <textarea
                  rows={3}
                  value={interviewDetails.items_to_bring}
                  onChange={(e) => setInterviewDetails(prev => ({ ...prev, items_to_bring: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., CV copies, ID document, portfolio, certificates..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Instructions
                </label>
                <textarea
                  rows={4}
                  value={interviewDetails.additional_instructions}
                  onChange={(e) => setInterviewDetails(prev => ({ ...prev, additional_instructions: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Any additional information the candidate should know..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-4">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveInterviewDetails}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}