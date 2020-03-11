const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Sip_Billing',(err)=>{
  if(err)
  {
    console.log('Error Connecting MOngoDb' +JSON.stringify(err,undefined,2));
  }
  else {
    console.log('Connection Established');
  }
});


module.exports=mongoose;
