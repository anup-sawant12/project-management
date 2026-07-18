export const protect = async (req, res, next) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        next();
    } catch (e) {
        return res.status(401).json({
            message: e.code || e.message,
        });
    }
};