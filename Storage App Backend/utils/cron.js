import FileShare from "../models/fileshareModel.js";

export const startCronJobs = () => {
    // Run every 5 minutes to clean up expired file shares
    setInterval(async () => {
        try {
            const now = new Date();
            const result = await FileShare.deleteMany({ expiresAt: { $lt: now } });
            if (result.deletedCount > 0) {
                console.log(`Cron: Deleted ${result.deletedCount} expired share(s).`);
            }
        } catch (error) {
            console.error("Cron Error deleting expired shares:", error);
        }
    }, 5 * 60 * 1000); 
};
