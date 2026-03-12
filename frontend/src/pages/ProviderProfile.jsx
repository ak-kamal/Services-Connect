import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { BadgeCheck } from 'lucide-react'
import { handleError, handleSuccess } from '../utils'

function ProviderProfile() {
  const [loggedInUser, setLoggedInUser] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [certification, setCertification] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isFetchingProfile, setIsFetchingProfile] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const storedName = localStorage.getItem('loggedInUser') || ''
    const storedRole = localStorage.getItem('role') || ''
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    if (storedRole === 'customer') {
      navigate('/')
      return
    }

    setLoggedInUser(storedName)
    setRole(storedRole)

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/provider/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to fetch provider profile')
        }

        const { profile } = result
        setLoggedInUser(profile.name || storedName)
        setRole(profile.role || storedRole)
        setEmail(profile.email || '')
        setCertification(profile.certification || null)
      } catch (error) {
        handleError(error.message || 'Unable to fetch provider profile')
      } finally {
        setIsFetchingProfile(false)
      }
    }

    fetchProfile()
  }, [API_BASE_URL, navigate])

  const initial = useMemo(() => {
    return loggedInUser ? loggedInUser.charAt(0).toUpperCase() : ''
  }, [loggedInUser])

  const formattedRole = useMemo(() => {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : ''
  }, [role])

  const hasVerifiedCertification =
    Boolean(certification?.fileUrl) && Boolean(certification?.verified)

  const getCertificationFileUrl = () => {
    if (!certification?.fileUrl || !API_BASE_URL) {
      return ''
    }

    return `${API_BASE_URL}${certification.fileUrl}`
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleUploadCertification = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('token')

    if (!selectedFile) {
      return handleError('Please select a certification file before uploading')
    }

    if (!token) {
      return handleError('Session expired. Please login again')
    }

    const formData = new FormData()
    formData.append('certification', selectedFile)

    try {
      setIsUploading(true)

      const response = await fetch(`${API_BASE_URL}/provider/certification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Certification upload failed')
      }

      setCertification(result.certification)
      setSelectedFile(null)
      handleSuccess(result.message || 'Certification uploaded successfully')
    } catch (error) {
      handleError(error.message || 'Certification upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('role')
    handleSuccess('User logged out')

    setTimeout(() => {
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Provider Profile</h1>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle avatar"
            >
              <div className="w-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-lg font-bold leading-none">{initial}</span>
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="px-2 py-1 font-semibold text-base-content/80">
                {loggedInUser}
              </li>
              <li className="px-2 py-1 text-sm text-base-content/60 capitalize">
                {formattedRole}
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="card-title text-3xl">Welcome, {loggedInUser}</h2>
              {hasVerifiedCertification && (
                <div className="badge badge-info gap-1 px-3 py-3 text-white">
                  <BadgeCheck size={16} />
                  Certified
                </div>
              )}
            </div>
            <p className="text-lg">
              Role: <span className="font-semibold">{formattedRole}</span>
            </p>
            <p className="text-base-content/70">Email: {email}</p>
            <p className="text-base-content/70">
              This is your provider dashboard/profile page. Later, you can add:
              services, pricing, availability, booking requests and reviews.
            </p>

            {isFetchingProfile ? (
              <div className="mt-6 text-base-content/70">Loading provider profile...</div>
            ) : (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Certification Verification</h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Upload an optional certification document (PDF/JPG/PNG, max 5MB) to
                  display a verified provider badge.
                </p>

                <form onSubmit={handleUploadCertification} className="space-y-4">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="file-input file-input-bordered w-full"
                    onChange={handleFileChange}
                  />
                  <button
                    type="submit"
                    className="btn bg-sky-600 hover:bg-sky-700 border-sky-700 text-white disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-300"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Certification'}
                  </button>
                </form>

                {certification?.fileUrl && (
                  <div className="mt-5 p-4 rounded-lg border border-base-300 bg-base-200/40">
                    <p className="text-sm">
                      Current file:{' '}
                      <span className="font-semibold">{certification.fileName}</span>
                    </p>
                    <p className="text-sm mt-1">
                      Uploaded on:{' '}
                      {certification.uploadedAt
                        ? new Date(certification.uploadedAt).toLocaleString()
                        : 'N/A'}
                    </p>
                    <a
                      href={getCertificationFileUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="link link-info mt-2 inline-block"
                    >
                      View uploaded certification
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default ProviderProfile