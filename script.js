// Todd Benrud Portfolio - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  
  if (hamburger && nav) {
    hamburger.addEventListener('click', function() {
      nav.classList.toggle('active');
      
      // Toggle hamburger icon
      const icon = this.querySelector('div');
      if (nav.classList.contains('active')) {
        // Change to X
        icon.style.transform = 'rotate(45deg)';
      } else {
        // Reset to hamburger
        icon.style.transform = 'rotate(0)';
      }
    });
  }

  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const successMsg = document.getElementById('formSuccess');
      const errorMsg = document.getElementById('formError');
      
      // Hide previous messages
      if (successMsg) successMsg.classList.remove('show');
      if (errorMsg) errorMsg.classList.remove('show');
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      try {
        // Convert form data to object
        const data = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          reason: formData.get('reason'),
          message: formData.get('message')
        };
        
        // Validate required fields
        if (!data.firstName || !data.lastName || !data.email || !data.reason || !data.message) {
          throw new Error('All fields are required');
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new Error('Please enter a valid email address');
        }
        
        // Submit to server
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit form');
        }
        
        const result = await response.json();
        
        // Show success message
        if (successMsg) {
          successMsg.textContent = result.message || 'Thank you for your message! I will get back to you soon.';
          successMsg.classList.add('show');
        }
        
        // Clear form
        form.reset();
        
      } catch (error) {
        // Show error message
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.classList.add('show');
        }
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    });
  }

  // Gallery modal functionality
  const galleryCards = document.querySelectorAll('.gallery-card');
  const modal = document.getElementById('galleryModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  
  if (galleryCards.length > 0 && modal && modalContent && modalClose) {
    galleryCards.forEach(card => {
      card.addEventListener('click', function() {
        const img = this.querySelector('img');
        const video = this.querySelector('video');
        const title = this.querySelector('h3').textContent;
        const caption = this.querySelector('p').textContent;
        
        if (img) {
          modalContent.innerHTML = `
            <img src="${img.src}" alt="${img.alt || title}">
            <div style="padding: 1rem;">
              <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${title}</h3>
              <p style="color: var(--text-secondary);">${caption}</p>
            </div>
          `;
        } else if (video) {
          modalContent.innerHTML = `
            <video controls>
              <source src="${video.src}" type="${video.type || 'video/mp4'}">
              Your browser does not support the video tag.
            </video>
            <div style="padding: 1rem;">
              <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${title}</h3>
              <p style="color: var(--text-secondary);">${caption}</p>
            </div>
          `;
        }
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });
    
    modalClose.addEventListener('click', function() {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // Set active navigation state
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    // Handle both relative paths and full paths
    const linkPage = linkHref.split('/').pop();
    
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (linkPage === '' && currentPage === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Add loaded class to body for animations
  document.body.classList.add('loaded');

  // Lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
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
