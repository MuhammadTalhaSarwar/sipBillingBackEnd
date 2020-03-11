const mongoose = require('mongoose');
const bcrypt =require('bcryptjs');
var customer_idSchema=new mongoose.Schema({
  customer_id:{type:String},
  company_id:{type:String},
  company_name:{type:String}
});
mongoose.model('CustomerId',customer_idSchema);
module.exports = mongoose.model('CustomerId');
