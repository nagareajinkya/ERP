const cron = require('node-cron');
const Offer = require('../models/Offer');

const initScheduler = () => {
    console.log('[Scheduler] Initialized Offer Status Job (Every Minute)');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        // console.log(`[Scheduler] Running status check at ${now.toISOString()}`);

        try {
            // 1. Activate Scheduled Offers
            // Status is 'scheduled' AND startDate <= now
            const offersToActivate = await Offer.updateMany(
                {
                    status: 'scheduled',
                    startDate: { $lte: now }
                },
                {
                    $set: { status: 'active' }
                }
            );

            if (offersToActivate.modifiedCount > 0) {
                // Activated offers
            }

            // 2. Expire Active/Paused Offers
            // Status is 'active' or 'paused' AND endDate < now (and endDate exists)
            const offersToExpire = await Offer.updateMany(
                {
                    status: { $in: ['active', 'paused'] },
                    endDate: { $lt: now, $ne: null }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            if (offersToExpire.modifiedCount > 0) {
                // Expired offers
            }

        } catch (err) {
            // Error in status check
        }
    });
};

module.exports = initScheduler;
