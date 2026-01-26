require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Leave = require('../models/Leave');

connectDB();

const seedData = async () => {
  try {
    // Wait for connection to establish
    await new Promise(resolve => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('connected', resolve);
      }
    });
    
    // Clear existing data
    await User.deleteMany();
    await Employee.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Leave.deleteMany();

    console.log('Data Destroyed!');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'John Manager',
        email: 'john.manager@company.com',
        password: 'manager123',
        role: 'manager',
      },
      {
        name: 'Sarah Smith',
        email: 'sarah.smith@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'David Chen',
        email: 'david.chen@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        password: 'manager123',
        role: 'manager',
      },
      {
        name: 'Patricia Miller',
        email: 'patricia.miller@company.com',
        password: 'employee123',
        role: 'employee',
      },
      {
        name: 'Robert Taylor',
        email: 'robert.taylor@company.com',
        password: 'employee123',
        role: 'employee',
      },
    ]);

    console.log('Users Created!');

    // Create Employees
    const employees = await Employee.create([
      {
        user: users[0]._id,
        employeeId: 'EMP001',
        department: 'IT',
        designation: 'System Administrator',
        dateOfJoining: new Date('2020-01-15'),
        salary: 80000,
        phoneNumber: '+1-555-0101',
        address: {
          street: '123 Admin St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        skills: ['System Administration', 'Network Security', 'Cloud Computing'],
      },
      {
        user: users[1]._id,
        employeeId: 'EMP002',
        department: 'IT',
        designation: 'Project Manager',
        dateOfJoining: new Date('2019-03-20'),
        salary: 90000,
        phoneNumber: '+1-555-0102',
        address: {
          street: '456 Manager Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        skills: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
      },
      {
        user: users[2]._id,
        employeeId: 'EMP003',
        department: 'IT',
        designation: 'Senior Developer',
        dateOfJoining: new Date('2021-06-10'),
        salary: 75000,
        phoneNumber: '+1-555-0103',
        address: {
          street: '789 Developer Ln',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA',
        },
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        manager: null,
      },
      {
        user: users[3]._id,
        employeeId: 'EMP004',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        dateOfJoining: new Date('2022-01-05'),
        salary: 60000,
        phoneNumber: '+1-555-0104',
        address: {
          street: '321 Marketing Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        skills: ['Digital Marketing', 'SEO', 'Content Creation', 'Social Media'],
        manager: null,
      },
      {
        user: users[4]._id,
        employeeId: 'EMP005',
        department: 'HR',
        designation: 'HR Executive',
        dateOfJoining: new Date('2021-09-15'),
        salary: 55000,
        phoneNumber: '+1-555-0105',
        address: {
          street: '654 HR Plaza',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'USA',
        },
        skills: ['Recruitment', 'Employee Relations', 'Performance Management'],
        manager: null,
      },
      {
        user: users[5]._id,
        employeeId: 'EMP006',
        department: 'IT',
        designation: 'Full Stack Developer',
        dateOfJoining: new Date('2022-05-12'),
        salary: 70000,
        phoneNumber: '+1-555-0106',
        address: {
          street: '987 Code St',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA',
        },
        skills: ['JavaScript', 'Python', 'React', 'Express', 'PostgreSQL'],
        manager: null,
      },
      {
        user: users[6]._id,
        employeeId: 'EMP007',
        department: 'Finance',
        designation: 'Senior Accountant',
        dateOfJoining: new Date('2020-11-08'),
        salary: 65000,
        phoneNumber: '+1-555-0107',
        address: {
          street: '147 Finance Ave',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          country: 'USA',
        },
        skills: ['Accounting', 'Financial Analysis', 'Auditing', 'GAAP'],
        manager: null,
      },
      {
        user: users[7]._id,
        employeeId: 'EMP008',
        department: 'Operations',
        designation: 'Operations Manager',
        dateOfJoining: new Date('2019-08-22'),
        salary: 85000,
        phoneNumber: '+1-555-0108',
        address: {
          street: '258 Operations Blvd',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA',
        },
        skills: ['Process Improvement', 'Supply Chain', 'Logistics', 'Leadership'],
        manager: null,
      },
      {
        user: users[8]._id,
        employeeId: 'EMP009',
        department: 'Sales',
        designation: 'Senior Sales Executive',
        dateOfJoining: new Date('2021-02-10'),
        salary: 72000,
        phoneNumber: '+1-555-0109',
        address: {
          street: '369 Sales St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        skills: ['Sales', 'Client Management', 'Negotiation', 'CRM'],
        manager: null,
      },
      {
        user: users[9]._id,
        employeeId: 'EMP010',
        department: 'IT',
        designation: 'QA Engineer',
        dateOfJoining: new Date('2022-07-18'),
        salary: 58000,
        phoneNumber: '+1-555-0110',
        address: {
          street: '741 Testing Ln',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'USA',
        },
        skills: ['Selenium', 'Test Automation', 'Manual Testing', 'Jira'],
        manager: null,
      },
    ]);

    // Update manager references
    employees[2].manager = employees[1]._id;
    employees[3].manager = employees[1]._id;
    employees[4].manager = employees[0]._id;
    employees[5].manager = employees[1]._id;
    employees[6].manager = employees[0]._id;
    employees[7].manager = employees[0]._id;
    employees[8].manager = employees[7]._id;
    employees[9].manager = employees[1]._id;
    await employees[2].save();
    await employees[3].save();
    await employees[4].save();
    await employees[5].save();
    await employees[6].save();
    await employees[7].save();
    await employees[8].save();
    await employees[9].save();

    console.log('Employees Created!');

    // Create Projects
    const projects = await Project.create([
      {
        name: 'E-Commerce Platform Redesign',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
        client: 'ABC Corporation',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 150000,
        manager: employees[1]._id,
        teamMembers: [employees[2]._id, employees[3]._id, employees[5]._id],
        progress: 55,
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android',
        client: 'XYZ Industries',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-10-30'),
        budget: 200000,
        manager: employees[1]._id,
        teamMembers: [employees[2]._id, employees[5]._id, employees[9]._id],
        progress: 35,
      },
      {
        name: 'CRM System Integration',
        description: 'Integration of new CRM system with existing infrastructure',
        client: 'Tech Solutions Ltd',
        status: 'completed',
        priority: 'high',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-31'),
        budget: 100000,
        manager: employees[1]._id,
        teamMembers: [employees[2]._id, employees[5]._id],
        progress: 100,
      },
      {
        name: 'Cloud Infrastructure Migration',
        description: 'Migrate on-premise infrastructure to AWS cloud',
        client: 'Enterprise Solutions Inc',
        status: 'planning',
        priority: 'critical',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-08-15'),
        budget: 300000,
        manager: employees[1]._id,
        teamMembers: [employees[2]._id, employees[5]._id, employees[9]._id],
        progress: 5,
      },
      {
        name: 'Data Analytics Platform',
        description: 'Build real-time analytics dashboard for business intelligence',
        client: 'Global Analytics Corp',
        status: 'in-progress',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-31'),
        budget: 180000,
        manager: employees[7]._id,
        teamMembers: [employees[2]._id, employees[5]._id],
        progress: 60,
      },
      {
        name: 'Customer Portal Development',
        description: 'Self-service portal for customers to manage accounts',
        client: 'Financial Services LLC',
        status: 'in-progress',
        priority: 'medium',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-05-30'),
        budget: 120000,
        manager: employees[1]._id,
        teamMembers: [employees[2]._id, employees[3]._id, employees[5]._id],
        progress: 75,
      },
      {
        name: 'Marketing Automation System',
        description: 'Implement marketing automation for email and social campaigns',
        client: 'Digital Ventures Ltd',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-09-30'),
        budget: 95000,
        manager: employees[7]._id,
        teamMembers: [employees[3]._id],
        progress: 0,
      },
      {
        name: 'Quality Assurance Automation',
        description: 'Automated testing framework for continuous integration',
        client: 'Tech Solutions Ltd',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-06-15'),
        budget: 80000,
        manager: employees[1]._id,
        teamMembers: [employees[9]._id, employees[5]._id],
        progress: 45,
      },
    ]);

    console.log('Projects Created!');

    // Create Tasks
    await Task.create([
      {
        title: 'Design Database Schema',
        description: 'Create comprehensive database schema for the e-commerce platform',
        project: projects[0]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[1]._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-01-20'),
        estimatedHours: 16,
        actualHours: 14,
      },
      {
        title: 'Implement User Authentication',
        description: 'Develop JWT-based authentication system',
        project: projects[0]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-02-15'),
        estimatedHours: 24,
        actualHours: 18,
      },
      {
        title: 'Create Product Catalog UI',
        description: 'Design and implement product listing and detail pages',
        project: projects[0]._id,
        assignedTo: employees[3]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-03-01'),
        estimatedHours: 32,
        actualHours: 28,
      },
      {
        title: 'Mobile App Wireframes',
        description: 'Create wireframes for all major screens',
        project: projects[1]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[1]._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-03-15'),
        estimatedHours: 20,
        actualHours: 22,
      },
      {
        title: 'API Development - User Service',
        description: 'Build RESTful API endpoints for user management',
        project: projects[1]._id,
        assignedTo: employees[5]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-04-30'),
        estimatedHours: 40,
        actualHours: 25,
      },
      {
        title: 'Frontend Testing Suite',
        description: 'Write unit and integration tests for React components',
        project: projects[0]._id,
        assignedTo: employees[9]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date('2024-03-20'),
        estimatedHours: 30,
        actualHours: 15,
      },
      {
        title: 'AWS Infrastructure Setup',
        description: 'Configure AWS VPC, EC2, RDS, and other services',
        project: projects[3]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[1]._id,
        status: 'todo',
        priority: 'critical',
        dueDate: new Date('2024-05-15'),
        estimatedHours: 48,
        actualHours: 0,
      },
      {
        title: 'Database Migration Script',
        description: 'Create and test migration scripts for data transfer',
        project: projects[3]._id,
        assignedTo: employees[5]._id,
        assignedBy: employees[1]._id,
        status: 'todo',
        priority: 'critical',
        dueDate: new Date('2024-05-10'),
        estimatedHours: 32,
        actualHours: 0,
      },
      {
        title: 'Analytics Dashboard UI',
        description: 'Design interactive dashboard with charts and metrics',
        project: projects[4]._id,
        assignedTo: employees[3]._id,
        assignedBy: employees[7]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-04-30'),
        estimatedHours: 36,
        actualHours: 20,
      },
      {
        title: 'Real-time Data Processing',
        description: 'Implement streaming data pipeline for analytics',
        project: projects[4]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[7]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-05-15'),
        estimatedHours: 44,
        actualHours: 32,
      },
      {
        title: 'Customer Portal Login Page',
        description: 'Build secure login and authentication flow',
        project: projects[5]._id,
        assignedTo: employees[5]._id,
        assignedBy: employees[1]._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-02-20'),
        estimatedHours: 16,
        actualHours: 14,
      },
      {
        title: 'Account Management Features',
        description: 'Implement profile, password change, and settings',
        project: projects[5]._id,
        assignedTo: employees[2]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date('2024-04-15'),
        estimatedHours: 28,
        actualHours: 20,
      },
      {
        title: 'QA Test Plan for Platform',
        description: 'Create comprehensive test plan and test cases',
        project: projects[0]._id,
        assignedTo: employees[9]._id,
        assignedBy: employees[1]._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-02-28'),
        estimatedHours: 24,
        actualHours: 22,
      },
      {
        title: 'Selenium Test Automation',
        description: 'Automate end-to-end testing scenarios',
        project: projects[7]._id,
        assignedTo: employees[9]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-05-30'),
        estimatedHours: 56,
        actualHours: 28,
      },
      {
        title: 'Email Campaign Setup',
        description: 'Configure email templates and automation workflows',
        project: projects[6]._id,
        assignedTo: employees[3]._id,
        assignedBy: employees[7]._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2024-06-15'),
        estimatedHours: 20,
        actualHours: 0,
      },
      {
        title: 'Mobile App Backend API',
        description: 'Develop APIs for mobile application',
        project: projects[1]._id,
        assignedTo: employees[5]._id,
        assignedBy: employees[1]._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date('2024-05-31'),
        estimatedHours: 50,
        actualHours: 30,
      },
    ]);

    console.log('Tasks Created!');

    // Create Leave Requests
    await Leave.create([
      {
        employee: employees[2]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-05'),
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: employees[1]._id,
        approvalDate: new Date('2024-06-15'),
        numberOfDays: 5,
      },
      {
        employee: employees[3]._id,
        leaveType: 'sick',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-12'),
        reason: 'Medical appointment',
        status: 'pending',
        numberOfDays: 3,
      },
      {
        employee: employees[4]._id,
        leaveType: 'casual',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-21'),
        reason: 'Personal work',
        status: 'approved',
        approvedBy: employees[0]._id,
        approvalDate: new Date('2024-03-10'),
        numberOfDays: 2,
      },
      {
        employee: employees[5]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-22'),
        reason: 'Summer vacation with family',
        status: 'approved',
        approvedBy: employees[1]._id,
        approvalDate: new Date('2024-06-01'),
        numberOfDays: 8,
      },
      {
        employee: employees[6]._id,
        leaveType: 'sick',
        startDate: new Date('2024-03-05'),
        endDate: new Date('2024-03-06'),
        reason: 'Flu',
        status: 'approved',
        approvedBy: employees[0]._id,
        approvalDate: new Date('2024-03-05'),
        numberOfDays: 2,
      },
      {
        employee: employees[7]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-10'),
        reason: 'International trip',
        status: 'pending',
        numberOfDays: 10,
      },
      {
        employee: employees[8]._id,
        leaveType: 'casual',
        startDate: new Date('2024-04-12'),
        endDate: new Date('2024-04-12'),
        reason: 'Personal appointment',
        status: 'approved',
        approvedBy: employees[7]._id,
        approvalDate: new Date('2024-04-10'),
        numberOfDays: 1,
      },
      {
        employee: employees[9]._id,
        leaveType: 'maternity',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-09-14'),
        reason: 'Maternity leave',
        status: 'approved',
        approvedBy: employees[1]._id,
        approvalDate: new Date('2024-06-20'),
        numberOfDays: 62,
      },
      {
        employee: employees[2]._id,
        leaveType: 'casual',
        startDate: new Date('2024-05-30'),
        endDate: new Date('2024-05-31'),
        reason: 'Personal work',
        status: 'pending',
        numberOfDays: 2,
      },
      {
        employee: employees[3]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-19'),
        reason: 'Easter holidays',
        status: 'approved',
        approvedBy: employees[1]._id,
        approvalDate: new Date('2024-04-01'),
        numberOfDays: 5,
      },
    ]);

    console.log('Leaves Created!');
    console.log('✅ Database seeded successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: john.manager@company.com / manager123');
    console.log('Employee: sarah.smith@company.com / employee123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === 'production') {
  console.log('Seeding is disabled in production. Set NODE_ENV!=production to seed.');
  process.exit(0);
}

seedData();
