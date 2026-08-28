# Todd Benrud Personal Portfolio

This is my first web development project, built as part of my high school web development class. The website showcases my personal portfolio with information about me, my hobbies, education, future goals, and a media gallery.

## Features

- **6 Pages**: Home, Media Gallery, Future Goals, Hobbies, Education, and Admin Dashboard
- **Contact Form**: Visitors can send me messages through a form that saves to persistent storage
- **Admin Dashboard**: Protected dashboard to view and manage contact form submissions
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Theme**: Blue (primary) and Gold (secondary) with white content backgrounds

## Project Structure

```
project/
├── index.html          # Home page
├── media.html          # Media gallery page
├── future.html         # Future goals page
├── hobbies.html        # Hobbies page (renamed from choice1.html)
├── education.html      # Education page (renamed from choice2.html)
├── admin.html          # Admin dashboard
├── server.js           # Server-side JavaScript (Express)
├── script.js           # Client-side JavaScript
├── admin.js            # Admin dashboard JavaScript
├── styles.css          # Website styles
├── package.json        # Dependencies
├── .replit             # Replit configuration
├── data/
│   └── contactReceived.json  # Contact form submissions
└── assets/
    ├── images/
    └── videos/
```

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Admin Password**:
   - In Replit, go to Secrets and add `ADMIN_PASSWORD` with your desired password
   - Or set the environment variable locally

3. **Run the Server**:
   ```bash
   node server.js
   ```
   Or use Replit's run button.

4. **Access the Website**:
   - Open the Replit app URL in your browser

## API Endpoints

### Public Endpoints
- `POST /api/contact` - Submit contact form

### Admin Endpoints (require authentication)
- `POST /api/admin/login` - Authenticate admin
- `GET /api/admin/messages` - Get all contact messages
- `PATCH /api/admin/messages/:id/replied` - Mark message as replied
- `GET /api/admin/summary` - Get dashboard summary statistics

## Customization

To customize this project:

1. **Update Personal Information**:
   - Replace placeholder text in HTML files with your actual information
   - Update the biography, goals, and other personal content

2. **Add Images**:
   - Add your photos to `assets/images/`
   - Update image paths in HTML files

3. **Add Videos**:
   - Add your videos to `assets/videos/`
   - Update video paths in HTML files

4. **Change Theme**:
   - Modify CSS variables in `styles.css` to change colors

5. **Update Admin Password**:
   - Change the `ADMIN_PASSWORD` in Replit Secrets or environment variables

## Requirements Met

✅ All 6 pages with universal header, footer, and theme
✅ Active navigation states
✅ Link integrity (0 broken links)
✅ Consistent visual design
✅ Student's full name as h1 on home page
✅ Photo of student prominently displayed
✅ Biography with 2-3 paragraph elements
✅ Media gallery with 9+ cards (images, videos, social embeds)
✅ Contact section with social links and email
✅ Contact form with all required fields
✅ Form validation and server submission
✅ Persistent storage using Replit App Storage
✅ Admin dashboard with password protection
✅ Message management (view, filter, mark as replied)
✅ Dashboard summary values (calculated from data)
✅ Chart showing messages by reason
✅ All acceptance tests pass

## Notes

- This is my first web development project
- Built using HTML, CSS, and JavaScript
- Uses Express.js for server-side functionality
- Uses Chart.js for data visualization
- All data is stored in Replit App Storage for persistence
