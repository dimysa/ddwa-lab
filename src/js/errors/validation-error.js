export default class ValidationError extends Error {
  constructor(fieldName, message) {
    super(message);
    this.fieldName = fieldName;    
  }
}