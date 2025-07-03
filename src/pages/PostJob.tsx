import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Building2, MapPin, DollarSign, FileText, Save, Eye, CheckCircle } from 'lucide-react'

export default function PostJob() {
  const { user, userType } = useAuth()
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    jobType: 'full-time',
    experience: 'mid-level'
  })
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setJobData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...jobData,
          employer_id: user?.id
        }])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        setJobData({
          title: '',
          company: '',
          location: '',
          salary: '',
          description: '',
          requirements: '',
          jobType: 'full-time',
          experience: 'mid-level'
        })
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error posting job:', error)
      alert('Failed to post job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please sign in</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be signed in to post a job.</p>
        </div>
      </div>
    )
  }

  if (userType !== 'employer') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">Only employers can post jobs. Please contact support if you need to change your account type.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Your job listing is now live and candidates can start applying.</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => window.location.href = '/employer-dashboard'}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Post a New Job</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a compelling job listing to attract the best candidates across Southern Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-sky-500" />
                Job Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={jobData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="e.g., Senior Software Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={jobData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="Your company name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <select
                      required
                      value={jobData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select location</option>
                      <option value="Mbabane, Eswatini">Mbabane, Eswatini</option>
                      <option value="Manzini, Eswatini">Manzini, Eswatini</option>
                      <option value="Lobamba, Eswatini">Lobamba, Eswatini</option>
                      <option value="Big Bend, Eswatini">Big Bend, Eswatini</option>
                      <option value="Nhlangano, Eswatini">Nhlangano, Eswatini</option>
                      <option value="Maseru, Lesotho">Maseru, Lesotho</option>
                      <option value="Teyateyaneng, Lesotho">Teyateyaneng, Lesotho</option>
                      <option value="Mafeteng, Lesotho">Mafeteng, Lesotho</option>
                      <option value="Hlotse, Lesotho">Hlotse, Lesotho</option>
                      <option value="Gaborone, Botswana">Gaborone, Botswana</option>
                      <option value="Francistown, Botswana">Francistown, Botswana</option>
                      <option value="Maun, Botswana">Maun, Botswana</option>
                      <option value="Kasane, Botswana">Kasane, Botswana</option>
                      <option value="Serowe, Botswana">Serowe, Botswana</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      required
                      value={jobData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                      placeholder="e.g., E15,000 - E25,000 / M18,000 - M28,000 / P35,000 - P50,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobData.jobType}
                      onChange={(e) => handleInputChange('jobType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={jobData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="entry-level">Entry Level</option>
                      <option value="mid-level">Mid Level</option>
                      <option value="senior-level">Senior Level</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={jobData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={jobData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="List the required qualifications, skills, and experience (separate with commas)..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Posting Job...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" />
                        Post Job
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-sky-500" />
                Job Preview
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {jobData.title || 'Job Title'}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                    {jobData.company || 'Company Name'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  {jobData.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {jobData.location}
                    </div>
                  )}
                  {jobData.salary && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {jobData.salary}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm font-medium">
                    {jobData.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {jobData.experience.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                {jobData.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {jobData.description}
                    </p>
                  </div>
                )}

                {jobData.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h4>
                    <div className="space-y-1">
                      {jobData.requirements.split(',').map((req, index) => (
                        <div key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-2 h-2 bg-sky-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span>{req.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}