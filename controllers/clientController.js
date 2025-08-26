const Client = require("../models/Client");
const slugify = require("slugify");
exports.createClient = async (req, res, next) => {
    try {
        const { name, logo, brief, url, services } = req.body;
        const client = await Client.create({
            name,
            logo,
            brief,
            url,
            services,
            slug: slugify(name, { lower: true })
        });
        return res.status(201).json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

exports.getAllClients = async (req, res, next) => {
    try {
        const clients = await Client.find();
        return res.json({ success: true, data: clients });
    } catch (error) {
        next(error);
    }
};

exports.getClientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        return res.json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

exports.updateClient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndUpdate(id, req.body, { new: true });
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        return res.json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};

exports.deleteClient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndDelete(id);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }
        return res.json({ success: true, data: client });
    } catch (error) {
        next(error);
    }
};
