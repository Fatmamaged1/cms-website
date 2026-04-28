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
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * Number(limit);
        const [clients, total] = await Promise.all([
            Client.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Client.countDocuments()
        ]);
        return res.json({ success: true, data: clients, meta: { page: Number(page), limit: Number(limit), total } });
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
