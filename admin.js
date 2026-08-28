// Todd Benrud Portfolio - Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginSection = document.getElementById('adminLogin');
  const dashboardSection = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const messagesTable = document.getElementById('messagesTable');
  const messagesTableBody = document.getElementById('messagesTableBody');
  const filterAll = document.getElementById('filterAll');
  const filterNew = document.getElementById('filterNew');
  const filterReplied = document.getElementById('filterReplied');
  const summaryCards = document.getElementById('summaryCards');
  const chartContainer = document.getElementById('chartContainer');
  
  let currentFilter = 'all';
  let allMessages = [];
  let authToken = null;

  // Check if user is authenticated (stored in memory only, not localStorage)
  function isAuthenticated() {
    return authToken !== null;
  }

  // Show login section and hide dashboard
  function showLogin() {
    if (loginSection) loginSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    authToken = null;
  }

  // Show dashboard and hide login
  function showDashboard() {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadMessages();
    loadSummary();
    loadChart();
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const passwordInput = document.getElementById('adminPassword');
      const errorMsg = document.getElementById('loginError');
      const submitBtn = this.querySelector('button[type="submit"]');
      
      // Hide error
      if (errorMsg) errorMsg.classList.remove('show');
      
      // Disable button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';
      
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: passwordInput.value
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid password');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Store token in memory (not localStorage for security)
          authToken = passwordInput.value;
          passwordInput.value = '';
          showDashboard();
        } else {
          throw new Error('Authentication failed');
        }
        
      } catch (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.classList.add('show');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    });
  }

  // Logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      authToken = null;
      showLogin();
    });
  }

  // Filter buttons
  if (filterAll) {
    filterAll.addEventListener('click', function() {
      currentFilter = 'all';
      updateFilterButtons();
      displayMessages();
    });
  }

  if (filterNew) {
    filterNew.addEventListener('click', function() {
      currentFilter = 'new';
      updateFilterButtons();
      displayMessages();
    });
  }

  if (filterReplied) {
    filterReplied.addEventListener('click', function() {
      currentFilter = 'replied';
      updateFilterButtons();
      displayMessages();
    });
  }

  // Update filter button active states
  function updateFilterButtons() {
    if (filterAll) filterAll.classList.toggle('active', currentFilter === 'all');
    if (filterNew) filterNew.classList.toggle('active', currentFilter === 'new');
    if (filterReplied) filterReplied.classList.toggle('active', currentFilter === 'replied');
  }

  // Load messages from server
  async function loadMessages() {
    try {
      const response = await fetch('/api/admin/messages', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      allMessages = await response.json();
      displayMessages();
      
    } catch (error) {
      console.error('Error loading messages:', error);
      showError('Failed to load messages. Please refresh the page.');
    }
  }

  // Display messages based on current filter
  function displayMessages() {
    if (!messagesTableBody) return;
    
    // Clear existing rows
    messagesTableBody.innerHTML = '';
    
    if (allMessages.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="7" class="text-center">No messages yet</td>';
      messagesTableBody.appendChild(row);
      return;
    }
    
    // Filter messages
    let filteredMessages = allMessages;
    
    switch (currentFilter) {
      case 'new':
        filteredMessages = allMessages.filter(msg => !msg.replied);
        break;
      case 'replied':
        filteredMessages = allMessages.filter(msg => msg.replied);
        break;
      default:
        filteredMessages = allMessages;
    }
    
    // Create table rows
    filteredMessages.forEach(message => {
      const row = document.createElement('tr');
      
      const name = `${message.firstName} ${message.lastName}`;
      const date = formatDateTime(message.submittedAt);
      const status = message.replied ? 'Replied' : 'New';
      const statusClass = message.replied ? 'status-replied' : 'status-new';
      
      row.innerHTML = `
        <td>${name}</td>
        <td>${message.email}</td>
        <td>${message.reason}</td>
        <td>${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</td>
        <td>${date}</td>
        <td><span class="${statusClass}">${status}</span></td>
        <td>
          ${!message.replied ? `<button class="mark-replied-btn" data-id="${message.id}">Mark as Replied</button>` : ''}
        </td>
      `;
      
      messagesTableBody.appendChild(row);
      
      // Add event listener to mark as replied button
      const replyBtn = row.querySelector('.mark-replied-btn');
      if (replyBtn) {
        replyBtn.addEventListener('click', function() {
          markAsReplied(message.id);
        });
      }
    });
  }

  // Mark message as replied
  async function markAsReplied(id) {
    try {
      const response = await fetch(`/api/admin/messages/${id}/replied`, {
        method: 'PATCH',
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as replied');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update the message in our local array
        const messageIndex = allMessages.findIndex(msg => msg.id === id);
        if (messageIndex !== -1) {
          allMessages[messageIndex].replied = true;
          allMessages[messageIndex].repliedAt = result.updatedMessage.repliedAt;
        }
        
        // Refresh display
        displayMessages();
        loadSummary();
        loadChart();
      }
      
    } catch (error) {
      console.error('Error marking as replied:', error);
      showError('Failed to mark message as replied. Please try again.');
    }
  }

  // Load summary statistics
  async function loadSummary() {
    try {
      const response = await fetch('/api/admin/summary', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load summary');
      }
      
      const summary = await response.json();
      updateSummaryCards(summary);
      
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }

  // Update summary cards
  function updateSummaryCards(summary) {
    if (!summaryCards) return;
    
    summaryCards.innerHTML = `
      <div class="summary-card">
        <h3>Total Messages</h3>
        <div class="value">${summary.totalMessages}</div>
        <div class="label">All submissions</div>
      </div>
      <div class="summary-card">
        <h3>New Messages</h3>
        <div class="value">${summary.newMessages}</div>
        <div class="label">Awaiting reply</div>
      </div>
      <div class="summary-card">
        <h3>Replied Messages</h3>
        <div class="value">${summary.repliedMessages}</div>
        <div class="label">Already replied</div>
      </div>
      <div class="summary-card">
        <h3>Reply Rate</h3>
        <div class="value">${summary.replyRate.toFixed(1)}%</div>
        <div class="label">Reply percentage</div>
      </div>
    `;
  }

  // Load and create chart
  async function loadChart() {
    try {
      const response = await fetch('/api/admin/summary', {
        headers: {
          'Authorization': authToken
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load chart data');
      }
      
      const summary = await response.json();
      createChart(summary.messagesByReason);
      
    } catch (error) {
      console.error('Error loading chart:', error);
    }
  }

  // Create chart using Chart.js
  function createChart(messagesByReason) {
    if (!chartContainer) return;
    
    // Clear previous chart
    chartContainer.innerHTML = '<canvas id="messagesChart"></canvas>';
    
    const canvas = document.getElementById('messagesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Prepare data
    const labels = Object.keys(messagesByReason);
    const data = Object.values(messagesByReason);
    
    // Colors
    const backgroundColors = [
      '#1e3a8a', // Blue
      '#3b82f6', // Lighter Blue
      '#fbbf24', // Gold
      '#facc15', // Lighter Gold
      '#ca8a04', // Darker Gold
      '#6b7280'  // Gray
    ];
    
    const borderColors = backgroundColors.map(color => color);
    
    // Create chart
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Messages by Reason',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Messages by Reason for Contact',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // Show error message
  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-error';
    errorElement.textContent = message;
    errorElement.style.cssText = 'background: #fecaca; color: #b91c1c; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;';
    
    const container = document.querySelector('.admin-container') || document.body;
    container.prepend(errorElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  // Check authentication on page load
  if (!isAuthenticated()) {
    showLogin();
  } else {
    showDashboard();
  }

  // Set active navigation state
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkPage = linkHref.split('/').pop();
    
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (linkPage === '' && currentPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Utility functions
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
