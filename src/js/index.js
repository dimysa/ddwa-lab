'use strict'

import logo from '../img/books-logo.png';
import banner from '../img/books-banner.jpg';

import '../css/bootstrap.css';

import ValidationError from './errors/validation-error';
import Author from './models/author';
import Book from './models/book';
import Audiobook from './models/audiobook';
import Textbook from './models/textbook';

import HtmlHelper from './utils/html-helper';

const Worker = require("worker-loader?name=hash.worker.js!./worker");

// ParseObjects

let books = [];
let worker;

function parseJsonToBook(element) {
  let book = {};
  let author = new Author(element.author.firstname, element.author.lastname);
  if(element.type == 'Audiobook') {
    book = new Audiobook(element.id, element.name, element.type, author, element.typeDisk,
        element.countDisk);
  } else if(element.type == 'Textbook') {
    book = new Textbook(element.id, element.name, element.type, author, element.typeScience,
      element.typeInstitution);
  } else if(element.type == "Book") {
    book = new Book(element.id, element.name, element.type, author);
  }
  book.CreatedDate = element.createdDate;
  book.CountPages = element.countPages;
  book.Cost = element.cost;
  return book;
}

function getQueryParam(param) {
  var result =  window.location.search.match(
      new RegExp("(\\?|&)" + param + "(\\[\\])?=([^&]*)")
  );
  return result ? result[3] : false;
}

// WorkingWithPage

function createTable(data, isCreate) {
  if(isCreate)
    books = [];
  else
    document.getElementById('book-table-body').innerHTML = '';
  for (let item of data) {
    let book;
    if(isCreate) {
      book = parseJsonToBook(item);
      books.push(book);
    } else {
      book = item;
    }
    let tr = document.createElement("tr");
    tr.setAttribute("data-id", book.id);
    tr.onclick = function (ev) {
      stopWorker();
      document.location = `info.html?id=${this.getAttribute("data-id")}`;
      ev.preventDefault();
      ev.stopPropagation();
    };
    tr.id = "Book" + book.id;
    let values = [book.id, book.name, book.type, book.author.toString(), book.CreatedDate,
      book.CountPages, book.Cost];
    for (let i = 0; i < values.length; i++) {
      let td = document.createElement("td");
      let text = document.createTextNode(values[i]);
      td.appendChild(text);
      tr.appendChild(td);
    }
    let td = document.createElement("td");
    let editLink = document.createElement("a");
    editLink.href = '#';
    editLink.onclick = function(ev) {
      stopWorker();
      document.location = `edit.html?id=${book.id}`;
      ev.preventDefault();
      ev.stopPropagation();
    }        
    let text = document.createTextNode("Edit ");
    editLink.appendChild(text);      
    td.appendChild(editLink); 
    let deleteLink = document.createElement("a");
    deleteLink.setAttribute("data-id", book.id);
    let textDelete = document.createTextNode(" Delete");      
    deleteLink.onclick = function(ev) {      
      let result = confirm("Are you sure?")
      if(result)
        deleteBook(this.getAttribute("data-id"));
      ev.preventDefault();
      ev.stopPropagation();
    }
    deleteLink.href = '#';
    deleteLink.appendChild(textDelete);
    td.appendChild(deleteLink);
    tr.appendChild(td);

    document.getElementById("book-table-body").appendChild(tr);  
  }
}

function getJsonBookFromField() {
  try {
    document.getElementById("form-book");
    let book = {};
    let bookType = document.getElementById("type").value;  
    let data = {
      name: document.getElementById("name").value,
      type: bookType,
      author : {
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value
      },
      createdDate: document.getElementById("createdDate").value,
      countPages: document.getElementById("countPages").value,
      cost: document.getElementById("cost").value
    };
    switch (bookType) {
      case "Audiobook":
        book = new Audiobook(0, data.name,
          data.type,
          new Author(data.author.firstname, data.author.lastname),
          document.getElementById("typeDisk").value,
          document.getElementById("countDisk").value);
        break;
      case "Textbook":
        book = new Textbook(0, data.name, data.type,
          new Author(data.author.firstname, data.author.lastname),
          document.getElementById("typeScience").value,
          document.getElementById("typeInstitution").value);
        break;
      case "Book":
        book = new Book(0, data.name, data.type,
          new Author(data.author.firstname, data.author.lastname));
        break;  
    }
    book.CreatedDate = data.createdDate;
    book.CountPages = data.countPages;
    book.Cost = data.cost;
    return JSON.stringify(book);
  } catch (ex) {
      if (ex instanceof ValidationError) {
        showErrorMessage(`${ex.fieldName}-error`, false, ex.message);
    }
  }
}

