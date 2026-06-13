const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory database
let students = [];
let applications = [];
let payments = [];

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ==================== STUDENT ROUTES ====================

// Register
app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    
    const existing = students.find(s => s.email === email);
    if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const newStudent = {
        id: Date.now().toString(),
        name, 
        email, 
        phone, 
        password
    };
    students.push(newStudent);
    console.log('New student registered:', name);
    res.json({ success: true, message: 'Registration successful' });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;
    
    // Admin login
    if (role === 'admin') {
        if (email === 'admin@oers.com' && password === 'admin123') {
            return res.json({ success: true, redirect: '/admin-dashboard', role: 'admin' });
        }
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    
    // Student login
    const student = students.find(s => s.email === email && s.password === password);
    if (student) {
        res.json({ success: true, redirect: '/student-dashboard', student: student });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Submit application
app.post('/api/submit-application', (req, res) => {
    const { studentName, examName, subjects, preferredCenter, examDate } = req.body;
    
    const application = {
        id: Date.now().toString(),
        studentName: studentName,
        studentEmail: req.body.studentEmail || 'student@email.com',
        examName: examName,
        subjects: subjects || [],
        preferredCenter: preferredCenter,
        examDate: examDate,
        status: 'pending',
        paymentStatus: 'pending',
        submittedAt: new Date().toISOString()
    };
    applications.push(application);
    console.log('New application submitted:', application.id);
    res.json({ success: true, message: 'Application submitted successfully', applicationId: application.id });
});

// Get my applications
app.get('/api/my-applications', (req, res) => {
    res.json({ success: true, applications: applications });
});

// Process payment
app.post('/api/process-payment', (req, res) => {
    const { applicationId, amount } = req.body;
    
    const payment = {
        id: Date.now().toString(),
        applicationId: applicationId,
        amount: amount || 500,
        transactionId: 'TXN' + Math.floor(Math.random() * 10000000),
        status: 'completed',
        paymentDate: new Date().toISOString()
    };
    payments.push(payment);
    
    // Update application payment status
    const app = applications.find(a => a.id === applicationId);
    if (app) {
        app.paymentStatus = 'completed';
    }
    
    console.log('Payment processed:', payment.transactionId);
    res.json({ success: true, message: 'Payment successful', transactionId: payment.transactionId });
});

// ==================== ADMIN ROUTES ====================

// Get all applications
app.get('/api/admin/applications', (req, res) => {
    res.json({ success: true, applications: applications });
});

// Get all students
app.get('/api/admin/students', (req, res) => {
    res.json({ success: true, students: students });
});

// Get stats
app.get('/api/admin/stats', (req, res) => {
    const stats = {
        totalStudents: students.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        approvedApplications: applications.filter(a => a.status === 'approved').length,
        rejectedApplications: applications.filter(a => a.status === 'rejected').length,
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        completedPayments: payments.length
    };
    res.json({ success: true, stats: stats });
});

// Update application status (approve/reject)
app.post('/api/admin/update-application', (req, res) => {
    const { applicationId, status } = req.body;
    
    const application = applications.find(a => a.id === applicationId);
    if (application) {
        application.status = status;
        application.reviewedAt = new Date().toISOString();
        console.log(`Application ${applicationId} ${status}`);
        res.json({ success: true, message: `Application ${status} successfully` });
    } else {
        res.status(404).json({ success: false, message: 'Application not found' });
    }
});

// Generate hall ticket
app.post('/api/admin/generate-hallticket', (req, res) => {
    const { applicationId } = req.body;
    
    const application = applications.find(a => a.id === applicationId);
    if (application) {
        application.hallTicketGenerated = true;
        application.hallTicketNo = 'HT' + Math.floor(Math.random() * 100000);
        application.status = 'approved';
        
        console.log(`Hall ticket generated for ${application.studentName}: ${application.hallTicketNo}`);
        res.json({ 
            success: true, 
            message: 'Hall ticket generated successfully',
            hallTicketNo: application.hallTicketNo
        });
    } else {
        res.status(404).json({ success: false, message: 'Application not found' });
    }
});

// Get hall ticket by application
app.get('/api/hallticket/:applicationId', (req, res) => {
    const application = applications.find(a => a.id === req.params.applicationId);
    if (application && application.hallTicketGenerated) {
        res.json({ 
            success: true, 
            hallTicket: {
                studentName: application.studentName,
                examName: application.examName,
                hallTicketNo: application.hallTicketNo,
                examDate: application.examDate,
                examCenter: application.preferredCenter,
                subjects: application.subjects
            }
        });
    } else {
        res.status(404).json({ success: false, message: 'Hall ticket not found' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('✅ Online Exam Registration System');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('========================================');
    console.log('📌 Student Portal: http://localhost:3000');
    console.log('🔑 Admin Login:');
    console.log('   Email: admin@oers.com');
    console.log('   Password: admin123');
    console.log('========================================');
    console.log('💡 Press Ctrl+C to stop the server');
});