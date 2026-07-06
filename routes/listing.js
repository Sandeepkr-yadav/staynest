const express = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema");
const ExpressError = require("../utils/ExpressError.js");
const router = express.Router();

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index Routes
router.get("/", wrapAsync(async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));

// New Route
router.get("/new", (req, res)=>{
    res.render("./listings/new.ejs");
});


// Show Routes
router.get("/:id", wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}));

//Create route
router.post("/",validateListing, wrapAsync(async(req, res, next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success","New listing created!");
        res.redirect("/listings");
    })
);

//Edit route
router.get("/:id/edit",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
     if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs",{listing});
}));

// Update Route 
router.put("/:id",validateListing, wrapAsync(async(req, res)=>{
     let {id}= req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing});
      req.flash("success","listing updated!");
     res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id",wrapAsync(async(req, res)=>{
    let {id}= req.params;
    let listingDelete = await Listing.findByIdAndDelete(id);
    console.log(listingDelete);
    req.flash("success","listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;