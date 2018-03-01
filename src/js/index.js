// Objects

function Author(firstname, lastname) {
  this.firstname = firstname;
  this.lastname = lastname;
}

Author.prototype.toString = function() {
  return this.firstname + ' ' + this.lastname;
}

function Book(id, name, type, author) {
  var _createdDate;
  var _countPages;
  var _cost

  this.id = id;
  this.name = name;
  this.type = type;
  this.author = author;  

  this.getCreatedDate = function() {
      return this.createdDate;
  };
  
  this.setCreatedDate = function(date) {
    if(Date.parse(date) > Date.now())
      throw "DateError";
    this.createdDate = date;
  }

  this.getCountPages = function() {
    return this.countPages;
  }

  this.setCountPages = function(count) {
    if(count <= 10)
      throw "CountPagesError";
    this.countPages = count;
  }

  this.setCost = function(cost) {
    if(cost <= 0)
      throw "CostError";
    this.cost = cost;
  }

  this.getCost = function() {
    return this.cost;
  }
}

function Audiobook(id, name, type, author, typeDisk, countDisk) {
  Book.call(this, id, name, type, author);

  this.typeDisk = typeDisk;
  this.countDisk = countDisk;
}

Audiobook.prototype = Object.create(Book.prototype);

function Textbook(id, name, type, author, typeScience, typeInstitution) {
  Book.call(this, id, name, type, author);

  this.typeScience = typeScience;
  this.typeInstitution = typeInstitution;
}

Textbook.prototype = Object.create(Book.prototype);

// HtmlHelper

function HtmlHelper() {
  this.baseUrl = 'http://localhost:3000';
}

HtmlHelper.prototype.get = function (url, query, successClb, faliedClb) {
  var xhr = new XMLHttpRequest();
  var fullUrl = this.baseUrl + url;
  xhr.open('GET', fullUrl);
  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4) return;

    if(xhr.status == 200) {
      successClb(JSON.parse(xhr.responseText));
    } else {
      faliedClb();
    }
  }
  xhr.send();
}

HtmlHelper.prototype.post = function(url, body, successClb, faliedClb) {
  var xhr = new XMLHttpRequest();
  var fullUrl = this.baseUrl + url;
  xhr.open('POST', fullUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4) return;

    if(xhr.status == 201) {
      successClb();
    } else {
      faliedClb();
    }
  }
  xhr.send(body);
}

HtmlHelper.prototype.put = function(url, id, body, successClb, faliedClb) {
  var xhr = new XMLHttpRequest();
  var fullUrl = this.baseUrl + url + '/' + id;
  xhr.open('PUT', fullUrl);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4) return;

    if(xhr.status == 200) {
      successClb();
    } else {
      faliedClb();
    }
  }
  xhr.send(body);
}

HtmlHelper.prototype.delete = function(url, id, successClb, faliedClb) {
  var xhr = new XMLHttpRequest();
  var fullUrl = this.baseUrl + url + "/" + id;
  xhr.open('DELETE', fullUrl);
  xhr.onreadystatechange = function() {
    if(xhr.readyState != 4) return;

    if(xhr.status == 200) {
      successClb();
    } else {
      faliedClb();
    }
  }
  xhr.send();
}

// ParseObjects

function parseJsonToBook(element) {
  var book = {};
  var author = new Author(element.author.firstname, element.author.lastname);
  if(element.type == 'Audiobook') {
    book = new Audiobook(element.id, element.name, element.type, author, element.typeDisk,
        element.countDisk);
  } else if(element.type == 'Textbook') {
    book = new Textbook(element.id, element.name, element.type, author, element.typeScience,
      element.typeInstitution);
  } else if(element.type == "Book") {
    book = new Book(element.id, element.name, element.type, author);
  }
  book.setCreatedDate(element.createdDate);
  book.setCountPages(element.countPages);
  book.setCost(element.cost);
  return book;
}

// WorkingWithPage

