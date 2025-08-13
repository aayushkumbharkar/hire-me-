import { useParams } from 'react-router-dom'

const JobDetailsPage = () => {
  const { id } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Details</h1>
      <div className="card">
        <p className="text-gray-600">Job details for ID: {id}</p>
      </div>
    </div>
  )
}

export default JobDetailsPage
