import { useParams } from 'react-router-dom'

const ViewApplicationsPage = () => {
  const { jobId } = useParams()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">View Applications</h1>
      <div className="card">
        <p className="text-gray-600">Applications for job ID: {jobId} will be shown here...</p>
      </div>
    </div>
  )
}

export default ViewApplicationsPage
