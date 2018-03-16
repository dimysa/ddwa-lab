import Book from './book';

export default class Audiobook extends Book {
  constructor(id, name, type, author, typeDisk = "CD", countDisk = 1) {
    super(id, name, type, author);
    this.typeDisk = typeDisk;
    this.countDisk = countDisk;
  }
}