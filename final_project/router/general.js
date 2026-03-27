const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });
    return userswithsamename.length > 0;
  }

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  // Send JSON response with formatted books data
  try {
    const getBooks = () => {
        return new Promise((resolve, reject) => {
            resolve(books);
        });
  }
  const bookList = await getBooks();
    res.status(200).send(JSON.stringify(bookList, null, 3));
    
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    // Retrieve the ISBN parameter from the request params
    const isbn = req.params.isbn;
    
    try {
        // Simulating an asynchronous search operation
        const getBook = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        });

        const bookDetails = await getBook;
        return res.status(200).send(JSON.stringify(bookDetails, null, 3));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  // Retrieve the author parameter from the request params
  const author = req.params.author;

  try {
    // Simulating an asynchronous search operation
    const getBooksByAuthor = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const filtered_books = [];

        keys.forEach((key) => {
            if (books[key].author === author) {
                filtered_books.push({
                    isbn: key,
                    ...books[key]
                });
            }
        });

        if (filtered_books.length > 0) {
            resolve(filtered_books);
        } else {
            reject("No books found for this author");
        }
    });

    const authorBooks = await getBooksByAuthor;
    return res.status(200).send(JSON.stringify(authorBooks, null, 3));

} catch (error) {
    return res.status(404).json({ message: error });
}
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Retrieve the title parameter from the request params
  const title = req.params.title;
  const keys = Object.keys(books); // Get all ISBN keys
  const filtered_books = []; // Array to hold books of this title

  // Iterate through the books object
  keys.forEach((key) => {
    if (books[key].title === title) {
      filtered_books.push({
        isbn: key,
        ...books[key]
      });
    }
  });
 
  if (filtered_books.length > 0) {
    return res.status(200).send(JSON.stringify(filtered_books, null, 3));
  } else {
    return res.status(404).json({ message: "No books found for this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists in the records
  const book = books[isbn];

  if (book) {
    // Send only the "reviews" part of the book object
    return res.status(200).send(JSON.stringify(book.reviews, null, 3));
  } else {
    // Return a 404 if the ISBN doesn't match any book
    return res.status(404).json({ message: "No reviews found. Book not found." });
  }
});

module.exports.general = public_users;
