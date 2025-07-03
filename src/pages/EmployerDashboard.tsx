import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { BarChart3, Users, Briefcase, MessageSquare, TrendingUp, Calendar, Plus, Eye } from 'lucide-react'

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviews: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([
    {
      id: 1,
      candidateName: 'Thabo Mthembu',
      position: 'Software Developer',
      appliedDate: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      candidateName: 'Nomsa Dlamini',
      position: 'Project Manager',
      appliedDate: '1 day ago',
      status: 'reviewed'
    },
    {
      id: 3,
      candidateName: 'Sipho Nkomo',
      position: 'Marketing Specialist',
      appliedDate: '2 days ago',
      status: 'interview'
    }
  ])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load employer's jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })
      
      setRecentJobs(jobs || [])
      
      // Simulate stats (in real app, these would come from actual data)
      setStats({
        activeJobs: 8,
        totalApplications: 156,
        newApplications: 23,
        interviews: 12
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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
      case 'new':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'reviewed':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'interview':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
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
              <button className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {application.candidateName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Applied for {application.position}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {application.appliedDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Job Postings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-sky-500" />
                Your Job Postings
              </h2>
              <button className="flex items-center space-x-1 bg-sky-500 text-white px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors text-sm">
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
                        <span>12 applications</span>
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
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 text-left transition-colors">
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
    </div>
  )
}