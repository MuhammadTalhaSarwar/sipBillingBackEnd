const express=require('express');
const bodyparser=require('body-parser');
const { mongoose }=require('./db.js');
var employeeCont=require('./controllers/Empl_cont.js');
var usersCont=require('./controllers/Users_cont.js');
var rolesCont=require('./controllers/Roles_cont.js');
var customerIdCont=require('./controllers/CustomerId_cont.js');
var Dashboardcont=require('./controllers/dashboard_cont.js');
var TarrifCont=require('./controllers/Tarrif_cont.js');
var SimsCont=require('./controllers/Sims_cont.js');
var reportsCont=require('./controllers/reports.js');
var downloadLogsCont=require('./controllers/downloadLogs_cont.js');
const helmet=require('helmet');
const cors=require('cors');
const nocache=require('nocache');
const url="/fixedvoiceapi";
var app=express();
app.use(nocache())
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cors({origin:'*'}));
app.listen(8000,'0.0.0.0',()=>console.log('Server Started At port 8000'));
app.use(url+'/employee',employeeCont);
app.use(url+'/users',usersCont);
app.use(url+'/roles',rolesCont);
app.use(url+'/cids',customerIdCont);
app.use(url+'/tarrif',TarrifCont);
app.use(url+'/sims',SimsCont);
app.use(url+'/admin_dash',Dashboardcont);
app.use(url+'/reports',reportsCont);
app.use(url+'/downloadLogs',downloadLogsCont);
