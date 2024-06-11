const userDB = require("../model/userSchema");
const productDB = require("../model/productSchema");
const categoryDB = require("../model/categorySchema");
const orderDB = require('../model/orderSchema');
const couponDB = require('../model/couponSchema');
const walletDB = require('../model/walletSchema');
const offerDB = require('../model/offerSchema');
const dotenv = require("dotenv");
const excelJs = require('exceljs');
dotenv.config();
const upload = require("../controller/multerSetup");
const multer = require("multer");
const path = require('path'); // Import the path module
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 from the uuid package
const fs = require('fs');



module.exports = {
  adminSignin: async (req, res) => {
    try {
      req.session.emailEmpty = "";
      req.session.passwordEmpty = "";
      req.session.passNotValid = "";
      req.session.emailNotValid = "";
      if (!req.body.email) {
        req.session.emailEmpty = "This field is required";
      }
      if (!req.body.password) {
        req.session.passwordEmpty = "This field is required";
      }
      if (req.body.password !== process.env.Admin_PASS) {
        req.session.passNotValid = "Invalid Password";
      }
      if (req.body.email !== process.env.Admin_EMAIL) {
        req.session.emailNotValid = "Invalid Email";
      }

      console.log(req.body.email,req.body.password,process.env.Admin_EMAIL,process.env.Admin_PASS)
      if (
        req.session.emailEmpty ||
        req.session.passwordEmpty ||
        req.session.passNotValid ||
        req.session.emailNotValid
      ) {
        console.log(req.session.emailEmpty ,req.session.passwordEmpty,req.session.passNotValid,req.session.emailNotValid)
        console.log("error")
        return res.redirect("/adminLogin");
      }

      const { email, password } = req.body;
      console.log("if")
      if (
        email === process.env.Admin_EMAIL &&
        password === process.env.Admin_PASS
      ) {
        req.session.adminLoggedIn = true ;
        console.log("sucess")
        return res.redirect("/admin-Dashboard");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "FAILED",
        message: error.message,
      });
    }
  },

  blockUser: async (req, res) => {
    try {
      const id = req.query.id;

      const user = await userDB.findOne({ _id: id });

      if (user.block === false) {
        await userDB.updateOne({ _id: id }, { $set: { block: true } });
        req.session.userBlocked = true;
        req.session.userLoggedIn = null;
        return res.redirect("/admin-Users");
      } else if (user.block === true) {
        return res.status(400).send("User is already blocked");
      } else {
        return res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  unblockUser: async (req, res) => {
    try {
      const id = req.query.id;
      console.log(typeof id);
      const user = await userDB.findOne({ _id: id });
      console.log("hi");
      console.log(user);

      if (user.block === true) {
        await userDB.updateOne({ _id: id }, { $set: { block: false } });
        return res.redirect("/admin-Users");
      } else if (user.block === false) {
        res.status(400).send("User is already unblocked");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Controller function to add products
addProducts :async (req, res) => {
  try {

    req.session.pNameRegexerror = "";
        req.session.descriptionRegexerror = "";
        req.session.priceRegexerror = "";
        req.session.stockRegexerror  = "";
        req.session.discountRegexerror  = "";
        req.session.categoryError = "";
        req.session.imageError  = "";
      // Destructure incoming data from the request body and set default values if missing

      let { pName = '', description = '', price = '', stock = '', discount = '', category = '' ,image = ""} = req.body;

      // Trim every field to remove leading and trailing whitespace
      pName = pName.trim();
      description = description.trim();
      price = price.trim();
      stock = stock.trim();
      discount = discount.trim();
      category = category.trim();

      // Validate incoming data using regex patterns
      const pNameRegex = /^[a-zA-Z\s]{3,70}$/;
     // Update the description regex to allow the valid characters

      const priceRegex = /^(0|[1-9]\d*)(\.\d+)?$/;
      const stockRegex = /^[1-9]\d*$/;
      const discountRegex =  /^(10|[1-8][0-9]|90)$/; // 10 to 90

      if (!pNameRegex.test(pName)) {
        req.session.pNameRegexerror = 'Product name must be 3-70 letters long and may include spaces.';
    }
    if (description.length < 3 || description.length > 2000) {
        req.session.descriptionRegexerror = 'Description must be 3-2000 characters and may include alphanumeric characters and punctuation.';
    }
    if (!priceRegex.test(price)) {
        req.session.priceRegexerror ='Price must be a valid number, e.g., 10.50 or 100.';
    }
    if (!stockRegex.test(stock)) {
        req.session.stockRegexerror = 'Stock must be an integer greater than 0.';
    }
    if (!discountRegex.test(discount)) {
        req.session.discountRegexerror = 'Discount must be an integer from 10 to 90.';
    }
    if (!category) {
        req.session.categoryError = 'Category cannot be empty.';
    }

    if(image === 0){
      req.session.imageError ="Image cannot be empty"
    }

        // Validate image file(s)
        if (!req.files || req.files.length < 4) {
          req.session.imageError = "Please upload four images .";
      } else {
          // Validate MIME types for images
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif','image/webp'];
          for (const file of req.files) {
              if (!allowedMimeTypes.includes(file.mimetype)) {
                  req.session.imageError = "Invalid image type. Please upload JPEG, PNG, or GIF files only.";
                  break;
              }
          }
      }
  

      // Check the input against the regex patterns
      if (
        req.session.pNameRegexerror ||
        req.session.descriptionRegexerror ||
        req.session.priceRegexerror ||
        req.session.stockRegexerror ||
        req.session.discountRegexerror ||
        req.session.categoryError ||
        req.session.imageError 
      ) {
          return res.redirect("/add-Products?error=Invalid data. Please check your input and try again.");
      }
          
         

          console.log(req.session.errors,"err")
      // Find the category by name and ensure it is active
      const categoryObj = await categoryDB.findOne({ name: category, active: true });
      if (!categoryObj) {
          return res.redirect("/add-Products?error= Invalid Category. Please select an active category.");
      }

         // Process product images
         const productImages = await Promise.all(req.files.map(async (file) => {
          // Resize and crop the image using Sharp
          const buffer = await sharp(file.path)
              .resize({ width: 400, height: 550, fit: 'cover' }) // Resize and crop to 300x300
              .toBuffer();

          // Rename file with a unique name
          const filename = `${uuidv4()}-${Date.now()}.jpg`; // Generate a unique filename
          const filepath = path.join(process.cwd(), 'assets/images', filename);


          // Save the cropped image
          await fs.promises.writeFile(filepath, buffer);

          // Return the filename
          return filename;
      }));

      // Create a new product instance
      const newProduct = new productDB({
          pName,
          description,
          price: parseFloat(price), // Convert to float
          stock: parseInt(stock), // Convert to integer
          discount: parseInt(discount), // Convert to integer
          category: categoryObj._id,
          pImages: productImages,
          categoryStats: true,
      });

      // Save the new product to the database
      await newProduct.save();

      // Redirect to the admin products page with a success message
      return res.redirect("/admin-Products?success=Product added successfully.");
  } catch (error) {
      console.error(error);
      return res.status(500).send("Server error")
  }
},

  updateProducts: async (req, res) => {
    try {
      console.log("hello")
      req.session.pNameRegexerror2 = "";
      req.session.descriptionRegexerror2 = "";
      req.session.priceRegexerror2 = "";
      req.session.stockRegexerror2  = "";
      req.session.discountRegexerror2  = "";
      req.session.categoryError2 = "";
      req.session.generalError = "";
      console.log("session clear")
        // Destructure incoming data from the request body and set default values if missing

        let { pName, description , price , stock , discount , category ,} = req.body;
        console.log("body")
          // Trim every field to remove leading and trailing whitespace
      pName = pName.trim();
      description = description.trim();
      price = price.trim();
      stock = stock.trim();
      discount = discount.trim();
      category = category.trim();
      console.log("trim")
      // Validate incoming data using regex patterns
      const pNameRegex = /^[a-zA-Z\s]{3,70}$/;
      // Update the description regex to allow the valid characters


      const priceRegex = /^(0|[1-9]\d*)(\.\d+)?$/;
      const stockRegex = /^[1-9]\d*$/;
      const discountRegex =  /^(10|[1-8][0-9]|90)$/; // 10 to 90
      console.log("regex")
      if (!pNameRegex.test(pName)) {
        req.session.pNameRegexerror2 = 'Product name must be 3-70 letters long and may include spaces.';
    }
    if (description.length < 3 || description > 2000) {
      req.session.descriptionRegexerror2 = 'Description must be 3-2000 characters and may include alphanumeric characters and punctuation.';
  }
    if (!priceRegex.test(price)) {
        req.session.priceRegexerror2 ='Price must be a valid number, e.g., 10.50 or 100.';
    }
    if (!stockRegex.test(stock)) {
        req.session.stockRegexerror2 = 'Stock must be an integer greater than 0.';
    }
    if (!discountRegex.test(discount)) {
        req.session.discountRegexerror2 = 'Discount must be an integer from 10 to 90.';
    }
    if (!category) {
        req.session.categoryError2 = 'Category cannot be empty.';
    }
    const id = req.body.id;
    const products = await productDB.findById(id)
    console.log("validation")
     // Check the input against the regex patterns
     if (
      req.session.pNameRegexerror2 ||
      req.session.descriptionRegexerror2 ||
      req.session.priceRegexerror2 ||
      req.session.stockRegexerror2 ||
      req.session.discountRegexerror2 ||
      req.session.categoryError2 ||
      req.session.imageError 
    ) {
        return res.redirect(`/update-Product?id=${products._id}`);
    }
    console.log("check complete")
          // Convert price, stock, and discount to numeric types safely
          const priceValue = parseFloat(price);
          const stockValue = parseInt(stock);
          const discountValue = parseInt(discount);
          
          if (isNaN(priceValue) || isNaN(stockValue) || isNaN(discountValue)) {
            req.session.generalError = 'Invalid input data. Please provide valid numeric values for price, stock, and discount.';
            return res.redirect("/update-Product");
          }


    const categoryObj = await categoryDB.findOne({ name: category, active: true });
    if (!categoryObj) {
        return res.redirect("/update-Product");
    }

      const productId = req.body.id;
      console.log(productId,"id")
      await productDB.updateOne(
        { _id: productId },
        {
          $set: {
            pName:pName,
            description:description,
            price: priceValue,
            stock: stockValue,
            discount: discountValue,
            category:categoryObj._id,
          },
        }
      );
      console.log(productDB,"pdb")

      return res.redirect("/admin-Products");
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  },

  imageUploaded: async (req, res) => {
    try {
      const id = req.query.id;

      // Check if the files array exists and contains at least 4 files
    if (!req.files || req.files.length < 4) {
      req.session.imageError2 = "Please upload at least four images.";
      return res.redirect(`/update-Product?id=${id}`);
    }
      const image = req.files.map((file) => file.filename);
      console.log(id)
      console.log(image);
      const updatedImage = await productDB.updateOne(
        { _id: id },
        { $push: { pImages: { $each: image } } }
      );
        console.log(updatedImage)
      return res.redirect(`/update-Product?id=${id}`);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  },
removeImages: async (req, res) => {
    try {
        const filenameToRemove = req.body.filename;
        const id = req.query.id;
      console.log(filenameToRemove,id)
        // Implement the logic to remove the image from the database
        const updatedImage = await productDB.updateOne(
            { _id: id },
            { $pull: { pImages: filenameToRemove } }
        );

        // Check if the update was successful
        if (updatedImage.nModified > 0) {
            res.status(200).json({ success: true, message: 'Image removed successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Image not found or not removed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
},

  unlistProduct: async (req, res) => {
    try {
      const id = req.query.id;

      await productDB.updateMany(
        { category: id },
        { $set: { categoryStats: false } }
      );
      await productDB.updateOne({ _id: id }, { $set: { active: false } });

      return res.redirect("/admin-Products?success=Product unlisted successfully");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },

  restoreProduct: async (req, res) => {
    try {
      const id = req.query.id;

      await productDB.updateMany(
        { category: id },
        { $set: { categoryStats: true } }
      );
      await productDB.findOneAndUpdate({ _id: id }, { $set: { active: true } });
      console.log(id);
      return res.redirect("/unlisted-products?success=Product restored successfully");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },
  adminChangeOrder: async (req, res) => {
    try {
        const { orderId, productId, status } = req.body;

        // Fetch the order from the database using orderId
        const order = await orderDB.findOne({ _id: orderId });
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Find the product within the order's products array
        const productToChange = order.products.find(item => item.productId.toString() === productId);

        if (!productToChange) {
            return res.status(404).json({ success: false, message: 'Product not found in order' });
        }

          // Prevent updating the status if the product is already Delivered
          if (productToChange.status === 'Delivered') {
            return res.json({ success: false, message: 'Product is already Delivered and cannot be updated' });
        }

        // Prevent updating the status if the product is already cancelled
        if (productToChange.status === 'Cancelled') {
            return res.json({ success: false, message: 'Product is already cancelled and cannot be updated' });
        }

        // Update the status of the specific product
        productToChange.status = status;

        // Save the updated order
        await order.save();

        return res.json({ success: true, message: `Product status successfully updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
},
adminChangeReturn: async (req, res) => {
  try {
      const { orderId, productId, newReturn } = req.body;

      // Fetch the order from the database using orderId
      const order = await orderDB.findOne({ _id: orderId });
      const wallet = await walletDB.findOne({});

      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Find the product within the order's products array
      const productToReturn = order.products.find(item => item.productId.toString() === productId);

      if (!productToReturn) {
          return res.status(404).json({ success: false, message: 'Product not found in order' });
      }

        // Prevent updating the status if the product is already Delivered
        if (productToReturn.return === 'Returned') {
          return res.json({ success: false, message: 'Product is already Returned and cannot be updated' });
      }

      const productInDB = await productDB.findById(productId);

      productInDB.stock += productToReturn.quantity;

      let shippingCost = 40;
      const totalPrice = productToReturn.price * productToReturn.quantity;
      const totalDiscount = (productToReturn.price * productToReturn.discount / 100) * productToReturn.quantity;
      let total = totalPrice - totalDiscount  ;

       // Adding shipping cost if the condition is met
    if (order.products.length < 2) {
      total += shippingCost;  // shipping cost
    }

      const ttl = order.totalAmount - total
      order.totalAmount = ttl;
      // Update the status of the specific product
      productToReturn.return = newReturn;

      // Save the updated order
      await Promise.all([order.save(),productInDB.save()]);
      
                 if (!wallet) {
                  wallet = new walletDB(); // Create a new wallet document if none exists
                }else{
                  wallet.wallet += total;
                  await wallet.save();
                }

      return res.json({ success: true, message: `Product return successfully updated to ${newReturn}` });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
},
exportOrder:async(req,res)=>{
  try {
    const { startDate, endDate } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).send('Start date and end date are required.');
    }

    const workbook = new excelJs.Workbook();
    const worksheet = workbook.addWorksheet('Sales Reports');

    // Define worksheet columns based on order schema
    worksheet.columns = [
      { header: 'S NO.', key: 'S NO.', width: 10 },
      { header: 'OrderId', key: 'OrderId', width: 40 },
      { header: 'Billing Email', key: 'Billing Email', width: 30 },
      { header: 'Payment Method', key: 'Payment Method', width: 20 },
      { header: 'Order Date', key: 'Order Date', width: 15 },
      { header: 'Product Name', key: 'Product Name', width: 60 },
      { header: 'Product Price', key: 'Product Price', width: 15 },
      { header: 'Product Quantity', key: 'Product Quantity', width: 15 },
      
      { header: 'Sub Total ', key: 'Sub Total', width: 20 },
      { header: 'Total Discount', key: 'Total Discount', width: 15 },
      { header: 'Total ', key: 'Total ', width: 15 },
    ];

    // Fetch orders from database within the date range
    const orders = await orderDB.find({
      orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });

    let salesCount = 0;
    let totalOrderAmount = 0;
    let totalDiscount = 0;

    let counter = 1;
    orders.forEach((order) => {
      order.products.forEach((product) => {
        worksheet.addRow({
          'S NO.': counter++,
          'OrderId': `order Id ${order._id}`,
          'Billing Email': order.user.email,
          'Payment Method': order.paymentMethod,
          'Order Date': order.orderDate.toISOString().split('T')[0],
          'Product Name': product.pName,
          'Product Price': `₹${product.price}`,
          'Product Quantity': `${product.quantity} qt`,
        });

        salesCount += product.quantity;
        totalOrderAmount += product.price * product.quantity;
        totalDiscount += (product.price * product.quantity * product.discount) / 100;
      });
    });

    // Add summary row
    worksheet.addRow({});
    worksheet.addRow({
      'S NO.': 'Summary',
      'Sub Total': `₹${totalOrderAmount}`,
      'Total Discount': `₹${totalDiscount}`,
      'Total ': `₹${totalOrderAmount - totalDiscount}`,
    });

    // Format header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.alignment = { horizontal: 'left' };
      cell.font = { bold: true };
    });

    // Set response headers and send the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
},

getSalesData: async (req, res) => {
  try {
      // Fetch order dates and convert them to the correct format
      const orderdata = await orderDB.find({}, { orderDate: 1 });
      const ordersDate = orderdata.map(order => {
          return order.orderDate.toISOString().split('T')[0];
      });

      // Fetch sales data from the database
      const salesData = await orderDB.aggregate([
        {
          $unwind: '$products' // Deconstructs the products array
        },
        {
          $group: {
            _id: '$orderDate', // Group by orderDate
            totalQuantity: { $sum: '$products.quantity' } // Sum the quantities of each product
          }
        },
        {
          $project: {
            _id: 0, // Exclude the _id field from the result
            orderDate: '$_id',
            totalQuantity: 1
          }
        },
        {
          $sort: { orderDate: 1 }
        }
      ]);
      
console.log(salesData)
    return res.json({ success: true, data: salesData, ordersDate });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
},


addCoupon:async(req,res)=>{
  try{

    req.session.couponCodeError = '';
    req.session.couponCodeRegex = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.maxAmountError = "";
    req.session.maxAmountRegex = "";
    req.session.categoryCouponExists = "";
    req.session.validFromError = "";
    req.session.validToError = "";
    req.session.couponExists = "";
    req.session.validFrom = "";
    req.session.validTo = "";

    const {validFrom,validTo} = req.body;
    const couponCode = req.body.couponCode.trim();
    const discount = req.body.discount.trim();
    const maxAmount = req.body.maxAmount.trim();
    const today = new Date().toISOString().split('T')[0];
    const category = req.body.category;

    if(!couponCode){
      req.session.couponCodeError = "Coupon code field is required";
    }

    let couponCodeRegex = /^[a-zA-Z0-9]+$/
    if(!couponCodeRegex.test(couponCode)){
      req.session.couponCodeRegex = "Coupon code should be Alphabetic and Numeric";
    }

    if(!discount){
      req.session.discountError = "Discount field is required";
    }

    let discountRegex = /^[0-9]+$/;
    if(!discountRegex.test(discount) || discount <= 10 &&  discount >= 80){
      req.session.discountRegex = "Discount should be a numeric value greater than 10 and less than 80.";
    }
    if(!maxAmount){
      req.session.maxAmountError = "Maximum Amount field is required";
    }

    let maxAmountRegex = /^[0-9]+$/;
    if(!maxAmountRegex.test(maxAmount) ||  maxAmount < 10000){
      req.session.maxAmountRegex = "Max Amount should be a numeric value greater than or equal to 10000 ";
    }

    if(!validFrom){
      req.session.validFromError = "Valida from field is required";
    }else if (validFrom < today || validFrom > today) {
      req.session.validFrom = "Valid from date should not be in the past or future.";
  }

    if(!validTo){
      req.session.validToError = "Valid to field is required";
    } else if (validTo < validFrom) {
      req.session.validTo = "Valid to date should not be before the valid from date.";
  }

    if( req.session.couponCodeError ||
      req.session.couponCodeRegex  ||
      req.session.discountError ||
      req.session.discountRegex ||
      req.session.maxAmountError ||
      req.session.maxAmountRegex ||
      req.session.validFromError||
      req.session.validToError ||
      req.session.validFrom ||
      req.session.validTo
      ){
        console.log(" Session Errors")
     return res.redirect('/addCoupon')
    }
    const categoriId = await categoryDB.findOne({name:category,active:true});
    const coupons = await couponDB.findOne({category:categoriId._id,active:true,expired:false})
    const existingCoupon = await couponDB.findOne({ couponCode: couponCode});
    if(existingCoupon){
      req.session.couponExists = "Coupon Already exists or InActive"
      return res.redirect('/addCoupon');
    }
     if(coupons){
      req.session.categoryCouponExists = 'The coupon is already active on this category'
      return res.redirect('/addCoupon');
    }
    
      const newCoupon = new couponDB({
        couponCode:couponCode,
        discount:discount,
        maxAmount : maxAmount,
        category:categoriId._id,
        createdAt:validFrom,
        expiresAt:validTo,
        active:true,
      })
      
      await newCoupon.save();
      console.log(newCoupon,"coupn Saved");
  
    return res.redirect('/admin-Coupon');
  }catch(error){
    console.error(error);
  return  res.status(500).send("Server Error");
  }
},
deleteCoupon:async(req,res)=>{
  try{
      const {id}= req.query;

      if(!id){
        res.status(500).send("Server Error");
      }
     await couponDB.findOneAndUpdate({_id:id},{active:false,expired:true});

      return res.redirect('/admin-Coupon');
  }catch(error){
    console.error(error);
    res.status(500).send("Server Error");
  }
},
addOffer :async(req,res)=>{
  try{

    // clear session
    req.session.categoryCodeError = '';
    req.session.categotyCodeRegex = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.validFromError = "";
    req.session.validToError = "";
    req.session.offerExists = "";
    req.session.validFrom2 = "";
    req.session.validTo2 = "";

    // request data from body
    const {validFrom,validTo} = req.body;
    const categoryCode = req.body.category;
    const discount = req.body.discount;
    const today = new Date().toISOString().split('T')[0];

    // Form validation
    if(!categoryCode){
      req.session.categoryCodeError = "Category field is required";
    }

    let categoryCodeRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
    if(!categoryCodeRegex.test(categoryCode)){
      req.session.categotyCodeRegex = "Category code should be Alphabetic";
    }

    if(!discount){
      req.session.discountError = "Discount field is required";
    }

    let discountRegex = /^[0-9]+$/;
    if(!discountRegex.test(discount) || discount <= 10 ||  discount >= 80){
      req.session.discountRegex = "Discount should be a numeric value greater than 10 and less than 80.";
    }

    if(!validFrom){
      req.session.validFromError = "Valid from field is required";
    }else if (validFrom > today) {
      req.session.validFrom2 = "Valid from date should not be in the future.";
  }

    if(!validTo){
      req.session.validToError = "Valid to field is required";
    }else if (validTo > today) {
      req.session.validTo2 = "Valid to date should not be in the future.";
  } else if (validTo < validFrom) {
      req.session.validTo2 = "Valid to date should not be before the valid from date.";
  }

    // validation error
    if(
      req.session.categoryCodeError ||
      req.session.categotyCodeRegex  ||
      req.session.discountError ||
      req.session.discountRegex ||
      req.session.validFromError||
      req.session.validToError ||
      req.session.validFrom2  ||
      req.session.validTo2 
      ){
        console.log(" Session Errors")
     return res.redirect('/addOffers')
    }
    const offer = await offerDB.find({name:categoryCode});
    if(offer){
      req.session.offerExists = "The offer is already Active";
      return res.redirect('/addOffers');
    }
    // find category
    const category = await categoryDB.findOne({name:categoryCode,active:true});
 
    // Find category
    if (!category) {
      req.session.categoryCodeNotMatch = "Category code does not exist or is inactive";
      return res.redirect('/addOffers');
    }

    // create new offer
    const newOffer = new offerDB({
      name : categoryCode,
      discount : discount,
      createdAt : validFrom,
      expiresAt : validTo,
      active:true,
    });

    // save offer
    await newOffer.save();
// Set success message in session
        return res.redirect('/admin-Offers');    

  }catch(error){
    res.status(500).send("Sever Error");
  }
},

deleteOffer: async(req,res)=>{
try{
 const id = req.query.id;
console.log(id)
 await offerDB.findOneAndUpdate({_id:id,active:true},{active:false,expired:true});

 return res.redirect('/admin-offers');

}catch(error){
  console.error(error);
  return res.status(500).send("Server Error");
}
},
};
