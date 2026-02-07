const PrinterSettings = require('../models/PrinterSettings');

// @desc    Get printer settings
// @route   GET /api/smart-ops/printer-settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        const businessId = req.user.businessId; // Assuming auth middleware adds this
        let settings = await PrinterSettings.findOne({ businessId });

        if (!settings) {
            // Return defaults if no settings found (could also create them here if preferred)
            settings = new PrinterSettings({ businessId });
            // We don't save it yet, just return the default structure
        }

        res.status(200).json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update printer settings
// @route   PUT /api/smart-ops/printer-settings
// @access  Private
exports.updateSettings = async (req, res) => {
    try {
        const businessId = req.user.businessId;
        const { printFormat, paperSize, standardSize, layout } = req.body;

        let settings = await PrinterSettings.findOne({ businessId });

        if (settings) {
            // Update
            settings.printFormat = printFormat;
            settings.paperSize = paperSize;
            settings.standardSize = standardSize;
            settings.layout = layout;
            await settings.save();
        } else {
            // Create
            settings = new PrinterSettings({
                businessId,
                printFormat,
                paperSize,
                standardSize,
                layout
            });
            await settings.save();
        }

        res.status(200).json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
