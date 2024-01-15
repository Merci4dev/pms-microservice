// This script defines Mongoose schemas for the Product and ProductPair models, as well as some methods and middleware related to the Product model.
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for the Product model
const productSchema = new Schema({
    id: Number,
    title: String,
    quantity: { type: Number, default: 10 },
    link: String,
    image_link: String,
    ingredients: String,
    diet: String,
    pizza_type: String,
    category: String,
    price: Number,
    sale_price: Number,
    explanation: String,
    rating: Number,
    rating_count: Number,
    stock: { type: String, default: 'In Stock' }, 
    lastUpdated: { type: Date, default: Date.now }
});

// Define the schema for the ProductPair model
const productPairSchema = new mongoose.Schema({
    products: [{ type: Number, ref: 'Product' }], // Store numeric IDs
    frequency: { type: Number, default: 1 }
});

// Define static methods for the Product model
productSchema.statics.findAll = function() {
    return this.find();
};
  
productSchema.statics.customFindOneAndUpdate = function(query, updateData) {
    return this.findOneAndUpdate(query, updateData, { new: true });
};

// Define an instance method for saving a product to the database
productSchema.methods.saveToDB = function() {
    return this.save();
};

// Define a pre-save middleware to update the lastUpdated field
productSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Define a pre-findOneAndUpdate middleware to update the lastUpdated field
productSchema.pre('findOneAndUpdate', function(next) {
    this.set({ lastUpdated: new Date() });
    next();
});

// Create the Product and ProductPair models
const Product = model('Product', productSchema);
const ProductPair = mongoose.model('ProductPair', productPairSchema);

export { Product, ProductPair };
