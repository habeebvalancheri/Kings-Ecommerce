const categoryDB = require('../model/categorySchema');
const productDB = require("../model/productSchema");
const userDB = require("../model/userSchema");
const orderDB = require('../model/orderSchema');
const couponDB = require('../model/couponSchema');
const offerDB = require('../model/offerSchema');
//  Admin Login Render
exports.adminLoginPage = (req, res) => {
  try{
    return res.render('adminLogin',{
      adminPassword:process.env.Admin_PASS,
      adminEmail:process.env.Admin_EMAIL,
      userPassword : req.body.password,
      userEmail : req.body.email,
      emailEmpty : req.session.emailEmpty,
      passwordEmpty :req.session.passwordEmpty,
      passNotValid : req.session.passNotValid,
      emailNotValid : req.session.emailNotValid,
    });
  }catch(error){
console.log(error)
return res.status(500).send("Server Error");
  }

};

//  Admin Dashboard Page Render
exports.adminDashboardPage = async (req, res) => {
  try {
    // Fetch the count of users from the database
    const userCount = await userDB.countDocuments();
    const orderCount = await orderDB.countDocuments();

    const orders = await orderDB.find({}); // Retrieve all orders
    let totalSalesCount = 0;

    // Iterate through each order and sum up the quantities
    orders.forEach(order => {
      order.products.forEach(product => {
        totalSalesCount += product.quantity;
      });
    });

    // Render the adminDashboard page with the userCount
    return res.render("adminDashboard", { userCount,orderCount ,totalSalesCount });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

//  Admin Product Page Render
exports.adminProductsPage = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 7;

    const offset = (page-1)* size;
    const limit = size;

    const products = await productDB.find({ active: true }).populate('category')
    .skip(offset)
    .limit(limit);

    const totalProducts = await productDB.countDocuments({active:true})

    const totalPages = Math.ceil(totalProducts / size);

    console.log(products,"p");

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    
    //  Pass success message to the view and clear it from session
    return res.render('adminProducts', {
      products: products,
      success: successMessage,
      page:page,
      totalProducts:totalProducts,
      totalPages:totalPages,
      limit:limit,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send('Server Error');
  }
};

//  Admin Add Product Page Render
exports.addProductsPage = async (req, res) => {
  try {

    const data = await categoryDB.find({active:true});
    const pNameRegexerror = req.session.pNameRegexerror;
    const descriptionRegexerror = req.session.descriptionRegexerror;
    const priceRegexerror = req.session.priceRegexerror;
    const stockRegexerror = req.session.stockRegexerror;
    const discountRegexerror = req.session.discountRegexerror;
    const categoryError = req.session.categoryError;
    const imageError = req.session.imageError;

    // Clear session errors after rendering
    req.session.pNameRegexerror = "";
    req.session.descriptionRegexerror = "";
    req.session.priceRegexerror = "";
    req.session.stockRegexerror = "";
    req.session.discountRegexerror = "";
    req.session.categoryError = "";
    req.session.imageError = "";

    return res.render('addProducts', { 
    data : data,
    pNameRegexerror,
    descriptionRegexerror,
    priceRegexerror,
    stockRegexerror,
    discountRegexerror,
    categoryError,
    imageError,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//  Admin Update Product Page Render
exports.updateProductsPage = async (req, res) => {
  try {
    
    const id = req.query.id;
  
    const products = await productDB.findById({_id:id});
    const pImages = products.pImages;

    const data = await categoryDB.find({ active: true });

     // Read the session error messages
     const imageError2 = req.session.imageError2;
    // Read the session error messages
    const pNameRegexerror2 = req.session.pNameRegexerror2;
    const descriptionRegexerror2 = req.session.descriptionRegexerror2;
    const priceRegexerror2 = req.session.priceRegexerror2;
    const stockRegexerror2 = req.session.stockRegexerror2;
    const discountRegexerror2 = req.session.discountRegexerror2;
    const categoryError2 = req.session.categoryError2;
    const generalError = req.session.generalError;

      // Clear session error messages
      req.session.pNameRegexerror2 = "";
      req.session.descriptionRegexerror2 = "";
      req.session.priceRegexerror2 = "";
      req.session.stockRegexerror2 = "";
      req.session.discountRegexerror2 = "";
      req.session.categoryError2 = "";
      req.session.generalError = "";
        // Clear the session error message after reading
        req.session.imageError2 = "";

    return res.render("updateProducts", { 
      id:id,
      images:pImages,
      imageError2,
      products : products, 
      data : data ,
      pNameRegexerror2,
      descriptionRegexerror2,
      priceRegexerror2,
      stockRegexerror2,
      discountRegexerror2,
      categoryError2,
      generalError,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};


//  Admin Unlist Product Page Render
exports.unlistedProductPage = async (req, res) => {
  try {
    const data = await productDB.find({ active: false }).populate('category');

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    const errorMessage = req.query.error;

    return res.render('unlistedProducts', {
       data,
       success :successMessage,
      error :errorMessage,
       });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};



//  Admin Orders Page Render
exports.adminOrdersPage = async (req, res) => {
  try{
    // Fetch orderId and productId from query parameters
    const { productId, orderId } = req.query;

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 7;

    const offset = (page - 1) * size;
    const limit = size;
    // Log the received orderId and productId for debugging
    console.log(`OrderId: ${orderId}, ProductId: ${productId}`);
    const userId = req.session.userId
    const orders = await orderDB.find()
    .populate('user')
    .populate('products.productId')
    .skip(offset)
    .limit(limit)
    .sort({ orderDate: -1 })

    const totalOrders = await orderDB.countDocuments()

    const totalPages = Math.ceil(totalOrders /size);

    console.log(orders,"oer")
    return res.render("adminOrders",{
      orders:orders,
      totalPages:totalPages,
      page:page,
      limit:limit,
    });
  }catch(error){
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

//  Admin Orders details Page Render
exports.adminOrderDetailsPage = async (req, res) => {
  try{
    // Fetch orderId and productId from query parameters
    const { productId, orderId ,userId} = req.query;

    // Log the received orderId and productId for debugging
    console.log(`OrderId: ${orderId}, ProductId: ${productId}`);
    let orderDetails = await orderDB.find({_id:orderId}).populate('products.productId')
    const user = await userDB.find({_id:userId})
    console.log(user,"user")
    const product = orderDetails[0].products.filter((value)=>value.productId._id==productId);
    console.log(orderDetails,"hi");
    return res.render("adminOrderDetails",{
      orderDetails:orderDetails[0],
      user:user[0],
      product:product[0]
    });
  }catch(error){
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.adminOrderChangePage = async (req,res) =>{
  try{
    
    const {orderId,productId} = req.query;
    console.log(productId,"pid")
    const order = await orderDB.findOne({_id:orderId})
    .populate('products.productId')
    console.log(order)
        // Find the product in the order with the provided productId
        const productStatus = order.products.find(item => {
          console.log(item)
          return item.productId._id.toString() === productId
        });

        // Check if the product exists in the order
        if (!productStatus) {
            return res.status(404).send("Product not found in the order");
        }

        // Get the status of the specific product
        const status = productStatus.status;
        const orderReturn = productStatus.return;

  console.log(order)
  console.log(status,"status")
return res.render("adminOrderChange",{
 order,
 status,
 productId,
 orderReturn,
})
  }catch(error){
    console.error(error);
    return res.status(500).send("Server error")
  }
}
//  Admin Users Page Render
exports.adminUsersPage = async (req, res) => {
  try {

    // Retrieve the page and size parameters from the query string
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const size = parseInt(req.query.size) || 5; // Page size, default is 10

    // Calculate the offset and limit for pagination
const offset = (page - 1) * size;
const limit = size;
    
    const users = await userDB.find()
    .sort({ _id: -1 })
    .skip(offset)
    .limit(limit);

     // Count the total number of orders for the user
     const totalUsers = await userDB.countDocuments();

     // Calculate the total number of pages
 const totalPages = Math.ceil(totalUsers / size);

    return res.render("adminUsers", { users,
      page:page,
      limit:limit,
      totalPages:totalPages,
    });
  } catch (error) {
    console.error("Invalid Users");
    return res.status(500).send("Server Error");
  }
}

  //  Admin Categorys Page Render
  exports.adminCategorysPage = async (req, res) => {
    try {
      const category = await categoryDB.find({ active: true });
      console.log(category);

      // Get success and error messages from query parameters
      const successMessage = req.query.success;
      const errorMessage = req.query.error;
      
      return res.render("adminCategory", {  
        category : category,
        success :successMessage,
      error :errorMessage,
    });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  };

//  Add Category Page Render
exports.addCategoryPage = async (req, res) => {
  try {

   const emptyName = req.session.emptyName;
   const duplicate = req.session.duplicate;
     // Get success and error messages from query parameters
     const successMessage = req.query.success;
     const errorMessage = req.query.error;

     req.session.emptyName ="";
     req.session.duplicate ="";

    return res.render("addCategory",{
      emptyName,
      duplicate,
      categoryPattern : req.session.categoryPattern, 
      success :successMessage,
      error :errorMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

//  Unlisted Category Page
exports.unlistedCategoryPage = async (req, res) => {
  try {
    const data = await categoryDB.find({ active: false });

     // Get success and error messages from query parameters
     const successMessage = req.query.success;
     const errorMessage = req.query.error;

    return res.render("unlistedCategory", { 
      category: data,
      success :successMessage,
      error :errorMessage,
     });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
},
//  Admin Coupons Page Render
exports.adminCouponsPage = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const offset = (page - 1) * limit;

    const coupons = await couponDB.find({active:true,expired:false})
    .skip(offset)
    .limit(limit);
    
    const totalOrders = await orderDB.countDocuments({
    })

    const totalPages = Math.ceil(totalOrders /limit);
    
    
  return  res.render("adminCoupon",{
      coupons,
      totalPages:totalPages,
      page:page,
      limit:limit,
    });
  }catch(error){
    console.error(error);
  return res.status(500).send("Server error")
  }
};

//  Add Coupons Page Render
exports.addCouponPage = async (req, res) => {
  try{
    const couponCodeError = req.session.couponCodeError;
    const couponCodeRegex = req.session.couponCodeRegex;
    const discountError = req.session.discountError;
    const discountRegex = req.session.discountRegex;
    const validFromError = req.session.validFromError;
    const validToError = req.session.validToError;


    req.session.couponCodeError = '';
    req.session.couponCodeRegex = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.validFromError = "";
    req.session.validToError = "";


   return res.render("addCoupon",{
      couponCodeError,
      couponCodeRegex,
      discountError,
      discountRegex,
      validFromError,
      validToError
    });
  }catch(error){
    console.error(error);
  return res.status(500).send("Server error")
  }
};

exports.deleteCouponPage = async (req,res)=>{
  try{

    const page = parseInt(req.query.page) || 1;
    const limit =  10;

    const offset = (page - 1) * limit;

    const unlistedCoupons = await couponDB.find({active:false,expired:true})
    .skip(offset)
    .limit(limit);

    const totalOrders = await orderDB.countDocuments()

    const totalPages = Math.ceil(totalOrders /limit);

    return res.render("deleteCoupon",{
      unlistedCoupons,
      totalPages:totalPages,
      page:page,
      limit:limit,
    })
  }catch(error){
    console.error(error);
   return res.status(500).send("Server Error");
  }
}

//  Admin offer Page Render
exports.adminOfferPage = async (req, res) => {
  try{

    const offer = await offerDB.find({active:true});
   return res.render("adminOffer",{
    offer
   });
  }catch(error){
    console.error(error);
   return res.status(500).send("Server error");
  }
 
};

//  Add offer Page Render
exports.addOfferPage = async (req, res) => {
  try{

     const categoryCodeError = req.session.categoryCodeError 
     const categoryRegex = req.session.categotyCodeRegex 
     const discountError = req.session.discountError 
     const discountRegex = req.session.discountRegex 
     const validationFrom = req.session.validFromError
     const validationTo = req.session.validToError
     const categoryMatch = req.session.categoryCodeNotMatch;
   
     // Clear the message after fetching it
     req.session.categoryCodeError = "";
     req.session.categotyCodeRegex = "";
     req.session.discountError = "";
     req.session.discountRegex = "";
     req.session.validFromError = "";
     req.session.validToError = "";
     req.session.categoryCodeNotMatch  = "";
    
   return res.render("addOffer",{
    categoryCodeError,
    categoryRegex,
    discountError,
    discountRegex,
    validationFrom,
    validationTo,
    categoryMatch,
   });

  }catch(error){
    console.error(error);
   return res.status(500).send("Server error");
  }
 
};


//  delete offer Page Render
exports.deleteOfferPage = async (req, res) => {
  try{
   return res.render("deleteOffer");
  }catch(error){
    console.error(error);
   return res.status(500).send("Server error");
  }
 
};



//  Admin Logout Render
exports.adminLogout = (req, res) => {
  req.session.adminLoggedIn = false;
 return res.render("adminLogin",{
    emailEmpty : req.session.emailEmpty,
      passwordEmpty :req.session.passwordEmpty,
      passNotValid : req.session.passNotValid,
      emailNotValid : req.session.emailNotValid,
  });
};
