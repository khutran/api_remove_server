import * as _ from "lodash";

export class Exception extends Error {
    constructor(message = "", error_code = null) {
        super(
            JSON.stringify({
                message: message,
                error_code: error_code
            })
        );
    }
}