export default class getError {

    constructor(e = "", code = 500) {
        let error = new Error(e);
        return { message: error['message'], error_code: code }
    }
}
