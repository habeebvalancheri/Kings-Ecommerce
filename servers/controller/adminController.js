const userDB = require("../model/userSchema");
const productDB = require("../model/productSchema");
const categoryDB = require("../model/categorySchema");
const orderDB = require("../model/orderSchema");
const couponDB = require("../model/couponSchema");
const walletDB = require("../model/walletSchema");
const offerDB = require("../model/offerSchema");
const dotenv = require("dotenv");
const excelJs = require("exceljs");
dotenv.config();
const upload = require("../controller/multerSetup");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer-core");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid"); // Import uuidv4 from the uuid package
const fs = require("fs").promises;
const mongoose = require("mongoose");

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

      if (
        req.session.emailEmpty ||
        req.session.passwordEmpty ||
        req.session.passNotValid ||
        req.session.emailNotValid
      ) {
        return res.redirect("/adminLogin");
      }

      const { email, password } = req.body;

      if (
        email === process.env.Admin_EMAIL &&
        password === process.env.Admin_PASS
      ) {
        req.session.adminLoggedIn = true;
        return res.redirect("/admin-Dashboard");
      }
    } catch (error) {
      return res.redirect("/AdminServer-Error");
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
      return res.redirect("/AdminServer-Error");
    }
  },

  unblockUser: async (req, res) => {
    try {
      const id = req.query.id;

      const user = await userDB.findOne({ _id: id });

      if (user.block === true) {
        await userDB.updateOne({ _id: id }, { $set: { block: false } });
        return res.redirect("/admin-Users");
      } else if (user.block === false) {
        return res.status(400).send("User is already unblocked");
      } else {
        return res.status(404).send("User not found");
      }
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  // Controller function to add products
  addProducts: async (req, res) => {
    try {
      req.session.pNameRegexerror = "";
      req.session.descriptionRegexerror = "";
      req.session.priceRegexerror = "";
      req.session.stockRegexerror = "";
      req.session.discountRegexerror = "";
      req.session.categoryError = "";
      req.session.imageError = "";
      // Destructure incoming data from the request body and set default values if missing

      let {
        pName = "",
        description = "",
        price = "",
        stock = "",
        discount = "",
        category = "",
        image = "",
      } = req.body;

      // Trim every field to remove leading and trailing whitespace
      pName = pName.trim();
      description = description.trim();
      price = price.trim();
      stock = stock.trim();
      discount = discount.trim();
      category = category.trim();

      // Save the form data in the session
      req.session.pName = pName;
      req.session.description = description;
      req.session.price = price;
      req.session.stock = stock;
      req.session.discount = discount;
      req.session.category = category;

      // Validate incoming data using regex patterns
      const pNameRegex = /^[a-zA-Z\s]{3,70}$/;
      // Update the description regex to allow the valid characters

      const priceRegex = /^(0|[1-9]\d*)(\.\d+)?$/;
      const stockRegex = /^[1-9]\d*$/;
      const discountRegex = /^(10|[1-8][0-9]|90)$/; // 10 to 90

      if (!pNameRegex.test(pName)) {
        req.session.pNameRegexerror =
          "Product name must be 3-70 letters long and may include spaces.";
      }

      if (description.length < 3 || description.length > 2000) {
        req.session.descriptionRegexerror =
          "Description must be 3-2000 characters and may include alphanumeric characters and punctuation.";
      }

      if (!priceRegex.test(price)) {
        req.session.priceRegexerror =
          "Price must be a valid number, e.g., 10.50 or 100.";
      }

      if (!stockRegex.test(stock)) {
        req.session.stockRegexerror =
          "Stock must be an integer greater than 0.";
      }

      if (!discountRegex.test(discount)) {
        req.session.discountRegexerror =
          "Discount must be an integer from 10 to 90.";
      }

      if (!category) {
        req.session.categoryError = "Category cannot be empty.";
      }

      if (image === 0) {
        req.session.imageError = "Image cannot be empty";
      }

      // Validate image file(s)
      if (!req.files || req.files.length < 4) {
        req.session.imageError = "Please upload four images .";
      } else {
        // Validate MIME types for images
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        for (const file of req.files) {
          if (!allowedMimeTypes.includes(file.mimetype)) {
            req.session.imageError =
              "Invalid image type. Please upload JPEG, PNG, GIF , or WEBP files only.";
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
        return res.redirect(
          "/add-Products?error=Invalid data. Please check your input and try again."
        );
      }

      // Find the category by name and ensure it is active
      const categoryObj = await categoryDB.findOne({
        name: category,
        active: true,
      });
      if (!categoryObj) {
        return res.redirect(
          "/add-Products?error= Invalid Category. Please select an active category."
        );
      }

      // Process product images
      const productImages = await Promise.all(
        req.files.map(async (file) => {
          // Resize and crop the image using Sharp
          const buffer = await sharp(file.path)
            .resize({ width: 400, height: 550, fit: "cover" }) // Resize and crop to 300x300
            .toBuffer();

          // Rename file with a unique name
          const filename = `${uuidv4()}-${Date.now()}.jpg`; // Generate a unique filename
          const filepath = path.join(process.cwd(), "assets/images", filename);

          // Save the cropped image
          await fs.writeFile(filepath, buffer);

          // Return the filename
          return filename;
        })
      );

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

      req.session.pName = "";
      req.session.description = "";
      req.session.price = "";
      req.session.stock = "";
      req.session.discount = "";
      req.session.category = "";

      // Redirect to the admin products page with a success message
      return res.redirect(
        "/admin-Products?success=Product added successfully."
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  updateProducts: async (req, res) => {
    try {
      req.session.pNameRegexerror2 = "";
      req.session.descriptionRegexerror2 = "";
      req.session.priceRegexerror2 = "";
      req.session.stockRegexerror2 = "";
      req.session.discountRegexerror2 = "";
      req.session.categoryError2 = "";
      req.session.generalError = "";

      // Destructure incoming data from the request body and set default values if missing

      let { pName, description, price, stock, discount, category } = req.body;

      // Trim every field to remove leading and trailing whitespace
      pName = pName.trim();
      description = description.trim();
      price = price.trim();
      stock = stock.trim();
      discount = discount.trim();
      category = category.trim();

      // Store form data in session
      req.session.formData = {
        pName,
        description,
        price,
        stock,
        discount,
        category,
      };

      // Validate incoming data using regex patterns
      const pNameRegex = /^[a-zA-Z\s]{3,70}$/;
      // Update the description regex to allow the valid characters

      const priceRegex = /^(0|[1-9]\d*)(\.\d+)?$/;
      const stockRegex = /^[1-9]\d*$/;
      const discountRegex = /^(10|[1-8][0-9]|90)$/; // 10 to 90

      if (!pNameRegex.test(pName)) {
        req.session.pNameRegexerror2 =
          "Product name must be 3-70 letters long and may include spaces.";
      }

      if (description.length < 3 || description > 2000) {
        req.session.descriptionRegexerror2 =
          "Description must be 3-2000 characters and may include alphanumeric characters and punctuation.";
      }

      if (!priceRegex.test(price)) {
        req.session.priceRegexerror2 =
          "Price must be a valid number, e.g., 10.50 or 100.";
      }

      if (!stockRegex.test(stock)) {
        req.session.stockRegexerror2 =
          "Stock must be an integer greater than 0.";
      }

      if (!discountRegex.test(discount)) {
        req.session.discountRegexerror2 =
          "Discount must be an integer from 10 to 90.";
      }

      if (!category) {
        req.session.categoryError2 = "Category cannot be empty.";
      }

      const id = req.body.id;

      const products = await productDB.findById(id);

      // Ensure only four images are saved
      const selectedImages = products.pImages.slice(0, 4);
      if (products.pImages.length < 4) {
        req.session.imageCount = "You must upload at least four images.";
      }
      // Check the input against the regex patterns
      if (
        req.session.pNameRegexerror2 ||
        req.session.descriptionRegexerror2 ||
        req.session.priceRegexerror2 ||
        req.session.stockRegexerror2 ||
        req.session.discountRegexerror2 ||
        req.session.categoryError2 ||
        req.session.imageError ||
        req.session.imageCount
      ) {
        return res.redirect(`/update-Product?id=${products._id}`);
      }

      // Convert price, stock, and discount to numeric types safely
      const priceValue = parseFloat(price);
      const stockValue = parseInt(stock);
      const discountValue = parseInt(discount);

      if (isNaN(priceValue) || isNaN(stockValue) || isNaN(discountValue)) {
        req.session.generalError =
          "Invalid input data. Please provide valid numeric values for price, stock, and discount.";
        return res.redirect("/update-Product");
      }

      const categoryObj = await categoryDB.findOne({
        name: category,
        active: true,
      });
      if (!categoryObj) {
        req.session.categoryError2 = "Category does not exist.";
        return res.redirect("/update-Product");
      }

      const productId = req.body.id;

      await productDB.updateOne(
        { _id: productId },
        {
          $set: {
            pName: pName,
            description: description,
            price: priceValue,
            stock: stockValue,
            discount: discountValue,
            category: categoryObj._id,
            pImages: selectedImages,
          },
        }
      );

      return res.redirect("/admin-Products");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  imageUploaded: async (req, res) => {
    try {
      const id = req.query.id;

      // Get the current product images
      const product = await productDB.findById(id);
      const currentImages = product.pImages || [];

      // Check if the total images after upload exceed 4
      if (req.files && currentImages.length + req.files.length > 4) {
        req.session.imageError2 = "You can only upload a total of four images.";
        return res.redirect(`/update-Product?id=${id}`);
      }

      const image = req.files.map((file) => file.filename);

      await productDB.updateOne(
        { _id: id },
        { $push: { pImages: { $each: image } } }
      );

      return res.redirect(`/update-Product?id=${id}`);
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  removeImages: async (req, res) => {
    try {
      const filenameToRemove = req.body.filename;

      const id = req.query.id;

      // Implement the logic to remove the image from the database
      const updatedImage = await productDB.updateOne(
        { _id: id },
        { $pull: { pImages: filenameToRemove } }
      );

      const filePath = path.join(__dirname, "path/to/images", filenameToRemove);
      fs.unlinkSync(filePath);

      // Check if the update was successful
      if (updatedImage.nModified > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Image removed successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Image not found or not removed" });
      }
    } catch (error) {
      return res.redirect("/AdminServer-Error");
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

      return res.redirect(
        "/admin-Products?success=Product unlisted successfully"
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
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

      return res.redirect(
        "/unlisted-products?success=Product restored successfully"
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  adminChangeOrder: async (req, res) => {
    try {
      const { orderId, productId, status } = req.body;

      if (!status) {
        return res.status(500).json({
          success: false,
          message: "Status is Not Valid",
        });
      }

      // Fetch the order from the database using orderId
      const order = await orderDB.findOne({ _id: orderId });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Find the product within the order's products array
      const productToChange = order.products.find(
        (item) => item.productId.toString() === productId
      );

      if (!productToChange) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found in order" });
      }

      // Prevent updating the status if the product is already Delivered or Cancelled
      if (["Delivered", "Cancelled"].includes(productToChange.status)) {
        return res.json({
          success: false,
          message: `Product is already ${productToChange.status} and cannot be updated`,
        });
      }

      // Validate status transition based on current status
      switch (productToChange.status) {
        case "Pending":
          if (status === "Shipped") {
            productToChange.status = "Shipped";
          } else {
            return res.json({
              success: false,
              message: `Invalid status transition from ${productToChange.status} to ${status}`,
            });
          }
          break;
        case "Shipped":
          if (status === "Delivered" || status === "Cancelled") {
            productToChange.status = status;
          } else {
            return res.json({
              success: false,
              message: `Invalid status transition from ${productToChange.status} to ${status}`,
            });
          }
          break;
        default:
          return res.json({
            success: false,
            message: `Invalid status transition from ${productToChange.status} to ${status}`,
          });
      }
    
      if (status === "Delivered" && order.paymentMethod === 'COD') {
        const shippingCost = 40;
        const productPrice = productToChange.price;
        const productDiscount = productToChange.discount || 0;
        let discountedPrice =
          productPrice - (productPrice * productDiscount) / 100;
        discountedPrice += shippingCost;
        order.totalAmount += discountedPrice;
      }

      // Save the updated order
      await order.save();

      return res.json({
        success: true,
        message: `Product status successfully updated to ${status}`,
      });
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  adminChangeReturn: async (req, res) => {
    try {
      const { orderId, productId, newReturn } = req.body;

      if (!newReturn) {
        return res.status(500).json({
          success: false,
          message: "Status is Not Valid",
        });
      }

      // Fetch the order from the database using orderId
      const order = await orderDB.findOne({ _id: orderId });

      // Find the user associated with the order
      const user = await userDB.findById(order.user.userId);

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Find the product within the order's products array
      const productToReturn = order.products.find(
        (item) => item.productId.toString() === productId
      );

      if (!productToReturn) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found in order" });
      }

      // Prevent updating the return status if the product is not Pending
      const productInDB = await productDB.findById(productId);
      if (productToReturn.return !== "Pending") {
        return res.json({
          success: false,
          message: `Product return status is ${productToReturn.return} and cannot be updated`,
        });
      }

      if (productToReturn.return === "Pending") {
        productInDB.stock += productToReturn.quantity;
        let shippingCost = 40;
        const totalDiscount =
          (productInDB.price *
            productToReturn.quantity *
            productInDB.discount) /
          100;
        const totalPrice =
          productInDB.price * productToReturn.quantity - totalDiscount;
        let overallTotalPrice = totalPrice;

        // Check if all products are cancelled
        productToReturn.return = "Returned";
        
        const allProductsReturned = order.products.every(
          (item) => item.return === "Returned"
        );

        if (allProductsReturned && order.shippingCharge.length <= 0) {
          overallTotalPrice += shippingCost;
          order.shippingCharge.push(40);
        }

        // Check if the product had a coupon applied
        const couponAppliedToProduct = order.couponAppliedProducts.includes(
          productToReturn.productId
        );

        if (couponAppliedToProduct) {
          if (order.shippingCharge.length <= 0) {
            overallTotalPrice += shippingCost;
            order.shippingCharge.push(40);
          }
          const couponDiscount =
            (overallTotalPrice * order.coupon.discount) / 100;
          overallTotalPrice -= couponDiscount;
        }

        // Round the overall total price to avoid floating-point precision issues
        overallTotalPrice = Math.round(overallTotalPrice * 100) / 100;

        let ttlsum = order.totalAmount - overallTotalPrice;
        ttlsum = Math.round(ttlsum * 100) / 100; // Round the total sum as well

        order.totalAmount = ttlsum;

        let wallet = await walletDB.findOne({ userId: user._id });

        if (!wallet) {
          wallet = new walletDB({ userId: user._id }); // Create a new wallet document if none exists
        }

        wallet.walletBalance += overallTotalPrice;
        wallet.walletBalance = Math.round(wallet.walletBalance * 100) / 100; // Round the wallet balance

        wallet.transactions.push({
          amount: overallTotalPrice,
          credit: true,
          status: "Returned",
          transactionId: new mongoose.Types.ObjectId().toString(),
        });
        await wallet.save();
      }

      // Save the updated order
      await Promise.all([order.save(), productInDB.save()]);

      return res.json({
        success: true,
        message: `Product return successfully updated to ${newReturn}`,
      });
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  exportOrder: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Validate dates
      if (!startDate || !endDate) {
        return res.status(400).send("Start date and end date are required.");
      }

      const workbook = new excelJs.Workbook();
      const worksheet = workbook.addWorksheet("Sales Reports");

      // Define worksheet columns based on order schema
      worksheet.columns = [
        { header: "S NO.", key: "S NO.", width: 10 },
        { header: "OrderId", key: "OrderId", width: 40 },
        { header: "Billing Email", key: "Billing Email", width: 30 },
        { header: "Payment Method", key: "Payment Method", width: 20 },
        { header: "Order Date", key: "Order Date", width: 15 },
        { header: "Product Name", key: "Product Name", width: 60 },
        { header: "Product Price", key: "Product Price", width: 25 },
        { header: "Product Quantity", key: "Product Quantity", width: 19 },
      ];

      // Fetch orders from database within the date range
      const orders = await orderDB.find({
        orderDate: {
          $gte: new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)),
          $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
        },
      });

      if (!orders) {
        return res
          .status(500)
          .send("There are no sales happend in this Date Range");
      }

      let salesCount = 0;
      let totalOrderAmount = 0;
      let totalDiscount = 0;

      let counter = 1;
      orders.forEach((order) => {
        order.products.forEach((product) => {
          worksheet.addRow({
            "S NO.": counter++,
            OrderId: `order Id ${order._id}`,
            "Billing Email": order.user.email,
            "Payment Method": order.paymentMethod,
            "Order Date": order.orderDate.toISOString().split("T")[0],
            "Product Name": product.pName,
            "Product Price": `₹${product.price}`,
            "Product Quantity": `${product.quantity} qt`,
          });

          salesCount += product.quantity;
          totalOrderAmount += product.price * product.quantity;
          totalDiscount +=
            (product.price * product.quantity * product.discount) / 100;

          // Apply coupon deduction if applicable
          if (order.coupon && order.coupon.discount > 0) {
            const couponDeduction =
              (product.price * product.quantity * order.coupon.discount) / 100;
            totalDiscount += couponDeduction;
          }
        });
      });

      worksheet.addRow({});
      worksheet.addRow({
        OrderId: "Summary",
        "Product Name": `Sub Total                                                                               ₹${totalOrderAmount}`,
        "Product Price": `Total Discount       ₹${totalDiscount}`,
        "Product Quantity": `Total         ₹${
          totalOrderAmount - totalDiscount
        }`,
      });

      // Format header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.alignment = { horizontal: "left" };
        cell.font = { bold: true };
      });

      // Set response headers and send the file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
      await workbook.xlsx.write(res);
      return res.status(200).end();
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  exportOrderPDF: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Validate dates
      if (!startDate || !endDate) {
        return res.status(400).send("Start date and end date are required.");
      }

      // Fetch orders from database within the date range
      const orders = await orderDB.find({
        orderDate: {
          $gte: new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)),
          $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
        },
      });

      if (!orders) {
        return res
          .status("500")
          .send("There are no sales happend in this Date Range");
      }

      let salesCount = 0;
      let totalOrderAmount = 0;
      let totalDiscount = 0;

      let counter = 1;
      orders.forEach((order) => {
        order.products.forEach((product) => {
          salesCount += product.quantity;
          totalOrderAmount += product.price * product.quantity;
          totalDiscount +=
            (product.price * product.quantity * product.discount) / 100;

          // Apply coupon deduction if applicable
          if (order.coupon && order.coupon.discount > 0) {
            const couponDeduction =
              (product.price * product.quantity * order.coupon.discount) / 100;
            totalDiscount += couponDeduction;
          }
        });
      });

      // Prepare data for the template
      const data = {
        orders,
        salesCount,
        totalOrderAmount,
        totalDiscount,
      };

      // Path to EJS template file
      const ejsTemplate = path.resolve(__dirname, "../../views/admin/pdf.ejs");
      const templateContent = await fs.readFile(ejsTemplate, "utf-8");

      const ejsData = ejs.render(templateContent, { data });
      // Render the EJS template with the data
      // const ejsData = await ejs.renderFile(ejsTemplate, data);

      // Launch a new instance of Puppeteer
      const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "/snap/bin/chromium",
      });
      const page = await browser.newPage();
      await page.setContent(ejsData, { waitUntil: "networkidle0" });

      // Generate PDF
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      // Close the browser
      await browser.close();

      // Send the PDF file as a response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=sales_report.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  getSalesData: async (req, res) => {
    try {
      // Fetch order dates and convert them to the correct format
      const orderdata = await orderDB.find({}, { orderDate: 1 });
      const ordersDate = orderdata.map((order) => {
        return order.orderDate.toISOString().split("T")[0];
      });

      // Fetch sales data from the database
      const salesData = await orderDB.aggregate([
        {
          $unwind: "$products", // Deconstructs the products array
        },
        {
          $group: {
            _id: "$orderDate", // Group by orderDate
            totalQuantity: { $sum: "$products.quantity" }, // Sum the quantities of each product
          },
        },
        {
          $project: {
            _id: 0, // Exclude the _id field from the result
            orderDate: "$_id",
            totalQuantity: 1,
          },
        },
        {
          $sort: { orderDate: 1 },
        },
      ]);

      return res.json({ success: true, data: salesData, ordersDate });
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  addCoupon: async (req, res) => {
    try {
      req.session.couponCodeError = "";
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

      const { validFrom, validTo } = req.body;
      const couponCode = req.body.couponCode.trim();
      const discount = req.body.discount.trim();
      const couponCount = req.body.couponCount.trim();
      const maxAmount = req.body.maxAmount.trim();
      const today = new Date().toISOString().split("T")[0];
      const category = req.body.category;

      if (!couponCode) {
        req.session.couponCodeError = "Coupon code field is required";
        req.session.couponCode = couponCode;
      }

      let couponCodeRegex = /^[a-zA-Z0-9]+$/;
      if (!couponCodeRegex.test(couponCode)) {
        req.session.couponCodeRegex =
          "Coupon code should be Alphabetic and Numeric";
        req.session.couponCode = couponCode;
      }

      if (!discount) {
        req.session.discountError = "Discount field is required";
        req.session.discount = discount;
      }

      const discountRegex = /[0-9]$/;
      if (!discountRegex.test(discount) || discount < 0 || discount > 100) {
        req.session.discountRegex =
          "Discount should be a numeric value, greater than 0 and less than 100";
        req.session.discount = discount;
      }

      if (!couponCount) {
        req.session.couponCountError = "Coupon Count field is required";
        req.session.couponCount = couponCount;
      }

      let couponCountRegex = /^[0-9]+$/;
      if (!couponCountRegex.test(couponCount) || couponCount < 1) {
        req.session.couponCountRegex =
          "Coupon Count should be a numeric value greater 0 ";
        req.session.couponCount = couponCount;
      }

      if (!maxAmount) {
        req.session.maxAmountError = "Maximum Amount field is required";
        req.session.maxAmount = maxAmount;
      }

      let maxAmountRegex = /^[0-9]+$/;
      if (!maxAmountRegex.test(maxAmount) || maxAmount < 10000) {
        req.session.maxAmountRegex =
          "Max Amount should be a numeric value greater than or equal to 10000 ";
        req.session.maxAmount = maxAmount;
      }

      if (!validFrom) {
        req.session.validFromError = "Valida from field is required";
        req.session.validFromValue = validFrom;
      } else if (validFrom < today || validFrom > today) {
        req.session.validFrom =
          "Valid from date should not be in the past or future.";
        req.session.validFromValue = validFrom;
      }

      if (!validTo) {
        req.session.validToError = "Valid to field is required";
        req.session.validToValue = validTo;
      } else if (validTo < validFrom) {
        req.session.validTo =
          "Valid to date should not be before the valid from date.";
        req.session.validToValue = validTo;
      }

      if (
        req.session.couponCodeError ||
        req.session.couponCodeRegex ||
        req.session.discountError ||
        req.session.discountRegex ||
        req.session.maxAmountError ||
        req.session.maxAmountRegex ||
        req.session.validFromError ||
        req.session.validToError ||
        req.session.validFrom ||
        req.session.validTo
      ) {
        return res.redirect("/addCoupon");
      }

      const categoriId = await categoryDB.findOne({
        name: category,
        active: true,
      });

      if (!categoriId) {
        req.session.categoryError = "Category field is required";
        req.session.couponCode = couponCode;
        req.session.discount = discount;
        req.session.couponCount = couponCount;
        req.session.maxAmount = maxAmount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addCoupon");
      }

      const coupons = await couponDB.findOne({
        category: categoriId._id,
        active: true,
        expired: false,
      });

      const existingCoupon = await couponDB.findOne({ couponCode: couponCode });
      if (existingCoupon) {
        req.session.couponExists = "Coupon Already exists or InActive";
        req.session.couponCode = couponCode;
        req.session.discount = discount;
        req.session.couponCount = couponCount;
        req.session.maxAmount = maxAmount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addCoupon");
      }
      if (coupons) {
        req.session.categoryCouponExists =
          "The coupon is already active on this category";
        req.session.couponCode = couponCode;
        req.session.discount = discount;
        req.session.couponCount = couponCount;
        req.session.maxAmount = maxAmount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addCoupon");
      }

      const newCoupon = new couponDB({
        couponCode: couponCode,
        discount: discount,
        couponCount: couponCount,
        maxAmount: maxAmount,
        category: categoriId._id,
        createdAt: validFrom,
        expiresAt: validTo,
        active: true,
      });

      await newCoupon.save();

      req.session.couponCode = "";
      req.session.discount = "";
      req.session.couponCount = "";
      req.session.maxAmount = "";
      req.session.validFromValue = "";
      req.session.validToValue = "";

      return res.redirect("/admin-Coupon");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  deleteCoupon: async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        res.status(500).send("Server Error");
      }
      await couponDB.findOneAndUpdate(
        { _id: id },
        { active: false, expired: true }
      );

      return res.redirect("/admin-Coupon");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  addOffer: async (req, res) => {
    try {
      // clear session
      req.session.categoryCodeError = "";
      req.session.discountError = "";
      req.session.discountRegex = "";
      req.session.validFromError = "";
      req.session.validToError = "";
      req.session.offerExists = "";
      req.session.validFrom2 = "";
      req.session.validTo2 = "";

      // request data from body
      const { validFrom, validTo } = req.body;
      const categoryCode = req.body.category;
      const discount = req.body.discount;
      const today = new Date().toISOString().split("T")[0];

      // Form validation
      if (!categoryCode) {
        req.session.categoryCodeError = "Category field is required";
        req.session.categoryCode = categoryCode;
      }

      if (!discount) {
        req.session.discountError = "Discount field is required";
        req.session.discount = discount;
      }

      let discountRegex = /^[0-9]+$/;
      if (!discountRegex.test(discount) || discount < 0 || discount > 100) {
        req.session.discountRegex =
          "Discount should be a numeric value, greater than 0 and less than 100";
        req.session.discount = discount;
      }

      if (!validFrom) {
        req.session.validFromError = "Valida from field is required";
        req.session.validFromValue = validFrom;
      } else if (validFrom < today || validFrom > today) {
        req.session.validFrom2 =
          "Valid from date should not be in the past or future.";
        req.session.validFromValue = validFrom;
      }

      if (!validTo) {
        req.session.validToError = "Valid to field is required";
        req.session.validToValue = validTo;
      } else if (validTo < validFrom) {
        req.session.validTo2 =
          "Valid to date should not be before the valid from date.";
        req.session.validToValue = validTo;
      }
      // validation error
      if (
        req.session.categoryCodeError ||
        req.session.discountError ||
        req.session.discountRegex ||
        req.session.validFromError ||
        req.session.validToError ||
        req.session.validFrom2 ||
        req.session.validTo2
      ) {
        req.session.errorMessage =
          "Validation failed. Please check the fields.";
        req.session.categoryCode = categoryCode;
        req.session.discount = discount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addOffers");
      }

      // Check if offer already exists for the category
      const existingOffer = await offerDB.findOne({
        name: categoryCode,
        active: true,
      });
      if (existingOffer) {
        req.session.offerExists = "The offer is already Active";
        req.session.errorMessage = "Offer already exists.";
        req.session.categoryCode = categoryCode;
        req.session.discount = discount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addOffers");
      }

      // Find category
      const category = await categoryDB.findOne({
        name: categoryCode,
        active: true,
      });

      if (!category) {
        req.session.categoryCodeNotMatch =
          "Category code does not exist or is inactive";
        req.session.errorMessage =
          "Category code does not exist or is inactive.";
        req.session.categoryCode = categoryCode;
        req.session.discount = discount;
        req.session.validFromValue = validFrom;
        req.session.validToValue = validTo;
        return res.redirect("/addOffers");
      }

      // create new offer
      const newOffer = new offerDB({
        name: categoryCode,
        discount: discount,
        createdAt: validFrom,
        expiresAt: validTo,
        active: true,
      });

      // save offer
      await newOffer.save();

      // Set success message in session

      let validDiscount = true;
      let updatedProducts = [];
      // Find all active products in the category
      const offerProducts = await productDB.find({
        category: category,
        active: true,
      });

      offerProducts.forEach((products) => {
        let combinedDiscount = products.discount + parseInt(discount);
        if (combinedDiscount <= 60) {
          products.discount = combinedDiscount;
          updatedProducts.push(products);
        } else {
          validDiscount = false;
        }
      });
      // Save updated products
      await Promise.all(updatedProducts.map((product) => product.save()));
      // Set success message in session
      req.session.successMessage =
        "Offer successfully added and discounts updated.";

      req.session.categoryCode = "";
      req.session.discount = "";
      req.session.validFromValue = "";
      req.session.validToValue = "";

      return res.redirect("/admin-Offers");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  updateOffer: async (req, res) => {
    try {
      const id = req.query.id;

      // request data from body
      const { validFrom, validTo } = req.body;
      const categoryCode = req.body.category;
      const discount = req.body.discount;
      const today = new Date().toISOString().split("T")[0];
      
      // Form validation
      if (!categoryCode) {
        req.session.categoryCodeError = "Category field is required";
      }

      if (!discount) {
        req.session.discountError = "Discount field is required";
      }

      let discountRegex = /^[0-9]+$/;
      if (!discountRegex.test(discount) || discount < 0 || discount > 100) {
        req.session.discountRegex =
          "Discount should be a numeric value, greater than 0 and less than 100";
      }

      if (!validFrom) {
        req.session.validFromError = "Valida from field is required";
      } else if (validFrom < today || validFrom > today) {
        req.session.validFrom2 =
          "Valid from date should not be in the past or future.";
      }

      if (!validTo) {
        req.session.validToError = "Valid to field is required";
      } else if (validTo < validFrom) {
        req.session.validTo2 =
          "Valid to date should not be before the valid from date.";
      }
     
      // validation error
      if (
        req.session.categoryCodeError ||
        req.session.discountError ||
        req.session.discountRegex ||
        req.session.validFromError ||
        req.session.validToError ||
        req.session.validFrom2 ||
        req.session.validTo2
      ) {
        req.session.errorMessage =
          "Validation failed. Please check the fields.";
        return res.redirect("/updateOffers");
      }

      // Find category
      const category = await categoryDB.findOne({
        name: categoryCode,
        active: true,
      });
   
      if (!category) {
        req.session.categoryCodeNotMatch =
          "Category code does not exist or is inactive";
        req.session.errorMessage =
          "Category code does not exist or is inactive.";
        return res.redirect("/updateOffers");
      }
     
      const categoryOffer = await offerDB.findOne({ _id: id });

      let validDiscount = true;
      let updatedProducts = [];
      // Find all active products in the category
      const offerProducts = await productDB.find({
        category: category,
        active: true,
      });
    
      offerProducts.forEach((products) => {
        let combinedDiscount = products.discount - categoryOffer.discount;
        if (combinedDiscount <= 60) {
          products.discount = combinedDiscount;
          updatedProducts.push(products);
        } else {
          validDiscount = false;
        }
      });
    
      // Save updated products
      await Promise.all(updatedProducts.map((product) => product.save()));
      // Set success message in session
      req.session.successMessage =
        "Offer successfully added and discounts updated.";

      await offerDB.findOneAndUpdate(
        {
          _id: id,
          active: true,
        },
        {
          name: categoryCode,
          discount: discount,
          createdAt: validFrom,
          expiresAt: validTo,
          active: true,
        }
      );

      validDiscount = true;
      updatedProducts = [];

      offerProducts.forEach((products) => {
        let combinedDiscount = products.discount + parseInt(discount);

        if (combinedDiscount <= 60) {
          products.discount = combinedDiscount;
          updatedProducts.push(products);
        } else {
          validDiscount = false;
        }
      });
      // Save updated products
      await Promise.all(updatedProducts.map((product) => product.save()));

      return res.redirect("/admin-Offers");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  deleteOffer: async (req, res) => {
    try {
      const id = req.query.id;

      await offerDB.findOneAndUpdate(
        { _id: id, active: true },
        { active: false, expired: true }
      );

      const categoryOffer = await offerDB.findOne({ _id: id });
      const category = await categoryDB.findOne({ name: categoryOffer.name });

      let validDiscount = true;
      let updatedProducts = [];

      // Find all active products in the category
      const offerProducts = await productDB.find({
        category: category._id,
        active: true,
      });

      offerProducts.forEach((products) => {
        let combinedDiscount =
          products.discount - parseInt(categoryOffer.discount);
        if (combinedDiscount <= 60) {
          products.discount = combinedDiscount;
          updatedProducts.push(products);
        } else {
          validDiscount = false;
        }
      });
      // Save updated products
      await Promise.all(updatedProducts.map((product) => product.save()));
      return res.redirect("/admin-offers");
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },
};
