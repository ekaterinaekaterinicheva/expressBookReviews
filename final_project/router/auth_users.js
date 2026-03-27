const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    // Check if username exists in the users array
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{
    // Check if username and password match the records
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: Missing username or password" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT Access Token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store Authentication info in session
        req.session.authorization = {
            accessToken, username
        };
        
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let review = req.query.review; // Get review from the query string
    let username = req.session.authorization['username']; // Get username from session

    if (!review) {
        return res.status(400).json({message: "Review content is missing"});
    }

    if (books[isbn]) {
        let book = books[isbn];
        // Assign the review to the username key
        book.reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const sessionData = req.session.authorization;
    
    // Check if user is logged in via session
    if (!sessionData || !sessionData['username']) {
        return res.status(403).json({ message: "User not logged in" });
    }
  
    const username = sessionData['username'];
  
    // Check if the book exists
    if (books[isbn]) {
        let book = books[isbn];
        
        // Check if this specific user has a review for this book
        if (book.reviews[username]) {
            delete book.reviews[username]; // Delete only this user's review
            return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
        } else {
            return res.status(404).json({ message: "No review found for this user on this book." });
        }
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
