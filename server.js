const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Admin password from Replit Secrets
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default for local testing

// Helper function to read contact data from Replit App Storage
function readContactData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'contactReceived.json');
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, '[]');
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading contact data:', error);
    return [];
  }
}

// Helper function to write contact data to Replit App Storage
function writeContactData(data) {
  try {
    const dataPath = path.join(__dirname, 'data', 'contactReceived.json');
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing contact data:', error);
    return false;
  }
}

// Contact form submission endpoint
app.post('/api/contact', (req, res) => {
  try {
    const { firstName, lastName, email, reason, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !reason || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Valid reasons
    const validReasons = ['Comment', 'Question', 'Partnership', 'Opportunity', 'Other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid reason for contact' });
    }

    // Read existing data
    let contactData = readContactData();
    
    // Generate unique ID and timestamp
    const id = uuidv4();
    const submittedAt = new Date().toISOString();

    // Create new submission
    const newSubmission = {
      id,
      firstName,
      lastName,
      email,
      reason,
      message,
      submittedAt,
      replied: false,
      repliedAt: null
    };

    // Add to data
    contactData.push(newSubmission);

    // Write back to storage
    const success = writeContactData(contactData);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    // Return success with ID and timestamp
    res.status(201).json({
      id,
      submittedAt,
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password === ADMIN_PASSWORD) {
      // In a real app, you'd generate a session token here
      // For simplicity, we'll just return success
      res.json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact messages (protected)
app.get('/api/admin/messages', (req, res) => {
  try {
    // Check authentication (in this simple implementation, we're using a header)
    const authToken = req.headers.authorization;
    
    if (authToken !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contactData = readContactData();
    
    // Sort by newest first
    contactData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json(contactData);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as replied (protected)
app.patch('/api/admin/messages/:id/replied', (req, res) => {
  try {
    // Check authentication
    const authToken = req.headers.authorization;
    
    if (authToken !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const contactData = readContactData();
    
    const messageIndex = contactData.findIndex(msg => msg.id === id);
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update the message
    contactData[messageIndex].replied = true;
    contactData[messageIndex].repliedAt = new Date().toISOString();

    // Write back to storage
    const success = writeContactData(contactData);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update message' });
    }

    res.json({
      success: true,
      message: 'Message marked as replied',
      updatedMessage: contactData[messageIndex]
    });
  } catch (error) {
    console.error('Error marking message as replied:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary statistics (protected)
app.get('/api/admin/summary', (req, res) => {
  try {
    const authToken = req.headers.authorization;
    
    if (authToken !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contactData = readContactData();
    
    const totalMessages = contactData.length;
    const newMessages = contactData.filter(msg => !msg.replied).length;
    const repliedMessages = contactData.filter(msg => msg.replied).length;
    const replyRate = totalMessages > 0 ? (repliedMessages / totalMessages * 100) : 0;

    // Messages by reason
    const reasons = {};
    contactData.forEach(msg => {
      reasons[msg.reason] = (reasons[msg.reason] || 0) + 1;
    });

    res.json({
      totalMessages,
      newMessages,
      repliedMessages,
      replyRate,
      messagesByReason: reasons
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from root
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
