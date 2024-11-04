# Project Name: BookNest

## Project Description
BookNest is a responsive web application designed to streamline the management of a library catalog, including features for book reservation, return, and librarian administration. Users can register, log in, search for books, reserve books, and return them. 
Librarians have special permissions to add, update, and delete books in the catalog. The application prioritizes secure authentication, with user roles for patrons and librarians, and emphasizes a user-friendly experience for managing book interactions.

## Project Tasks

- **Task 1: Set up the development environment**
  - Install necessary tools and libraries (Node.js, Express, bcrypt, SQLite, EJS, etc.)
  - Configure Git and GitHub repository to manage project stages and progress

- **Task 2: Database Setup**
  - Design and create an SQLite database with tables for Users, Books, Libraries, Reservations, and Returns
  - Establish user roles for patrons and librarians in the Users table and set up relationships between tables

- **Task 3: Develop the frontend**
  - Implement the user interface using EJS, HTML, and CSS for dynamic views
  - Style the application with CSS to enhance readability and usability, focusing on responsive design for a seamless user experience

- **Task 4: Develop the backend**
  - Set up the server using Node.js and Express.js
  - Implement RESTful APIs for CRUD operations on books, libraries, and reservations

- **Task 5: Implement user registration and authentication**
  - Create a registration system with password complexity validation and bcrypt hashing for secure storage
  - Develop login and logout functionality, with user session handling via Express sessions
  - Define user roles (patrons and librarians) and restrict access to librarian-specific actions

- **Task 6: Librarian Dashboard**
  - Develop a dashboard for librarians to manage books
  - Enable librarians to add, update, and delete books, including title, author, and library location details
  - Integrate an edit form on the dashboard for streamlined book management

- **Task 7: Book Reservation and Return System**
  - Implement a reservation system where users can reserve available books
  - Create a return functionality that allows users to return books via their username, updating the system to reflect book availability

- **Task 8: Book Search Feature**
  - Implement a search bar for users to quickly find books by title, author, or other keywords within the catalog

- **Task 9: Test the application**
  - Conduct thorough testing of each feature, including registration, login, book management, and reservation/return functions
  - Perform unit and integration testing, debugging issues as they arise

- **Task 10: Document the project**
  - Create a README file with comprehensive setup and usage instructions
  
## Project Skills Learned

- Frontend development with EJS, HTML, CSS, and JavaScript
- Backend development with Node.js and Express.js
- Secure user authentication and authorization using bcrypt and sessions
- Database management with SQLite, including table relationships and CRUD operations
- Testing and debugging for a seamless user experience
- Version control with Git and GitHub
- Writing comprehensive documentation for users and developers

## Languages and Technologies Used

- **HTML, CSS, JavaScript, EJS**: For frontend development and templating
- **Node.js**: For backend development and server setup
- **SQLite**: For relational database management

## Development Process Used

- **Agile Methodology**: Emphasizing iterative development, regular testing, and continuous feedback to adapt and improve features.

## Notes

- Ensure all dependencies are installed using `npm install` before running the application.
- Use `node app.js` to run the server locally.

