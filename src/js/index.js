'use strict'

import logo from '../img/books-logo.png';
import banner from '../img/books-banner.jpg';

import '../css/bootstrap.css';
import 'tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css'

import ValidationError from './errors/validation-error';
import Author from './models/author';
import Book from './models/book';
import Audiobook from './models/audiobook';
import Textbook from './models/textbook';

import HtmlHelper from './utils/html-helper';

const Worker = require("worker-loader?name=hash.worker.js!./worker");

const $ = require('jquery');
const dt = require('datatables.net-bs4');

require('jquery-validation');

var moment = require('moment');
require('tempusdominus-bootstrap-4');

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
    $('#book-table-body').innerHTML = '';
  for (let item of data) {
    let book;
    if(isCreate) {
      book = parseJsonToBook(item);
      books.push(book);
    } else {
      book = item;
    }
  }
  let table = $("#book-table").DataTable({    
    data: books,
    columns : [
      {data: 'id'},
      {data: 'name'},
      {data: 'type'},
      {data: 'author'},
      {data: 'CreatedDate'},
      {data: 'CountPages'},
      {data: 'Cost'},
      null,
      null
    ],
    columnDefs: [{
      targets: -1,
      data: null,
      defaultContent: "<button class='btnDelete btn btn-default'>Delete</button>"
    },
    {
      targets: -2,
      data: null,
      defaultContent: "<button class='btnEdit btn btn-default'>Edit</button>"
    }
  ],
    ordering: true,
    select: true
  });

  $('.btnDelete').on('click', 'button', function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let data = table.row( $(this).parents('tr') ).data();
    let result = confirm("Are you sure?")
    if(result)
      deleteBook(data.id);
  });
  
  $('.btnEdit').each(function() {
    $(this).click((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let data = table.row( $(this).parents('tr') ).data();
      stopWorker();
      document.location = `edit.html?id=${data.id}`;
    })
  });

  $('.btnDelete').each(function() {
    $(this).click((ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let result = confirm("Are you sure?")
      if(result) {
        let row = table.row( $(this).parents('tr') );
        let data = row.data();
        deleteBook(data.id);
        row.remove().draw();
      }
    })
  });

  $('#book-table tbody').on('click', 'tr', function () {
    let data = table.row( this ).data();
    stopWorker();
    document.location = `info.html?id=${data.id}`;
  });
}

function getJsonBookFromField() {
  try {    
    let book = {};
    let bookType = $("#type").val();  
    let data = {
      name: $("#name").val(),
      type: bookType,
      author : {
        firstname: $("#firstname").val(),
        lastname: $("#lastname").val()
      },
      createdDate: $("#createdDate").val(),
      countPages: $("#countPages").val(),
      cost: $("#cost").val()
    };
    switch (bookType) {
      case "Audiobook":
        book = new Audiobook(0, data.name,
          data.type,
          new Author(data.author.firstname, data.author.lastname),
          $("#typeDisk").val(),
          $("#countDisk").val());
        break;
      case "Textbook":
        book = new Textbook(0, data.name, data.type,
          new Author(data.author.firstname, data.author.lastname),
          $("#typeScience").val(),
          $("#typeInstitution").val());
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
    let id = getQueryParam('id');
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
    //$("#Book"+id).remove();      
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
    $("#typeDisk").text(book.typeDisk);
    $("#countDisk").text(book.countDisk);
  } else if (book instanceof Textbook) {
    $("#typeScience").text(book.typeScience);
    $("#typeInstitution").text(book.typeInstitution);
  }
  $("#type").text(book.type);
  changePages(book.type);
  $("#name").text(book.name);
  $("#firstname").text(book.author.firstname);
  $("#lastname").text(book.author.lastname);
  $("#createdDate").text(book.CreatedDate);
  $("#countPages").text(book.CountPages);
  $("#cost").text(book.Cost);
}

async function loadCurrentBook() {
  setValidation('form-put-book');
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
    $("#typeDisk").val(book.typeDisk);
    $("#countDisk").val(book.countDisk);
  } else if (book instanceof Textbook) {
    $("#typeScience").val(book.typeScience);
    $("#typeInstitution").val(book.typeInstitution);
  }
  $("#type").val(book.type);
  changePages(book.type);
  $("#name").val(book.name);
  $("#firstname").val(book.author.firstname);
  $("#lastname").val(book.author.lastname);
  $("#createdDate").val(book.CreatedDate);
  $("#countPages").val(book.CountPages);
  $("#cost").val(book.Cost);
}

function changePages(type) {  
  switch (type) {
    case "Book":
      $("#audiobook-fields").hide();
      $("#textbook-fields").hide();
      break;
    case "Audiobook": 
      $("#audiobook-fields").show();
      $("#textbook-fields").hide();
      break;
    case "Textbook": 
      $("#audiobook-fields").hide();
      $("#textbook-fields").show();
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
  $("#pic-logo").attr("src", logo);
  $("#pic-banner").attr("src", banner);
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
  const query = $('#searchBooks').val() || '';  
  const gen = booksGenerator();
  let item = gen.next();
  while(!item.done) {
    if(item.value.name.includes(query) || item.value.author.toString().includes(query) || 
      item.value.type.includes(query) || query == '') {
        $(`#Book${item.value.id}`).show();
    } else {
      $(`#Book${item.value.id}`).hide();
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
  const label = $('#books-count');
  if(count) {
    label.html(`Counts of books: ${count}`);
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

function setValidation(formId = 'form-post-book') {  
  $('#datetimepicker4').datetimepicker({
    format: 'L'
  });
  // $(`#${formId}`).on("submit", function(ev) {
  //   ev.preventDefault();
  //   ev.stopImmediatePropagation();
  //   if(formId == 'form-post-book')
  //     postBook();
  //   else {
  //     console.log("PUT");
  //     putBook();
  //   }
  // });

  jQuery.validator.addMethod(
    'regexp',
    function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
    },
    "Please check your input."
  );
  jQuery.validator.addClassRules({
      name: {
          required: true,
          regexp: '^[а-яА-ЯёЁa-zA-Z0-9]+'
      },
      text: {
          required: true,
          regexp: '^[а-яА-ЯёЁa-zA-Z]+'
      },
      number: {
          required: true,
          regexp: '^[0-9]+',
          min: 1,
          maxlength: 3000
      },
      date: {
          required: true
      }
  });

  $(`#${formId}`).validate({
    submitHandler: function(ev) {
      if(formId == 'form-post-book')
        postBook();
      else {
        console.log("PUT");
        putBook();
      }
    },
    invalidHandler: function(ev, validator) {
      console.log("ERROR");
      let errors = validator.numberOfInvalids();
      if(errors) {
        console.log("Error validation");
      }
    }
  });
  
  // $("#name").on("invalid", () => showErrorMessage("name-error", false));
  // $("#firstname")
  //   .on("invalid", () => showErrorMessage("firstname-error", false));
  // $("#lastname")
  //   .on("invalid", () => showErrorMessage("lastname-error", false));
  // $("#countPages")
  //   .on("invalid", () => showErrorMessage("countPages-error", false, 'Please, enter field(only numbers, >= 10)'));
  // $("#cost")
  //   .on("invalid", () => showErrorMessage("cost-error", false, 'Please, enter field(only numbers)'));
  // $("#createdDate")
  //   .on("invalid", () => showErrorMessage("createdDate-error", false, 'Please, enter date'));
}

function showErrorMessage(idElement, isHidden, message) {
  if(isHidden)
    $(`#${idElement}`).hide();
  else
    $(`#${idElement}`).show();
  if(message !== undefined)
    $(`#${idElement}`).text(message);
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