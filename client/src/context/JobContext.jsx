import { createContext, useContext, useState } from 'react'

const JobContext = createContext()

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)

  const value = {
    jobs,
    setJobs,
    loading,
    setLoading,
  }

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>
}

export const useJobs = () => {
  const context = useContext(JobContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider')
  }
  return context
}
