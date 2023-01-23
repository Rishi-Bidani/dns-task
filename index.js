import express from "express";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// dns lookup
import { lookup } from "dns/promises";


// mongoose setup
const mongoURI = "mongodb://0.0.0.0:27017/dns";
import mongoose from "mongoose";
await mongoose.connect(mongoURI);
mongoose.set("strictQuery", false);

// Database handler -> add querying code to this class instead of accessing directly
import dnsDB from "./dnsschema.js"


const app = express();
const http = require("http").Server(app);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ limit: "100kb", extended: false }));

// GET request to get the ip address for the domain name
app.get("/api/dns", async (req, res) => {
    // get domain name from query string
    const domainName = req.query.domain;
    // const ipInformation = await lookup(domainName, { all: true });
    const ipInformation = await dnsDB.get(domainName);
    const fromDB = ipInformation ? true : false;
    ipInformation ??= await lookup(domainName);

    const ipAddress = ipInformation?.ipAddresses ?? ipInformation?.address;
    res.json({ ipAddr: ipAddress });

    // Do work after sending response to avoid unecessary delay
    // store the information in a database
    if (!fromDB) {
        await dnsDB.insert(domainName, ipAddress)
    }

});

// POST request to store the domain name and ip address
app.post("/api/dns", (req, res) => {
    try {
        const { domainName, ipAddress } = req.body;
        if (!domainName || !ipAddress) {
            res.status(400).json({ message: "Invalid Request" });
            return;
        }
        dnsDB.insert(domainName, ipAddress);
        res.sendStatus(202);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Internal Server Error" });
    }

})

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Listening on  http://localhost:${PORT}`);
})