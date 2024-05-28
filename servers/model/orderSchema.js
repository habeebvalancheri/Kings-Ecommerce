const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user : {
    userId:{
      type:mongoose.Schema.Types.ObjectId,
    },
      name : {
      type : String,
      required : true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
      },
  },
  products:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
    },
    pName: {
      type: String,
      required:true,
    },
    pImages: {
      type: String,
      required:true,
    },
    category: {
      type: String,
      required:true,
    },
    description: {
      type: String,
      required:true,
    },
    price: {
      type: Number,
      required:true,
    },
    discount: {
      type: Number,
      required:true,
    },
    quantity:{
      type:Number,
      default:1
    },
    status : {
      type : String,
      enum : ['Pending','Shipped','Delivered','Cancelled'],
      default : 'Pending',
    },
    return : {
      type : String,
      state : ['Pending','Returned'],
      default :"Not Returned",
    },
     // Add the cancelReason field to store the reason for cancellation
     cancelReason: {
      type: String,
      default: '',
    },
    returnReason: {
      type: String,
      default: '',
    },
    totalPrice :{
      type : Number,
    }
  }],
  totalAmount : {
    type : Number,
    required : true,
  },
  shippingAddress : {
    addresses : {
      type : String,
      required : true,
    },
  city : {
    type : String,
    required:true,
  },
  houseNo : {
    type : Number,
    required : true,
  },
  postalCode : {
    type : Number,
    required : true,
  },
  alternativeNumber : {
    type : Number,
    required:true,
  }
},

orderDate : {
  type : Date,
  default : Date.now,
},
paymentMethod : {
  type :String,
  required : true,
},
paymentStatus : {
  type : String,
  required : true,
},
 // Include coupon details if a coupon was applied
 coupon: {
  code:{
    type:String,
  },
  discount:{
    type: Number,
  },
},
})

const order = mongoose.model('Order',orderSchema);

module.exports = order 