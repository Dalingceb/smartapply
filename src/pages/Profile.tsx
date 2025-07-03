import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, MapPin, Globe, Edit2, Save, Camera, FileText, Briefcase, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setProfile(data)
          setEditedProfile(data)
        } else {
          // Create a new profile if none exists
          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: '',
            bio: '',
            location: '',
            website: '',
            user_type: 'jobseeker' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // Try to create the profile in the database
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)

          if (insertError) {
            console.error('Error creating profile:', insertError)
          }

          setProfile(newProfile)
          setEditedProfile(newProfile)
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setError(error.message || 'Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...editedProfile,
          id: user.id,
          updated_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setProfile({ ...editedProfile } as Profile)
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={loadProfile}
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please sign in</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be signed in to view your profile.</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition duration-200">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="text-3xl font-bold text-white bg-transparent border-b border-gray-400 focus:border-white outline-none mb-2"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.full_name || 'Add your name'}
                  </h1>
                )}
                
                <div className="flex items-center text-gray-300 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
                
                {(profile.location || editing) && (
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    {editing ? (
                      <select
                        value={editedProfile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="bg-transparent border-b border-gray-400 focus:border-white outline-none text-gray-300"
                      >
                        <option value="">Select location</option>
                        <option value="Mbabane, Eswatini">Mbabane, Eswatini</option>
                        <option value="Manzini, Eswatini">Manzini, Eswatini</option>
                        <option value="Lobamba, Eswatini">Lobamba, Eswatini</option>
                        <option value="Maseru, Lesotho">Maseru, Lesotho</option>
                        <option value="Teyateyaneng, Lesotho">Teyateyaneng, Lesotho</option>
                        <option value="Gaborone, Botswana">Gaborone, Botswana</option>
                        <option value="Francistown, Botswana">Francistown, Botswana</option>
                        <option value="Maun, Botswana">Maun, Botswana</option>
                      </select>
                    ) : (
                      <span>{profile.location}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-200 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-200 flex items-center disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              {editing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  placeholder="Tell us about your professional background and experience..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {profile.bio || 'No bio added yet. Click edit to add your professional summary.'}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">{profile.email}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  {editing ? (
                    <select
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select location</option>
                      <option value="Mbabane, Eswatini">Mbabane, Eswatini</option>
                      <option value="Manzini, Eswatini">Manzini, Eswatini</option>
                      <option value="Lobamba, Eswatini">Lobamba, Eswatini</option>
                      <option value="Maseru, Lesotho">Maseru, Lesotho</option>
                      <option value="Teyateyaneng, Lesotho">Teyateyaneng, Lesotho</option>
                      <option value="Gaborone, Botswana">Gaborone, Botswana</option>
                      <option value="Francistown, Botswana">Francistown, Botswana</option>
                      <option value="Maun, Botswana">Maun, Botswana</option>
                    </select>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">{profile.location || 'Location not specified'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  {editing ? (
                    <input
                      type="url"
                      value={editedProfile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">No website added</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/resume'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition duration-200"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Create Resume
                </button>
                
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Browse Jobs
                </button>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Profile Views</span>
                  <span className="font-semibold text-gray-900 dark:text-white">89</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Applications</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Profile Complete</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">85%</span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Member Since</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}