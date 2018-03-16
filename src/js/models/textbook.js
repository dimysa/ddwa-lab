import Book from './book';

export default class Textbook extends Book {
  constructor(id, name, type, author, typeScience = "", typeInstitution = "") {
    super(id, name, type, author);
    this.typeScience = typeScience;
    this.typeInstitution = typeInstitution;
  }
}