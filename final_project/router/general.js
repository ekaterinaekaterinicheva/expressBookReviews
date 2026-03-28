const express = require('express');
let books = require("./booksdb.js");
const public_users = express.Router();
const axios = require('axios');

// Task 10: Get the book list available in the shop
public_users.get('/', async function (req, res) {
 try {
        // Optimization: Instead of new Promise(), we treat the operation as async
        const bookList = await books; 
        res.status(200).send(JSON.stringify(bookList, null, 3));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book list" });
    }
});

// Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await books[isbn];
        if (book) {
            return res.status(200).send(JSON.stringify(book, null, 3));
        }
        throw new Error("Book not found");
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});
  
// Task 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  // Retrieve the author parameter from the request params
  const author = req.params.author;

  try {
    const filtered_books = Object.values(books).filter(book => book.author === author);

    if (filtered_books.length > 0) {
            return res.status(200).send(JSON.stringify(filtered_books, null, 3));
    }
        throw new Error("No books found for this author");
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
    
});

// Task 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const filtered_books = Object.values(books).filter(book => book.title === title);
        
        if (filtered_books.length > 0) {
            return res.status(200).send(JSON.stringify(filtered_books, null, 3));
        }
        throw new Error("No books found for this title");
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 3));
    }
    return res.status(404).json({ message: "Book not found." });
});

module.exports.general = public_users;
