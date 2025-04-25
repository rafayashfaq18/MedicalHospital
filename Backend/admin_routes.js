//Importing packages
const router = require('express').Router();

//Importing files
const {Users, Appointments} = require('./schemas');
const {verify_token} = require('./login');
const {require_admin} = require('./admin');

//Verifying route access
router.use(verify_token,require_admin);

//Implementing controllers
//1: Get users
router.get('/users',async(req,res)=>{
    try{
        //Establishing filter
        const filter = {}
        if(req.query.role){
          filter.role = req.query.role;
        }
        if(req.query.status){
          filter.status = req.query.status;
        }

        //Retrieving Users
        const users = await Users.find(filter).select('-password')
        res.json(users);
    }
    catch(err){
        res.status(500).json({message: 'Error in getting users: ',err});
    }
})

//2: Approve users
router.put('/users/:id/approve', async (req, res)=>{
  try{
    //Finding Users
    const user = await Users.findById(req.params.id)    
    
    //Validation
    if(!user){
      return res.status(404).json({ message: 'User not found.'});
    }
    else if(user.status === 'Approved'){
      return res.status(400).json({message: 'User is already approved.'})
    }
    else if(user.role == 'Admin'){
      return res.status(400).json({message: 'You cannot approve or block other admins.'})
    }
    
    //User update
    user.status = 'Approved';
    await user.save();
    res.json({message: 'User approved: ', user});
  }
  catch(err){
    res.status(500).json({ message: 'Error in approving users: ',err});
  }
})

//3: Block users
router.put('/users/:id/block', async (req, res)=>{
  try{
    //Finding Users
    const user = await Users.findById(req.params.id)
    
    //Validation
    if(!user){
      return res.status(404).json({ message: 'User not found: '});
    }
    else if(user.status === 'Blocked'){
      return res.status(400).json({message: 'User is already blocked.'})
    }
    else if(user.role == 'Admin'){
      return res.status(400).json({message: 'You cannot approve or block other admins.'})
    }

    //User update
    user.status = 'Blocked';
    await user.save();
    res.json({message: 'User blocked: ', user});
  }
  catch(err){
    res.status(500).json({ message: 'Error in blocking users: ',err});
  }
})

//4: Viewing appointments
router.get('/appointments',async(req,res)=>{
  try{
      //Get variables from req
      const {patientID, doctorID, status, start_date, end_date} = req.query;

      //Establishing filter
      const filter = {}
      if(patientID){
        filter.patientID = patientID;
      }
      if(doctorID){
        filter.doctorID = doctorID;
      }
      if(status){
        filter.status = status;
      }
      if(start_date||end_date){
        filter.date = {}
        if(start_date){
          filter.date.$gte = new Date(start_date);
        }
        if(end_date){
          filter.date.$lte = new Date(end_date);
        }
      }

      //Getting appointments
      const appointments = await Appointments.find(filter).populate('patientID','name').populate('doctorID','name');
      res.json(appointments);
  }
  catch(err){
      res.status(500).json({message: 'Error in getting appointments: ',err});
  }
})

module.exports = router;
