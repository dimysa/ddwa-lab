'use strict'
// Objects

class ValidationError extends Error {
  constructor(fieldName, message) {
    super(message);
    this.fieldName = fieldName;    
  }
}

class Author {
  constructor(firstname, lastname) {
    this.firstname = firstname;
    this.lastname = lastname;
  }

  toString() {
    return `${this.firstname} ${this.lastname}`;
  }
}

class Book {
  constructor(id, name, type, author) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.author = author;
  }

  get CreatedDate() {
    return this.createdDate;
  }

  set CreatedDate(date) {  
    if(Date.parse(date) > Date.now())
      throw new ValidationError("createdDate", "Date must be less when now");
    this.createdDate = date;
  }

  get CountPages() {
    return this.countPages;
  }

  set CountPages(count) {    
    if(count <= 10)
      throw new ValidationError("countPages", "Count pages must be more than 10");
    this.countPages = count;
  }

  get Cost() {
    return this.cost;
  }

  set Cost(cost) {    
    if(cost <= 0)
      throw new ValidationError("cost", "Cost must be more than 0");
    this.cost = cost;
  }
}

class Audiobook extends Book {
  constructor(id, name, type, author, typeDisk = "CD", countDisk = 1) {
    super(id, name, type, author);
    this.typeDisk = typeDisk;
    this.countDisk = countDisk;
  }
}

class Textbook extends Book {
  constructor(id, name, type, author, typeScience = "", typeInstitution = "") {
    super(id, name, type, author);
    this.typeScience = typeScience;
    this.typeInstitution = typeInstitution;
  }
}

// HtmlHelper

class HtmlHelper {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }  

  get(url, query) {    
    let fullUrl = this.baseUrl + url + (query ? query : "");    
    return this.request(fullUrl, 'GET', null);
  }

  post(url, body) {    
    let fullUrl = this.baseUrl + url;
    return this.request(fullUrl, 'POST', body);
  }

  put(url, id, body) {    
    let fullUrl = this.baseUrl + url + '/' + id;
    return this.request(fullUrl, 'PUT', body);    
  }

  delete(url, id) {    
    let fullUrl = this.baseUrl + url + "/" + id;
    return this.request(fullUrl, 'DELETE', null);
  }

  request(url, method, body) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;

        if(xhr.status == 200 || xhr.status == 201) {
          return resolve(JSON.parse(xhr.responseText));          
        } else {
          return reject(new Error(xhr.responseText));
        }
      }
      xhr.send(body);
    });
  }
}

// ParseObjects

this.books = [];

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

function createTable(data) {
  books = [];
  for (let item of data) {
    let book = parseJsonToBook(item);
    books.push(book);
    let tr = document.createElement("tr");
    tr.setAttribute("data-id", book.id);
    tr.onclick = function (ev) {
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

function postBook() {  
  const book = getJsonBookFromField();
  if(book !== undefined) {
    const htmlHelper = new HtmlHelper();
    htmlHelper.post('/books', book)
      .then(() => {
        alert("Success");
        document.location = 'create.html';
      })
      .catch(ex => { alert("Error"); console.log(ex) });
  }
}

function putBook() {  
  const book = getJsonBookFromField();
  if(book !== undefined) {
    const htmlHelper = new HtmlHelper();
    let url = new URL(document.location.href);
    let id = url.searchParams.get("id");
    htmlHelper.put("/books", id, book)
      .then(() => alert("Success"))
      .catch(ex => { alert("Error"); console.log(ex) });
  }
}

function deleteBook(id) {
  const htmlHelper = new HtmlHelper();  
  htmlHelper.delete("/books", id)
    .then(() => {
      document.getElementById("Book"+id).remove();      
      const bookId = books.indexOf(findBookById(id));
      books.splice(bookId, 1);            
      alert("Success");    
    })
    .catch(ex => { alert("Error"); console.log(ex) });
}

function loadInfoCurrentBook() {
  const htmlHelper = new HtmlHelper();  
  const id = getQueryParam('id');
  htmlHelper.get(`/books/${id}`)
    .then(data => fillInfoFields(data))
    .catch(ex => { alert("Error"); console.log(ex) });
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

function loadCurrentBook() {
  const htmlHelper = new HtmlHelper();  
  const id = getQueryParam('id');
  htmlHelper.get(`/books/${id}`)
    .then(data => fillFormFields(data))
    .catch(() => alert("Error"));
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

function loadIndexPage() {
  const htmlHelper = new HtmlHelper();
  htmlHelper.get('/books')
    .then(data => createTable(data))
    .catch(() => alert("Error"));
}

//Search

this.booksGenerator = function* () {
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