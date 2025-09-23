# Abishek
Issues Encountered
1. One thread is not being deleted
2.  Responding to a thread is not functioning.
3.  inital message is not showing in thread

Actions Taken

The primary modifications were made within SubjectList.js on the frontend.
A completely new model was created for Subject.js on the backend.
# lab2b


# Bruno
Modifications made:
1. switched to use MongoDB Atlas, my computer don't run MongoDB.
2. Deleted the author name's field from the threads, and added the request to get this info from the database.
3. Set the comments feature, switched the user name from "getting from the user" to get from the Database.
4. Added Like/Dislike feature(subjects and comments)


# Biraj
Modifications by Biraj:

1. Added delete comment functionality with trash button.
2. Updated like/dislike to show counts inside it.
3. Removed the existing score display for better visual.
4. Added proper authorization checks for comment deletion.

# Ekjot
Modifications made:

## What I Did

### 1. Login & Registration (Auth.js + Auth.css) (Front-end)
- Redesigned the login/register page to look **modern and professional**  
- Added a **new file** `Auth.css` to handle styles separately.  
- Changed background, fonts, and buttons to give the page a fresh look.
- Added animation, colored background and font with improved layout for a better user experience. 
- **Here, I Used:** React (JSX + useState), Bootstrap forms/buttons, Custom CSS (Auth.css), React Icons  

---

### 2. Discussion Board (SubjectList.js + custom.css)
- Restyled the **thread list and comments** to look cleaner and more attractive.  
- Added a **new file** `custom.css` to manage styling changes.  
- Improved card design with **shadows, spacing, and rounded corners**   
- Styled the reply box and buttons to make the UI more user-friendly     
- **Here, I Used:** React (JSX + Hooks), Bootstrap (cards, buttons, layout), Custom CSS (custom.css), React Icons

# How to access Web page:
1. clone the repository: https://github.com/AbishekBasnet/lab2
2. After that, type this in terminal:  cd lab2
3. Then install dependecies for client and server :
-# Install server dependencies
cd server
npm install

-# Install client dependencies
cd ../client
npm install
4. Run the app:
for server folder
- cd server
- node app.js

for client folder:
-cd client
-npm start (browser will automatically open the web-page, in this step at : http://localhost:3000) 
Finally, taken to our 'Discussion-Board'
--- Registeration>> Logging in>> Thread List Page
And finally 'Logout' to exit this screen.

