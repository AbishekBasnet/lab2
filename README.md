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