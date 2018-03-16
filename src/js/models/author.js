export default class Author {
  constructor(firstname, lastname) {
    this.firstname = firstname;
    this.lastname = lastname;
  }

  toString() {
    return `${this.firstname} ${this.lastname}`;
  }
}