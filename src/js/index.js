'use strict'
// Objects

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
    if(date > Date.now())
      throw "Date must be less when now";
    this.createdDate = date;
  }

  get CountPages() {
    return this.countPages;
  }

  set CountPages(count) {
    if(count <= 10)
      throw "Count pages must be more than 10";
    this.countPages = count;
  }

  get Cost() {
    return this.cost;
  }

  set Cost(cost) {
    if(cost <= 0)
      throw "Cost must be more than 0";
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

  get(url, query, successClb, faliedClb) {
    let xhr = new XMLHttpRequest();
    let fullUrl = this.baseUrl + url;
    xhr.open('GET', fullUrl);
    xhr.onreadystatechange = () => {      
      if(xhr.readyState != 4) return;

      if(xhr.status == 200) {
        successClb(JSON.parse(xhr.response));
      } else {
        faliedClb();
      }
    }
    xhr.send();
  }

  post(url, body, successClb, faliedClb) {
    let xhr = new XMLHttpRequest();
    let fullUrl = this.baseUrl + url;
    xhr.open('POST', fullUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if(xhr.readyState != 4) return;
  
      if(xhr.status == 201) {
        successClb();
      } else {
        faliedClb();
      }
    }
    xhr.send(body);
  }

  put(url, id, body, successClb, faliedClb) {
    let xhr = new XMLHttpRequest();
    let fullUrl = this.baseUrl + url + '/' + id;
    xhr.open('PUT', fullUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if(xhr.readyState != 4) return;
  
      if(xhr.status == 200) {
        successClb();
      } else {
        faliedClb();
      }
    }
    xhr.send(body);
  }

  delete(url, id, successClb, faliedClb) {
    let xhr = new XMLHttpRequest();
    let fullUrl = this.baseUrl + url + "/" + id;
    xhr.open('DELETE', fullUrl);
    xhr.onreadystatechange = () => {
      if(xhr.readyState != 4) return;
  
      if(xhr.status == 200) {
        successClb();
      } else {
        faliedClb();
      }
    }
    xhr.send();
  }
}

// ParseObjects

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

// WorkingWithPage

function createTable(data) {
  for (let item in data) {
    if (data.hasOwnProperty(item)) {
      let book = parseJsonToBook(data[item]);
      let tr = document.createElement("tr");
      tr.setAttribute("data-id", book.id);
      tr.onclick = () => document.location = `info.html?id=${this.getAttribute("data-id")}`;      
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
      editLink.href = `edit.html?id=${book.id}`;
      let text = document.createTextNode("Edit ");
      editLink.appendChild(text);      
      td.appendChild(editLink); 
      let deleteLink = document.createElement("a");
      deleteLink.setAttribute("data-id", book.id);
      let textDelete = document.createTextNode(" Delete");      
      deleteLink.onclick = ev => {
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
}

function getJsonBookFromField() {
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
}

function postBook() {  
  let book = getJsonBookFromField();
  let htmlHelper = new HtmlHelper();
  htmlHelper.post("/books", book, () => {
    alert("Success");
    document.location = "create.html";
  }, () => alert("Error"));  
}

function putBook() {  
  let book = getJsonBookFromField();
  let htmlHelper = new HtmlHelper();
  let url = new URL(document.location.href);
  let id = url.searchParams.get("id");
  htmlHelper.put("/books", id, book, () => alert("Success"), () => alert("Error"));
}

function deleteBook(id) {
  let htmlHelper = new HtmlHelper();
  htmlHelper.delete("/books", id, () => {
    document.getElementById("Book"+id).remove();
    alert("Success");    
  }, () => alert("Error"));  
}

function loadInfoCurrentBook() {
  let htmlHelper = new HtmlHelper();
  let url = new URL(document.location.href);
  let id = url.searchParams.get("id");
  htmlHelper.get("/books/"+id, "", fillInfoFields, () => alert("Error"));
}

function fillInfoFields(data) {
  let book = parseJsonToBook(data);
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
  document.getElementById("createdDate").innerText = book.getCreatedDate();
  document.getElementById("countPages").innerText = book.getCountPages();
  document.getElementById("cost").innerText = book.getCost();
}

function loadCurrentBook() {
  let htmlHelper = new HtmlHelper();
  let url = new URL(document.location.href);
  let id = url.searchParams.get("id");
  htmlHelper.get("/books/"+id, "", fillFormFields, () => alert("Error"));
}

function fillFormFields(data) {
  let book = parseJsonToBook(data);
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
  document.getElementById("createdDate").value = book.getCreatedDate();
  document.getElementById("countPages").value = book.getCountPages();
  document.getElementById("cost").value = book.getCost();
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
  let htmlHelper = new HtmlHelper();
  htmlHelper.get('/books', "", createTable, () => alert("Error"));
}

//Validation

function setValidation() {
  document.getElementById("name").addEventListener("invalid", () => showErrorMessage("name-error", false));
  document.getElementById("firstname").addEventListener("invalid", () => showErrorMessage("firstname-error", false));
  document.getElementById("lastname").addEventListener("invalid", () => showErrorMessage("lastname-error", false));
  document.getElementById("countPages").addEventListener("invalid", () => showErrorMessage("countPages-error", false));
  document.getElementById("cost").addEventListener("invalid", () => showErrorMessage("cost-error", false));
  document.getElementById("createdDate").addEventListener("invalid", () => showErrorMessage("createdDate-error", false));
}

function showErrorMessage(idElement, isHidden) {
  document.getElementById(idElement).hidden = isHidden;
}

function hideErrorMessages()
{
  let idElementErrors = ["name-error", "firstname-error", "lastname-error", "countPages-error", "cost-error", "createdDate-error"];
  idElementErrors.forEach(elem => showErrorMessage(elem, true));
}