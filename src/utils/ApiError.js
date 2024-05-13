class ApiError extends Error {
    constructor(
        statuscode,
        message = "something went wrong",
        errors = [],
        stack = ''
    ) {
        super(message)
        this.statuscode = statuscode,
            this.data = null,
            this.message = message,
            this.success = false,
            this.errors = errors,
            this.stack = stack
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }


    }
}


export default ApiError