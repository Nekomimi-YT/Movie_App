## LisFlix Movie App - Backend

### Objective

Build the server-side component of LisFlix, a movies web application. The app will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update personal information, and create a list of favorite movies. The project utilizes the MERN stack (MongoDB, Express, React, and Node.js) to explore API development, web server frameworks, databases, business logic, authentication, data security, and more. 

### Postman Tests

User Registration
![User Registration](/img/Register.jpg)

User Login
![User Login](/img/Login.jpg)

Authorise user and get all movies
![Authorise user and get all movies](/img/Movies.jpg)

### User Stories

I want to:
* Receive information on movies, directors, and genres so that I can learn more about movies I’ve watched or am interested in.
* Create a profile so I can save data about my favorite movies.

### The 5 W's
* WHO are the users?
    * Frontend developers
    * Also final applicication users: movie enthusiasts who enjoy reading information about different movies.

* WHAT is the application? 
The complete server-side portion of the web application, including the server, business logic, and business layers of the application. Consists of a REST API and architected database built using JavaScript, Node.js, Express, and MongoDB. The REST API is accessed via commonly used HTTP methods like GET and POST. Similar methods (CRUD) are used to retrieve data from the database and store that data in a non-relational way.

* WHEN is this application used?
Whenever users of LisFlix are interacting with the application, the server-side of the application will be in use, processing requests and performing operations against the data in the database. These users will be able to use the LisFlix application whenever they like to read information about different movies or update their user information, for instance, their list of “Favorite Movies.”

* WHERE is this application available?
The application will be hosted online (Heroku). The LisFlix application itself is responsive and can therefore be used anywhere and on any device, giving all users the same experience.

* WHY create this application?
Movie enthusiasts want to be able to access information about different movies, directors, and genres. The server-side of the LisFlix application will ensure they have access to this information, that their requests can be processed, and that all necessary data can be stored.

### User Features
* Return a list of ALL movies to the user
* Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
* Return data about a genre (description) by name/title (e.g., “Thriller”)
* Return data about a director (bio, birth year, death year) by name
* Allow new users to register
* Allow users to update their user info (username, password, email, date of birth)
* Allow users to add a movie to their list of favorites
* Allow users to remove a movie from their list of favorites
* Allow existing users to deregister

### Technical Features
* Node.js and Express application
* REST architecture, with URL endpoints corresponding to the data operations listed above
* Middleware modules, such as the body-parser package for reading data from requests and morgan for logging
* The database is built using MongoDB
* The business logic is modeled with Mongoose
* Movie information in JSON format
* Tested in Postman
* Includes user authentication and authorization code
* Includes data validation logic
* Meets data security regulations
* Source code is publically deployed to GitHub and Heroku