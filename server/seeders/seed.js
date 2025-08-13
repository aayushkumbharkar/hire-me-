const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Sample data
const sampleUsers = [
  {
    name: 'John Jobseeker',
    email: 'jobseeker@example.com',
    password: 'password123',
    role: 'jobseeker',
    location: 'New York, NY',
    phone: '+1234567890',
    bio: 'Experienced software developer looking for new opportunities.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB']
  },
  {
    name: 'Jane Developer',
    email: 'jane.dev@example.com',
    password: 'password123',
    role: 'jobseeker',
    location: 'San Francisco, CA',
    phone: '+1987654321',
    bio: 'Full-stack developer with 5 years of experience.',
    skills: ['React', 'TypeScript', 'GraphQL', 'PostgreSQL', 'AWS']
  },
  {
    name: 'Mike Manager',
    email: 'mike.manager@example.com',
    password: 'password123',
    role: 'jobseeker',
    location: 'Seattle, WA',
    phone: '+1555666777',
    bio: 'Project manager with experience in agile methodologies.',
    skills: ['Project Management', 'Scrum', 'Agile', 'Leadership']
  },
  {
    name: 'TechCorp Inc',
    email: 'employer@example.com',
    password: 'password123',
    role: 'employer',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    bio: 'Leading technology company building innovative solutions.'
  },
  {
    name: 'StartupXYZ',
    email: 'hr@startupxyz.com',
    password: 'password123',
    role: 'employer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    website: 'https://startupxyz.com',
    bio: 'Fast-growing startup disrupting the fintech industry.'
  },
  {
    name: 'BigCorp Solutions',
    email: 'hiring@bigcorp.com',
    password: 'password123',
    role: 'employer',
    company: 'BigCorp Solutions',
    location: 'Chicago, IL',
    website: 'https://bigcorp.com',
    bio: 'Fortune 500 company with global presence.'
  }
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    description: 'We are seeking a talented Senior Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate should have strong experience with React, Node.js, and database design. You will work closely with our product team to deliver high-quality software solutions that meet our customers\' needs.',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 5,
        max: 10
      },
      education: 'bachelor',
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'AWS']
    },
    benefits: ['Health Insurance', '401k Matching', 'Flexible Work Hours', 'Remote Work Option'],
    tags: ['javascript', 'react', 'nodejs', 'fullstack', 'senior'],
    isFeatured: true
  },
  {
    title: 'Frontend Developer',
    description: 'Join our team as a Frontend Developer and help us create amazing user experiences. You will work with modern frontend frameworks and collaborate with designers to implement pixel-perfect designs. Experience with React, TypeScript, and responsive design is highly valued.',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    jobType: 'full-time',
    workMode: 'remote',
    salary: {
      min: 80000,
      max: 110000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 2,
        max: 5
      },
      education: 'bachelor',
      skills: ['React', 'TypeScript', 'CSS', 'HTML', 'Git']
    },
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Learning Budget'],
    tags: ['frontend', 'react', 'typescript', 'remote'],
    isFeatured: true
  },
  {
    title: 'Backend Engineer',
    description: 'We are looking for a skilled Backend Engineer to design and implement scalable server-side applications. You will work with microservices architecture and cloud technologies to build robust APIs and services.',
    company: 'BigCorp Solutions',
    location: 'Chicago, IL',
    jobType: 'full-time',
    workMode: 'on-site',
    salary: {
      min: 100000,
      max: 140000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 3,
        max: 7
      },
      education: 'bachelor',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes']
    },
    benefits: ['Health Insurance', '401k', 'Paid Time Off', 'Professional Development'],
    tags: ['backend', 'python', 'django', 'microservices']
  },
  {
    title: 'Junior Web Developer',
    description: 'Perfect opportunity for a junior developer to start their career in web development. You will work on various projects and learn from experienced developers while contributing to real-world applications.',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: {
      min: 65000,
      max: 85000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 0,
        max: 2
      },
      education: 'bachelor',
      skills: ['HTML', 'CSS', 'JavaScript', 'Git']
    },
    benefits: ['Health Insurance', 'Mentorship Program', 'Flexible Hours'],
    tags: ['junior', 'webdev', 'javascript', 'entry-level']
  },
  {
    title: 'DevOps Engineer',
    description: 'Join our infrastructure team as a DevOps Engineer. You will be responsible for maintaining CI/CD pipelines, managing cloud infrastructure, and ensuring system reliability and scalability.',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    jobType: 'full-time',
    workMode: 'remote',
    salary: {
      min: 110000,
      max: 150000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 4,
        max: 8
      },
      education: 'bachelor',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins']
    },
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Conference Budget'],
    tags: ['devops', 'aws', 'kubernetes', 'infrastructure', 'remote']
  },
  {
    title: 'Product Manager',
    description: 'We are seeking an experienced Product Manager to lead product strategy and development. You will work cross-functionally with engineering, design, and marketing teams to deliver successful products.',
    company: 'BigCorp Solutions',
    location: 'Chicago, IL',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: {
      min: 130000,
      max: 170000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 5,
        max: 10
      },
      education: 'master',
      skills: ['Product Management', 'Analytics', 'Agile', 'Strategy']
    },
    benefits: ['Health Insurance', '401k Matching', 'Stock Options', 'Flexible Work'],
    tags: ['product', 'management', 'strategy', 'analytics']
  },
  {
    title: 'UI/UX Designer',
    description: 'Creative UI/UX Designer wanted to join our design team. You will be responsible for creating beautiful and intuitive user interfaces while ensuring excellent user experience across our products.',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: {
      min: 90000,
      max: 120000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 3,
        max: 6
      },
      education: 'bachelor',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    },
    benefits: ['Health Insurance', 'Creative Tools Budget', 'Flexible Hours', 'Remote Days'],
    tags: ['design', 'ui', 'ux', 'figma', 'creative'],
    isFeatured: true
  },
  {
    title: 'Data Scientist',
    description: 'Data Scientist position available for someone passionate about extracting insights from data. You will work with large datasets, build machine learning models, and help drive data-driven decisions.',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    jobType: 'full-time',
    workMode: 'remote',
    salary: {
      min: 115000,
      max: 155000,
      currency: 'USD',
      period: 'yearly'
    },
    requirements: {
      experience: {
        min: 3,
        max: 7
      },
      education: 'master',
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics']
    },
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Learning Budget'],
    tags: ['data', 'science', 'python', 'ml', 'analytics', 'remote']
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`👤 Created user: ${userData.name} (${userData.role})`);
    }

    // Separate employers and job seekers
    const employers = createdUsers.filter(user => user.role === 'employer');
    const jobSeekers = createdUsers.filter(user => user.role === 'jobseeker');

    // Create jobs
    const createdJobs = [];
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = { ...sampleJobs[i] };
      const employer = employers[i % employers.length]; // Distribute jobs among employers
      jobData.employerId = employer._id;
      
      const job = new Job(jobData);
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`💼 Created job: ${jobData.title} at ${jobData.company}`);
    }

    // Create some sample applications
    const sampleApplications = [
      {
        jobId: createdJobs[0]._id,
        applicantId: jobSeekers[0]._id,
        employerId: createdJobs[0].employerId,
        coverLetter: 'I am very excited about this Senior Full Stack Developer position. With over 5 years of experience in React and Node.js, I believe I would be a great fit for your team. I have worked on several large-scale applications and am passionate about building quality software solutions.',
        expectedSalary: { amount: 140000, currency: 'USD', period: 'yearly' }
      },
      {
        jobId: createdJobs[1]._id,
        applicantId: jobSeekers[1]._id,
        employerId: createdJobs[1].employerId,
        coverLetter: 'As a frontend developer with expertise in React and TypeScript, I am thrilled to apply for this position. I have a strong eye for design and love creating intuitive user interfaces. I would love the opportunity to contribute to your team and help build amazing user experiences.',
        expectedSalary: { amount: 95000, currency: 'USD', period: 'yearly' }
      },
      {
        jobId: createdJobs[0]._id,
        applicantId: jobSeekers[1]._id,
        employerId: createdJobs[0].employerId,
        coverLetter: 'I am writing to express my interest in the Senior Full Stack Developer role. Although I have been focusing on frontend development, I have experience with full-stack technologies and am eager to take on more backend responsibilities. I believe this role would be a perfect next step in my career.',
        expectedSalary: { amount: 130000, currency: 'USD', period: 'yearly' }
      },
      {
        jobId: createdJobs[3]._id,
        applicantId: jobSeekers[0]._id,
        employerId: createdJobs[3].employerId,
        coverLetter: 'While I have senior-level experience, I am interested in this junior position as it offers an opportunity to work with new technologies and contribute to a great team culture. I believe my experience would be valuable in mentoring other junior developers.',
        status: 'reviewed'
      }
    ];

    for (const appData of sampleApplications) {
      const application = new Application(appData);
      await application.save();
      console.log(`📝 Created application for job: ${createdJobs.find(j => j._id.toString() === appData.jobId.toString())?.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`   - Job Seekers: ${jobSeekers.length}`);
    console.log(`   - Employers: ${employers.length}`);
    console.log(`💼 Jobs created: ${createdJobs.length}`);
    console.log(`📝 Applications created: ${sampleApplications.length}`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('Job Seeker: jobseeker@example.com / password123');
    console.log('Employer: employer@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
}

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
