import ValidationError from '../errors/validation-error';

export default class Book {
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