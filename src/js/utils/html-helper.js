export default class HtmlHelper {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }  

  async get(url, query) {    
    let fullUrl = this.baseUrl + url + (query ? query : "");    
    return await this.request(fullUrl, 'GET', null);
  }

  async post(url, body) {    
    let fullUrl = this.baseUrl + url;
    return await this.request(fullUrl, 'POST', body);
  }

  async put(url, id, body) {    
    let fullUrl = this.baseUrl + url + '/' + id;
    return await this.request(fullUrl, 'PUT', body);    
  }

  async delete(url, id) {    
    let fullUrl = this.baseUrl + url + "/" + id;
    return await this.request(fullUrl, 'DELETE', null);
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