function createTable(data) {
  for (var item in data) {
    if (data.hasOwnProperty(item)) {
      var book = parseJsonToBook(data[item]);
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", book.id);
      tr.onclick = function() {
        document.location = "info.html?id=" + this.getAttribute("data-id");
      }
      tr.id = "Book" + book.id;
      var values = [book.id, book.name, book.type, book.author.toString(), book.getCreatedDate(),
         book.getCountPages(), book.getCost()];
      for (var i = 0; i < values.length; i++) {
        var td = document.createElement("td");
        var text = document.createTextNode(values[i]);
        td.appendChild(text);
        tr.appendChild(td);
      }
      var td = document.createElement("td");
      var editLink = document.createElement("a");
      editLink.href = 'edit.html?id=' + book.id;
      var text = document.createTextNode("Edit ");
      editLink.appendChild(text);      
      td.appendChild(editLink); 
      var deleteLink = document.createElement("a");
      deleteLink.setAttribute("data-id", book.id);
      var textDelete = document.createTextNode(" Delete");      
      deleteLink.onclick = function(ev) {
        var result = confirm("Are you sure?")
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
  var book = {};
  var bookType = document.getElementById("type").value;  
  var data = {
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
  book.setCreatedDate(data.createdDate);
  book.setCountPages(data.countPages);
  book.setCost(data.cost);
  return JSON.stringify(book);
}

function postBook() {
  try {
    var book = getJsonBookFromField();
    var htmlHelper = new HtmlHelper();
    htmlHelper.post("/books", book, function() {
      alert("Success");
      document.location = "create.html";
    }, function() {alert("Error");});
  }
  catch(ex) {
    switch (ex) {
      case "DateError":
        showErrorMessage("createdDate-error", false, "Date must be less than now");
        break;
        case "CostError":
        showErrorMessage("cost-error", false, "Cost must more than 10");
        break;
        case "CountPagesError":
        showErrorMessage("countPages-error", false, "Count pages must more than 0");
        break; 
    }
  }
}

function putBook() {
  try {
    var book = getJsonBookFromField();
    var htmlHelper = new HtmlHelper();
    var url = new URL(document.location.href);
    var id = url.searchParams.get("id");
    htmlHelper.put("/books", id, book, function() {alert("Success");}, function() {alert("Error");});
  }
  catch(ex) {
    switch (ex) {
      case "DateError":
        showErrorMessage("createdDate-error", false, "Date must be less than now");
        break;
        case "CostError":
        showErrorMessage("cost-error", false, "Cost must more than 10");
        break;
        case "CountPagesError":
        showErrorMessage("countPages-error", false, "Count pages must more than 0");
        break; 
    }
  }
}

function deleteBook(id) {
  var htmlHelper = new HtmlHelper();
  htmlHelper.delete("/books", id, function() {
    document.getElementById("Book"+id).remove();
    alert("Success");    
  }, function() {alert("Error");});  
}

function loadInfoCurrentBook() {
  var htmlHelper = new HtmlHelper();
  var url = new URL(document.location.href);
  var id = url.searchParams.get("id");
  htmlHelper.get("/books/"+id, "", fillInfoFields, function() {alert("Error");});
}

function fillInfoFields(data) {
  var book = parseJsonToBook(data);
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
  var htmlHelper = new HtmlHelper();
  var url = new URL(document.location.href);
  var id = url.searchParams.get("id");
  htmlHelper.get("/books/"+id, "", fillFormFields, function() {alert("Error");});
}

function fillFormFields(data) {
  var book = parseJsonToBook(data);
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
  var htmlHelper = new HtmlHelper();
  htmlHelper.get('/books', "", createTable, null);
}

//Validation

function setValidation() {
  document.getElementById("name").addEventListener("invalid", function() {showErrorMessage("name-error", false);});
  document.getElementById("firstname").addEventListener("invalid", function() {showErrorMessage("firstname-error", false);});
  document.getElementById("lastname").addEventListener("invalid", function() {showErrorMessage("lastname-error", false);});
  document.getElementById("countPages").addEventListener("invalid", function() {showErrorMessage("countPages-error", false, "Please, enter date");});
  document.getElementById("cost").addEventListener("invalid", function() {showErrorMessage("cost-error", false, "Please, enter field(only numbers, >= 10)");});
  document.getElementById("createdDate").addEventListener("invalid", function() {showErrorMessage("createdDate-error", false, "Please, enter field(only numbers)");});
}

function showErrorMessage(idElement, isHidden, message) {
  document.getElementById(idElement).hidden = isHidden;
  if(message != undefined)
    document.getElementById(idElement).innerText = message;
}

function hideErrorMessages()
{
  var idElementErrors = ["name-error", "firstname-error", "lastname-error", "countPages-error", "cost-error", "createdDate-error"];
  idElementErrors.forEach(function (elem) {
    showErrorMessage(elem, true);
  })
}