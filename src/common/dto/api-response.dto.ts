export class ApiResponseDto<T> {
    code: number;
    status: boolean;
    message?: string;
    data: T;

    constructor(data: T, code: number,) {
        this.status = true;
        this.code = code;
        this.data = data;
    }
}