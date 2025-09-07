const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_EMAIL_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - REQUIRED for Railway, Heroku, etc.
app.set('trust proxy', 1);

// Template utility functions
const loadTemplate = (templateName, format = 'html') => {
    const templatePath = path.join(__dirname, 'templates', 'emails', `${templateName}.${format}`);
    try {
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`❌ Error loading template ${templateName}.${format}:`, error.message);
        throw new Error(`Template ${templateName}.${format} not found`);
    }
};

const renderTemplate = (template, variables) => {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, value || 'Not specified');
    }
    return rendered;
};

// Security middleware
app.use(helmet());

// Rate limiting - 5 emails per hour per IP
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many emails sent from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:8000', 
        'http://127.0.0.1:8000', 
        'https://abhishekgoel.dev',
        'https://getsoftware.netlify.app'
    ],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Portfolio API is running!',
        timestamp: new Date().toISOString()
    });
});

// Contact form endpoint
app.post('/api/contact', emailLimiter, async (req, res) => {
    try {
        const { name, email, budget, message } = req.body;

        // Input validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields (name, email, message).'
            });
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        // Create transporter with error handling
        console.log('🔧 Creating email transporter...');

        // Load and render email templates
        const submissionTime = new Date().toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' EST';

        const templateVariables = {
            CLIENT_NAME: name,
            CLIENT_EMAIL: email,
            CLIENT_BUDGET: budget || 'Not specified',
            CLIENT_MESSAGE: message,
            DEVELOPER_EMAIL: process.env.EMAIL_USER || 'abhishek.dev694@gmail.com',
            SUBMISSION_TIME: submissionTime
        };

        // Load and render notification email templates
        const notificationHtmlTemplate = loadTemplate('notification', 'html');
        const notificationTextTemplate = loadTemplate('notification', 'txt');
        const clientEmailHtml = renderTemplate(notificationHtmlTemplate, templateVariables);
        const clientEmailText = renderTemplate(notificationTextTemplate, templateVariables);

        // Load and render auto-reply email templates
        const autoReplyHtmlTemplate = loadTemplate('auto-reply', 'html');
        const autoReplyTextTemplate = loadTemplate('auto-reply', 'txt');
        const autoReplyHtml = renderTemplate(autoReplyHtmlTemplate, templateVariables);
        const autoReplyText = renderTemplate(autoReplyTextTemplate, templateVariables);

        // Send email to you (notification)
        const clientMailOptions = {
            from: `"${name} via Portfolio" <${process.env.EMAIL_USER || 'abhishek.dev694@gmail.com'}>`,
            to: 'abhishek.dev694@gmail.com',
            replyTo: email,
            subject: `🚀 New Project Inquiry from ${name} - ${budget || 'Budget TBD'}`,
            html: clientEmailHtml,
            text: clientEmailText
        };

        // Send auto-reply to client
        const autoReplyOptions = {
            from: `"Abhishek Goel - Web Developer" <${process.env.EMAIL_USER || 'abhishek.dev694@gmail.com'}>`,
            to: email,
            subject: `Thanks for your inquiry, ${name}! I'll be in touch soon 🚀`,
            html: autoReplyHtml,
            text: autoReplyText
        };

        // Send both emails
        await sgMail.send(clientMailOptions);
        await sgMail.send(autoReplyOptions);

        console.log(`✅ Email sent successfully from ${name} (${email}) at ${new Date().toISOString()}`);

        res.json({
            success: true,
            message: 'Thank you for your message! I\'ll get back to you within 24 hours.'
        });

    } catch (error) {
        console.error('❌ Email sending failed:', {
            message: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
        
        // Provide different error messages based on the error type
        let errorMessage = 'Sorry, there was an error sending your message. Please try again or email me directly at abhishek.dev694@gmail.com';
        
        if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Connection timeout occurred. Please try again in a moment or email me directly at abhishek.dev694@gmail.com';
        } else if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please email me directly at abhishek.dev694@gmail.com';
        } else if (error.message.includes('Email configuration incomplete')) {
            errorMessage = 'Email system is currently being configured. Please email me directly at abhishek.dev694@gmail.com';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const emailConfigured = !!process.env.EMAIL_PASSWORD;
    
    console.log(`
🚀 Portfolio API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: abhishek.dev694@gmail.com
🌐 Server: ${isProduction ? 'PRODUCTION' : `http://localhost:${PORT}`}
🔗 Health: ${isProduction ? 'https://your-railway-url.railway.app' : `http://localhost:${PORT}`}/api/health
📝 Contact: ${isProduction ? 'https://your-railway-url.railway.app' : `http://localhost:${PORT}`}/api/contact
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${process.env.NODE_ENV || 'development'}
Email Service: ${process.env.EMAIL_SERVICE || 'gmail'}
Trust Proxy: ${app.get('trust proxy') ? 'ENABLED ✅' : 'DISABLED ❌'}
Email Config: ${emailConfigured ? 'CONFIGURED ✅' : 'MISSING PASSWORD ❌'}
Port: ${PORT}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    
    // Additional production warnings
    if (isProduction) {
        console.log('🔥 PRODUCTION MODE - Railway Deployment');
        if (!emailConfigured) {
            console.log('⚠️  WARNING: EMAIL_PASSWORD not configured in Railway environment variables!');
        }
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📤 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📤 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
