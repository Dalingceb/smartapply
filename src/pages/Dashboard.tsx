import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BarChart3, Briefcase, FileText, MessageSquare, TrendingUp, Calendar, Star, MapPin, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, userType } = useAuth()
  const [stats, setStats] = useState({
    applications: 0,
    profileViews: 0,
    savedJobs: 0,
    interviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load user's applications
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          jobs (
            title,
            company
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (appsError && appsError.code !== 'PGRST116') {
        throw appsError
      }

      // Load recommended jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false })
      
      if (jobsError) {
        throw jobsError
      }

      setRecommendedJobs(jobs || [])
      
      // Process applications for stats and activity
      const applicationsData = applications || []
      setStats({
        applications: applicationsData.length,
        profileViews: Math.floor(Math.random() * 100) + 50, // Simulated
        savedJobs: Math.floor(Math.random() * 10) + 1, // Simulated
        interviews: applicationsData.filter(app => app.status === 'interview').length
      })

      // Create recent activity from applications
      const activity = applicationsData.slice(0, 5).map(app => ({
        id: app.id,
        type: 'application',
        title: `Applied to ${app.jobs?.title} at ${app.jobs?.company}`,
        time: new Date(app.created_at).toLocaleDateString(),
        status: app.status
      }))

      setRecentActivity(activity)

    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      setError(error.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Applications Sent',
      value: stats.applications,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    {
      title: 'Profile Views',
      value: stats.profileViews,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+15 this month'
    },
    {
      title: 'Saved Jobs',
      value: stats.savedJobs,
      icon: Star,
      color: 'bg-yellow-500',
      change: '2 new matches'
    },
    {
      title: 'Interviews',
      value: stats.interviews,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '1 upcoming'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return FileText
      case 'view':
        return TrendingUp
      case 'interview':
        return Calendar
      default:
        return MessageSquare
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'interview':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.user_metadata?.full_name || 'Job Seeker'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's what's happening with your job search today.
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
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-sky-500" />
                Recent Activity
              </h2>
              <button className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Start applying for jobs to see your activity here</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-sky-500" />
                Recommended Jobs
              </h2>
              <button 
                onClick={() => window.location.href = '/jobs'}
                className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job: any) => (
                  <div 
                    key={job.id} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sky-200 dark:hover:border-sky-700 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {job.company}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {job.salary}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No jobs available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/resume'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors"
            >
              <FileText className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Update Resume</h3>
              <p className="text-sm text-sky-100">Keep your profile current</p>
            </button>
            <button 
              onClick={() => window.location.href = '/jobs'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors"
            >
              <Briefcase className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Browse Jobs</h3>
              <p className="text-sm text-sky-100">Find new opportunities</p>
            </button>
            <button 
              onClick={() => window.location.href = '/profile'}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors"
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <h3 className="font-semibold mb-1">Update Profile</h3>
              <p className="text-sm text-sky-100">Complete your profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}