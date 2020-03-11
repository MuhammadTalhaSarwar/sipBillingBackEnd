const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');
var tarrifSchema=new mongoose.Schema({
tarrif_name:{type:String,required:true,unique:true, validate: {
                     validator: function(v) {
                         var re = new RegExp("^([a-z A-Z 0-9]+)$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid Tarrif Name Format.'
                 }},
tarrif_type:{type:String,required:true,validate: {
                     validator: function(v) {
                         var re = new RegExp("^([a-z A-Z])+$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid Tarrif Type Format.'
                 }},
pulse:{type:String,required:true,validate: {
                     validator: function(v) {
                         var re = new RegExp("^([0-9]*\.?[0-9]+)$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid Pulse Format.'
                 }},
on_net:{type:String,required:true,validate: {
                     validator: function(v) {
                         var re = new RegExp("^([0-9]*\.?[0-9]+)$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid On Net Format.'
                 }},
off_net:{type:String,required:true,validate: {
                     validator: function(v) {
                         var re = new RegExp("^([0-9]*\.?[0-9]+)$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid Off Net Format.'
                 }},
line_rent:{type:String,required:true,validate: {
                     validator: function(v) {
                         var re = new RegExp("^([0-9]*\.?[0-9]+)$");
                         return (v == null || v.trim().length < 1) || re.test(v)
                     },
                     message: 'Invalid Line rent Format.'
                 }},
freeAllowance:{type:String,required:true},
added_by:{type:String},
added_on:{type:Date},
modified_by:{type:String},
modified_on:{type:Date}
});
tarrifSchema.plugin(uniqueValidator);
mongoose.model('Tarrif',tarrifSchema);
module.exports = mongoose.model('Tarrif');
