
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    // No Authorization header
    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. Authentication token required."
        });
    }

    // Expected format:
    // Authorization: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            message: "Invalid authorization format."
        });
    }

    const token = parts[1];

    if (!token) {
        return res.status(401).json({
            message: "Token missing."
        });
    }

    // Verify JWT
    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {

                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        message: "Token expired."
                    });
                }

                return res.status(403).json({
                    message: "Invalid token."
                });
            }

            // Authenticated user
            req.user = user;

            next();
        }
    );
}

module.exports = authenticateToken;