async function postBook() {  
  const book = getJsonBookFromField();
  if(book !== undefined) {
    const htmlHelper = new HtmlHelper();
    try {
      await htmlHelper.post('/books', book);
      alert("Success");
      document.location = 'create.html';
    }
    catch(ex) {
      alert("Error");
      console.log(ex);
    }
  }
}

async function putBook() {  
  const book = getJsonBookFromField();
  if(book !== undefined) {
    const htmlHelper = new HtmlHelper();
    let url = new URL(document.location.href);
    let id = url.searchParams.get("id");
    try {
      await htmlHelper.put("/books", id, book);
      alert("Success");
    }
    catch(ex) {
      alert("Error");
      console.log(ex);
    }
  }
}

async function deleteBook(id) {
  const htmlHelper = new HtmlHelper();  
  try {
    await htmlHelper.delete("/books", id);
    document.getElementById("Book"+id).remove();      
    const bookId = books.indexOf(findBookById(id));
    books.splice(bookId, 1);            
    alert("Success");    
  }
  catch(ex) {
    alert("Error");
    console.log(ex);
  }
}

async function loadInfoCurrentBook() {
  const htmlHelper = new HtmlHelper();  
  const id = getQueryParam('id');
  try {
    let data = await htmlHelper.get(`/books/${id}`);
    fillInfoFields(data);
  }    
  catch (ex) {
    alert("Error"); 
    console.log(ex.message);
  }
}

function fillInfoFields(data) {
  const book = parseJsonToBook(data);
  if(book instanceof Audiobook) {
    document.getElementById("typeDisk").innerText = book.typeDisk;
    document.getElementById("countDisk").innerText = book.countDisk;
  } else if (book instanceof Textbook) {
    document.getElementById("typeScience").innerText = book.typeScience;
    document.getElementById("typeInstitution").innerText = book.typeInstitution;
  }
  document.getElementById("type").innerText = book.type;
  changePages(book.type);
  document.getElementById("name").innerText = book.name;
  document.getElementById("firstname").innerText = book.author.firstname;
  document.getElementById("lastname").innerText = book.author.lastname;
  document.getElementById("createdDate").innerText = book.CreatedDate;
  document.getElementById("countPages").innerText = book.CountPages;
  document.getElementById("cost").innerText = book.Cost;
}

async function loadCurrentBook() {
  setValidation();
  const htmlHelper = new HtmlHelper();  
  const id = getQueryParam('id');
  try {
    let data = await htmlHelper.get(`/books/${id}`);
    fillFormFields(data);
  }
  catch(ex) {
    alert("Error");
    console.log(ex.message);
  }
}

function fillFormFields(data) {
  const book = parseJsonToBook(data);
  if(book instanceof Audiobook) {
    document.getElementById("typeDisk").value = book.typeDisk;
    document.getElementById("countDisk").value = book.countDisk;
  } else if (book instanceof Textbook) {
    document.getElementById("typeScience").value = book.typeScience;
    document.getElementById("typeInstitution").value = book.typeInstitution;
  }
  document.getElementById("type").value = book.type;
  changePages(book.type);
  document.getElementById("name").value = book.name;
  document.getElementById("firstname").value = book.author.firstname;
  document.getElementById("lastname").value = book.author.lastname;
  document.getElementById("createdDate").value = book.CreatedDate;
  document.getElementById("countPages").value = book.CountPages;
  document.getElementById("cost").value = book.Cost;
}

function changePages(type) {  
  switch (type) {
    case "Book":
      document.getElementById("audiobook-fields").hidden = true;
      document.getElementById("textbook-fields").hidden = true;
      break;
    case "Audiobook": 
      document.getElementById("audiobook-fields").hidden = false;
      document.getElementById("textbook-fields").hidden = true;
      break;
    case "Textbook": 
      document.getElementById("audiobook-fields").hidden = true;
      document.getElementById("textbook-fields").hidden = false;
      break;
    default:
      break;
  }
}

function goToIndex() {
  document.location = "index.html";
}

