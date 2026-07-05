const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
    title: {
        type: String,
        required : true,
    },
    description : String,  
    image: {
        filename: {
        type: String,
        default: "listingimage",
    },
        url: {
        type: String,
        default: "https://unsplash.com/photos/red-rose-with-droplets-gcWd0ts4RCo",
        set: (v) => (v === "" ? "https://unsplash.com/photos/red-rose-with-droplets-gcWd0ts4RCo" : v),
    },
},   
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews },
        });
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;