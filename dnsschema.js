import mongoose from "mongoose";

const dnsSchema = mongoose.Schema({
    domainName: String,
    ipAddresses: String,
})

const DNS = mongoose.model("DNSEntry", dnsSchema);

export default class DNSDB {
    static async insert(domainName, ipAddresses) {
        console.log("DB insert::: ", domainName, ipAddresses)
        // check if domain exists
        let dns = await DNS.find({ domainName });
        if (dns.length > 0) {
            // update the ipAddresses
            dns = await DNS.updateOne({ domainName }, { $set: { ipAddresses } });
        } else {
            // create a new entry
            dns = new DNS({ domainName, ipAddresses });
            await dns.save();
        }
    }

    static async get(domainName) {
        // get the ipAdresses for the provided domain name
        const dns = await DNS.findOne({ domainName }, { ipAddresses: 1, _id: 0 })
        console.log("DB get::: ", dns)
        return dns;
    }
}