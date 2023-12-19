const jwt = require('jsonwebtoken');
const jwtSecret = 'this is a secret phrase' //colocar o mesmo valor da variavel de ambiente JWT_SECRET
const userData = {
  "nickname": "Mitchell",
  "intra_login": "Kyle",
  "status": "online",
};// nickname e intra_login devem obrigatoriamente existir no seu banco de dados local!
const token = jwt.sign(userData,jwtSecret,{algorithm:"HS256"})
console.log(token);