async function loadIndexPage() {
  try {
    setIcons();
    initWorker();

    const htmlHelper = new HtmlHelper();
    let data = await htmlHelper.get('/books');    
    createTable(data, true);
  }
  catch(ex) {
    alert('Error');
    console.log(`Error: ${ex.message}`);
  }
}

function setIcons() {
  document.getElementById("pic-logo").setAttribute("src", logo);
  document.getElementById("pic-banner").setAttribute("src", banner);
}

//Search

let booksGenerator = function* () {
  for(let book of books) {
    yield book;
  }
}

function findBookById(id) {
  const gen = booksGenerator();
  let item = gen.next();
  while(!item.done) {
    if(item.value.id === id) {
      return item.value;
    }
    item = gen.next();
  }
}

function searchBooks() {
  const query = document.getElementById('searchBooks').value || '';  
  const gen = booksGenerator();
  let item = gen.next();
  while(!item.done) {
    if(item.value.name.includes(query) || item.value.author.toString().includes(query) || 
      item.value.type.includes(query) || query == '') {
        document.getElementById(`Book${item.value.id}`).hidden = false;
    } else {
      document.getElementById(`Book${item.value.id}`).hidden = true;      
    }
    item = gen.next();
  }
}

//Sort

function sortBooks(fieldName, isNumber) {  
  books = books.sort((a, b) => {
    let first, second;
    if(isNumber){
      first = Number(a[fieldName]);
      second = Number(b[fieldName]);
    } else {
      first = a[fieldName];
      second = b[fieldName];
    }
    if(first > second)
      return 1;
    if(first < second)
      return -1;
    return 0;
  });
  createTable(books, false);
}

//Worker

let updateTimeWorker;
const UPDATE_TIME = 60000;

function initWorker() {  
  worker = new Worker;
  worker.addEventListener('message', function (e) {
    if(!isNaN(Number(e.data))) {
      const countBooks = e.data;
      updateLabel(countBooks);
    } else {
      if(e.data.includes('updateTime')) {
        updateTimeWorker = Number(e.data.split(',')[1]);
        if(updateTimeWorker == 0)
          localStorage.setItem('updateTime', Date.now());
      }
    }
  });
  let updateTime = localStorage.getItem('updateTime');  
  if(updateTime) {
    worker.postMessage(updateTime);    
  } else {    
    worker.postMessage('startWorker');
    localStorage.setItem('updateTime', Date.now());
  }
}

function updateLabel(count) {
  const label = document.getElementById('books-count');
  if(count) {
    label.innerHTML = `Counts of books: ${count}`;
  }
}

function stopWorker() {  
  let updateTime = localStorage.getItem('updateTime');
  if(updateTimeWorker) {    
    updateTime = Number(updateTime - UPDATE_TIME + updateTimeWorker);  
    localStorage.setItem('updateTime', updateTime);
  }
  worker.terminate();
}

//Validation

function setValidation() {  
  document.getElementById("name").addEventListener("invalid", () => showErrorMessage("name-error", false));
  document.getElementById("firstname")
    .addEventListener("invalid", () => showErrorMessage("firstname-error", false));
  document.getElementById("lastname")
    .addEventListener("invalid", () => showErrorMessage("lastname-error", false));
  document.getElementById("countPages")
    .addEventListener("invalid", () => showErrorMessage("countPages-error", false, 'Please, enter field(only numbers, >= 10)'));
  document.getElementById("cost")
    .addEventListener("invalid", () => showErrorMessage("cost-error", false, 'Please, enter field(only numbers)'));
  document.getElementById("createdDate")
    .addEventListener("invalid", () => showErrorMessage("createdDate-error", false, 'Please, enter date'));
}

function showErrorMessage(idElement, isHidden, message) {
  document.getElementById(idElement).hidden = isHidden;
  if(message !== undefined)
    document.getElementById(idElement).innerText = message;
}

function hideErrorMessages()
{
  let idElementErrors = ["name-error", 
    "firstname-error", "lastname-error", "countPages-error", "cost-error", "createdDate-error"];
  idElementErrors.forEach(elem => showErrorMessage(elem, true));
}

export {loadIndexPage,
  stopWorker,
  searchBooks, 
  loadInfoCurrentBook,
  loadCurrentBook, 
  putBook, 
  postBook, 
  hideErrorMessages, 
  changePages, 
  goToIndex, 
  setValidation,
  sortBooks
};