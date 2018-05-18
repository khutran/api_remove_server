export const ExceptionHandler = function(err, req, res, next) {
    let isJsonString = str => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };
    console.error(err);
    if (isJsonString(err.message)) {
        res.status(500).json(JSON.parse(err.message));
    } else {
        res.status(500).json({ error_code: null, message: err.message });
    }
};

