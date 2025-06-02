
// authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    console.log("in auth : " + req.body);

    const authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(JSON.stringify(decoded));

        req.userId = decoded.id;  // ✅ yeh extract kar liya
        console.log(req.userId);

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" + err });
    }
};

module.exports = authMiddleware;
