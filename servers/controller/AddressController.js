const addressDB = require("../model/addressSchema");
const userDB = require("../model/userSchema");

module.exports = {
  address : async(req,res)=>{
    try{
// clear session
req.session.errorfullName = "";
req.session.minFullName = "";
req.session.errorAddress = "";
req.session.addressRegexError = "";
req.session.errorCity = "";
req.session.cityRegex = "";
req.session.errorState = "";
req.session.stateRegex = "";
req.session.errorZipCode = "";
req.session.zipCodeRegex = "";
req.session.errorCountry = "";
req.session.countryRegex = "";
req.session.errorHouseNo  = '';
 req.session.houseNoRegex = '';
 req.session.errorMobile  = '';
 req.session.mobileRegex = '';
console.log("error sessions")
// Remove white space 
const fullName = req.body.fullName.trim();
const address = req.body.address.trim();
const city = req.body.city.trim();
const state = req.body.state.trim();
const zipCode = req.body.zipCode.trim();
const country = req.body.country.trim();
const houseNo = req.body.houseNo.trim()
const mobile = req.body.mobile.trim();

console.log("whitespace")
// check if fullName field is empty
if (!fullName) {
req.session.errorfullName = "Name is required!";
console.log("fullname")
}  

// check if name have 3 to 20 characters
// Regular expression to allow only characters
const nameRegex = /^[A-Za-z\s]+$/;

if (!(nameRegex.test(fullName) && fullName.length >= 3 && fullName.length <= 30)) {
req.session.minFullName =
"Name should be between 3 and 30 characters and contain only letters!";
console.log("full name lenght")
}

// check if address field is empty
if(!address){
req.session.errorAddress = "Address is required!";
console.log("address")
}

// Address Regular Expression
const addressRegex = /^[A-Za-z0-9\s.,()-]+$/;

// Example usage within validation logic
if (!addressRegex.test(address)) {
    req.session.addressRegexError = "Only letters, numbers, spaces, and .,()- characters are allowed in the address.";
    console.log("Address regex error");
}


// check if city field is empty
if(!city){
req.session.errorCity = "city is required!"
console.log("address")
}

// city Regeular expression
const cityRegex = /^[A-Za-z]+$/;

if(!(cityRegex).test(city)){
req.session.cityRegex = "city Field should only contain characters";
console.log("city regex")
}

if(!houseNo){
  req.session.errorHouseNo = "House number is required"
  console.log("houseno")
}

const houseNoRegex = /^[a-zA-Z0-9/\\-]+$/;
if(!(houseNoRegex).test(houseNo)){
  req.session.houseNoRegex = "wrong house no pattern"
}

// check if state field is empty
if(!state){
req.session.errorState = "state is required!"
console.log("state")
}

// state Regeular expression
const stateRegex = /^[A-Za-z]+$/;

if(!(stateRegex).test(state)){
req.session.stateRegex = "state Field should only contain characters";
console.log("state regex")
}

// check if zipCode field is empty
if(!zipCode){
req.session.errorZipCode = "zipcode is required!"
console.log("zipcode")
}

// zipCode Regeular expression
const zipCodeRegex = /^[0-9]+$/;

if(!(zipCodeRegex).test(zipCode)){
req.session.zipCodeRegex = "postalcode Field should only contain numbers";
console.log("zipcode regex")
}


// check if country is field empty
if(!country){
req.session.errorCountry = "country is required!"
console.log("country")
}

// country Regeular expression
const countryRegex = /^[A-Za-z]+$/;

if(!(countryRegex).test(country)){
req.session.countryRegex = "country Field should only contain characters";
console.log("country regex")
}

if(!mobile){
  req.session.errorMobile = "mobile is required"
  console.log("mobile")
}

const mobileRegex = /^\d{10,}$/;

if(!(mobileRegex).test(mobile)){
  req.session.mobileRegex = "Mobile field should only contain numbers"
}


if(req.session.errorfullName ||
 req.session.minFullName  ||
 req.session.errorAddress ||
 req.session.addressRegexError ||
 req.session.errorCity ||
 req.session.cityRegex ||
 req.session.errorState ||
 req.session.stateRegex ||
 req.session.errorZipCode ||
 req.session.zipCodeRegex ||
 req.session.errorCountry ||
 req.session.countryRegex ||
 req.session.errorHouseNo ||
 req.session.houseNoRegex ||
 req.session.errorMobile  ||
 req.session.mobileRegex
 ){
  console.log("all error");
 return res.redirect("/address");
 }

 console.log("hi")
// check user Exists
 const existingUser = await userDB.findOne({ email: req.session.email });

 if (!existingUser) {
  return res.status(404).send("User not found");
}
console.log("hello")

console.log("Querying for existing address with data:", {
  name: fullName,
  address: address,
  city: city,
  state: state,
  zipCode: zipCode,
  country: country
});
   // Check if the address already exists in the database
   const existingAddress = await addressDB.findOne({
    name: fullName,
    address: address,
    city: city,
    houseNo : houseNo,
    state: state,
    zipCode: zipCode,
    country: country,
    mobile:mobile,
  });
console.log("wow")
console.log(existingAddress,"existing add");
  if (existingAddress) {
    req.session.errorAddressExists = "Address already exists!";
    return res.redirect("/address");
  }
  console.log("wi")
  let newAddress;
  const addressExists = await addressDB.find({})
  console.log("es")
  if(addressExists.length > 0){
     newAddress = new addressDB({
      name : fullName,
      address : address,
      city : city,
      houseNo : houseNo,
      state : state,
      zipCode : zipCode,
      country : country,
      mobile:mobile,
     })
     await newAddress.save();
     console.log("no addresses")
  }else{
     newAddress = new addressDB({
      name : fullName,
      address : address,
      city : city,
      houseNo : houseNo,
      state : state,
      zipCode : zipCode,
      country : country,
      mobile:mobile,
      default : true,
     })
     console.log("first address")
     await newAddress.save();
  }
  
 
 console.log(newAddress)
 existingUser.addresses.push(newAddress._id);
 await existingUser.save();
 console.log("address saved")
 return res.redirect("/account-details")
    }catch(error){
      res.status(400).send("Something wrong")
    }
  },
  updateAddress : async(req,res)=>{
    try{

      req.session.errorfullName = "";
req.session.minFullName = "";
req.session.errorAddress = "";
req.session.addressRegex = "";
req.session.errorCity = "";
req.session.cityRegex = "";
req.session.errorState = "";
req.session.stateRegex = "";
req.session.errorZipCode = "";
req.session.zipCodeRegex = "";
req.session.errorCountry = "";
req.session.countryRegex = "";
req.session.errorHouseNo  = '';
 req.session.houseNoRegex = '';
 req.session.errorMobile  = '';
 req.session.mobileRegex = '';
console.log("error sessions")
// Remove white space 
const fullName = req.body.fullName.trim();
const address = req.body.address.trim();
const city = req.body.city.trim();
const houseNo = req.body.houseNo.trim();
const state = req.body.state.trim();
const zipCode = req.body.zipCode.trim();
const country = req.body.country.trim();
const mobile = req.body.mobile.trim();
const addressId = req.body.addressId;
console.log(addressId,"addid")
console.log(req.body)
console.log("whitespace")
// check if fullName field is empty
if (!fullName) {
req.session.errorfullName = "Name is required!";
console.log("fullname")
}  

// check if name have 3 to 20 characters
// Regular expression to allow only characters
const nameRegex = /^[A-Za-z\s]+$/;

if (!(nameRegex.test(fullName) && fullName.length >= 3 && fullName.length <= 30)) {
req.session.minFullName =
"Name should be between 3 and 30 characters and contain only letters!";
console.log("full name lenght")
}

// check if address field is empty
if(!address){
req.session.errorAddress = "Address is required!";
console.log("address")
}

// Address Regular Expression
const addressRegex = /^[A-Za-z0-9\s.,()-]+$/;

// Example usage within validation logic
if (!addressRegex.test(address)) {
    req.session.addressRegexError = "Only letters, numbers, spaces, and .,()- characters are allowed in the address.";
    console.log("Address regex error");
}


// check if city field is empty
if(!city){
req.session.errorCity = "city is required!"
console.log("address")
}

// city Regeular expression
const cityRegex = /^[A-Za-z]+$/;

if(!(cityRegex).test(city)){
req.session.cityRegex = "This Field should only contain characters";
console.log("city regex")
}

if(!houseNo){
  req.session.errorHouseNo = "House number is required"
  console.log("houseno")
}

const houseNoRegex = /^[a-zA-Z0-9/\\-]+$/;
if(!(houseNoRegex).test(houseNo)){
  req.session.houseNoRegex = "wrong house no pattern"
}

// check if state field is empty
if(!state){
req.session.errorState = "state is required!"
console.log("state")
}

// state Regeular expression
const stateRegex = /^[A-Za-z]+$/;

if(!(stateRegex).test(state)){
req.session.stateRegex = "This Field should only contain characters";
console.log("state regex")
}

// check if zipCode field is empty
if(!zipCode){
req.session.errorZipCode = "zipcode is required!"
console.log("zipcode")
}

// zipCode Regeular expression
const zipCodeRegex = /^[0-9]+$/;

if(!(zipCodeRegex).test(zipCode)){
req.session.zipCodeRegex = "This Field should only contain numbers";
console.log("zipcode regex")
}


// check if country is field empty
if(!country){
req.session.errorCountry = "country is required!"
console.log("country")
}

// country Regeular expression
const countryRegex = /^[A-Za-z]+$/;

if(!(countryRegex).test(country)){
req.session.countryRegex = "This Field should only contain characters";
console.log("country regex")

}

const mobileRegex = /^\d{10,}$/;

if(!(mobileRegex).test(mobile)){
  req.session.mobileRegex = "Mobile field should only contain numbers"
}

if(req.session.errorfullName ||
 req.session.minFullName  ||
 req.session.errorAddress ||
 req.session.addressRegexError ||
 req.session.errorCity ||
 req.session.cityRegex ||
 req.session.errorState ||
 req.session.stateRegex ||
 req.session.errorZipCode ||
 req.session.zipCodeRegex ||
 req.session.errorCountry ||
 req.session.countryRegex ||
 req.session.errorHouseNo ||
 req.session.houseNoRegex ||
 req.session.errorMobile  ||
 req.session.mobileRegex
 ){
  console.log("all error");
 return res.redirect(`/edit-address?id=${addressId}`);
 }
 console.log("address found")

   // Find and update the address
   const updatedAddress = await addressDB.findOneAndUpdate({_id:addressId}, {
    name: fullName,
    address: address,
    city: city,
    houseNo : houseNo,
    state: state,
    country: country,
    zipCode: zipCode,
    mobile:mobile,
}, { new: true });

console.log(updatedAddress,"update")

// Handle if address is not found
if (!updatedAddress) {
  return res.status(404).send("Address not found");
}

// Redirect or send response as needed
res.redirect("/account-details");
   
    }catch(error){
      console.error(error);
      res.status(500).send("Server error")
    }
  },
  removeAddress : async(req,res)=>{
    try{
  
      const addressId = req.query.id
  
      const removeAddress = await addressDB.deleteOne({_id:addressId})
   // Check if the address was found and deleted successfully
   if (removeAddress.deletedCount === 1) {
    res.status(200).send("Address removed successfully");
  } else {
    // If the address with the given ID doesn't exist
    res.status(404).send("Address not found");
  }
    }catch(error){
      console.error(error);
      res.status(500).send("Server error")
    }
  }
  
}