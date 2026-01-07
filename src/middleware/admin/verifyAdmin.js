const verifyAdmin = (req, res, next) => {
    if(!req.user){
        return res.status(401).json ({
            success: false,
            message: "Không tìm thấy thông tin người dùng"
        });
    }
    
    if(req.user.role !== "admin"){
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập"
        });
    }

    next();
}

module.exports = verifyAdmin;