## MyFlix Movie App - Backend

### Objective
To build the server-side component of a “movies” web application. The web application will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update personal information, and create a list of favorite movies. The project utilizes the MERN stack (MongoDB, Express, React, and Node.js) to explore API development, web server frameworks, databases, business logic, authentication, data security, and more. 

### User Stories
* I want to be able to receive information on movies, directors, and genres so that I can learn more about movies I’ve watched or am interested in.
* I want to be able to create a profile so I can save data about my favorite movies.

### The 5 W's
* WHO are the users? -- Frontend developers (in this case, me!) who’ll work on the client-side for the
application based on what’s been documented on the server-side  Also final applicication users: movie enthusiasts who enjoy reading information about different movies.
* WHAT is the application? -— The complete server-side portion of the web application, including the server, business logic, and business layers of the application. Consists of a REST API and architected database built using JavaScript, Node.js, Express, and MongoDB. The REST API is accessed via commonly used HTTP methods like GET and POST. Similar methods (CRUD) are used to retrieve data from the database and store that data in a non-relational way.
* WHEN is this application used? —- Whenever users of myFlix are interacting with the application, the server-side of the
application will be in use, processing their requests and performing operations against the data in the database. These users will be able to use the myFlix application whenever they like to read information about different movies or update their user information, for instance, their list of “Favorite Movies.”
* WHERE is this application available? —- The application will be hosted online (Heroku). The myFlix application itself is responsive and can therefore be used anywhere and on any device, giving all users the same experience.
* WHY create this application? —- Movie enthusiasts want to be able to access information about different movies, directors, and genres. The server-side of the myFlix application will ensure they have access to this information, that their requests can be processed, and that all necessary data can be stored.

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
* The API is a Node.js and Express application.
* The API uses REST architecture, with URL endpoints corresponding to the data operations listed above.
* The API uses middleware modules, such as the body-parser package for reading data from requests and morgan for logging.
* The API uses a “package.json” file.
* The database is built using MongoDB.
* The business logic is modeled with Mongoose.
* The API provides movie information in JSON format.
* The JavaScript code is error-free.
* The API was tested in Postman.
* The API includes user authentication and authorization code.
* The API includes data validation logic.
* The API meets data security regulations.
* The API source code is publically deployed to GitHub and Heroku.