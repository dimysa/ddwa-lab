const UPDATE_TIME = 60000;
//console.log('WORKER');

function getCountBooks(updateTime = UPDATE_TIME) {
  console.log(`Worker getCountBooks, time: ${updateTime}`);
  if(updateTime != UPDATE_TIME)
    postMessage(`updateTime,${updateTime}`);
  else
    postMessage('updateTime, 0');
  request()
    .then(books => {
      books = books || [];
      postMessage(books.length);
      setTimeout(() => getCountBooks(), updateTime);
    });
}

onmessage = function(e) {
  if(e.data == 'startWorker') {
    getCountBooks();
  } else {
    let updateTime = Number(e.data);        
    let currentUpdateTime = updateTime + UPDATE_TIME - Date.now();
    if(currentUpdateTime < 0)
      currentUpdateTime = UPDATE_TIME;
    getCountBooks(currentUpdateTime);    
  }
}

function request(url = "http://localhost:3000/books", method="GET", body = null) {
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