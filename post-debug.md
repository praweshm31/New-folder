# Post visibility fixes and debugging guide

1. Check these URLs on your site:
   - Main page: /
   - Debug page: /debug.html
   - Individual post: /2025/09/13/welcome

2. If posts are not visible, verify:
   - All post files are in _posts directory
   - All post files have proper date format: YYYY-MM-DD-title.md
   - Front matter in each post has:
     ```yaml
     ---
     layout: post
     title: "Your Title"
     date: YYYY-MM-DD HH:MM:SS +TIMEZONE
     ---
     ```

3. Common issues to check:
   - Timezone in post dates
   - File permissions
   - Front matter formatting
   - Post file naming convention

4. If you're still not seeing posts, try:
   - Clearing your Jekyll cache
   - Rebuilding the site
   - Checking Jekyll build output for errors