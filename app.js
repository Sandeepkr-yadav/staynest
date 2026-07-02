const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname,"views"));
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; 
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err) =>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}
// app.get("/testListing" ,async(req, res)=>{
//     let sampleListing = new Listing({
//         title : "My new home",
//         description : "By the beach",
//         price : 3000,
//         location : "Khanna Punjab",
//         country : "India",
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("data stored !")
// });



// Index Routes
app.get("/listings", wrapAsync(async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));

// New Route
app.get("/listings/new", (req, res)=>{
    res.render("./listings/new.ejs");
});


// Show Routes
app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
}));

//Create route
app.post("/listings", wrapAsync(async(req, res, next)=>{
        if(!req.body.listing) {
            throw new ExpressError(400, "send valid data for listings");
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

// Update Route 
app.put("/listings/:id", wrapAsync(async(req, res)=>{
     let {id}= req.params;
     await Listing.findByIdAndUpdate(id, {...req.body.listing});
     res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id",wrapAsync(async(req, res)=>{
    let {id}= req.params;
    let listingDelete = await Listing.findByIdAndDelete(id);
    console.log(listingDelete);
    res.redirect("/listings");
}));


app.get("/", (req, res)=>{
    res.send("Hi, I am root");
})

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log(`server is listening on port 8080`);
});