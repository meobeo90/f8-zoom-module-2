class HttpRequest {
  constructor() {
    this.baseUrl = "https://spotify.f8team.dev/api/";
  }

  // Hàm lấy token từ localStorage (dùng khóa "access_token" đã xác nhận)
  getAuthToken() {
    return localStorage.getItem("access_token");
  }

  async _send(path, method, data, options = {}) {
    try {
      // 1. Lấy token từ localStorage
      const token = this.getAuthToken();

      const _options = {
        ...options,
        method,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
        },
      };

      // 2. Thêm Authorization Header
      if (token) {
        _options.headers["Authorization"] = `Bearer ${token}`;
      }

      if (data) {
        _options.body = JSON.stringify(data);
      }

      const res = await fetch(`${this.baseUrl}${path}`, _options);

      const responseData = await res.json();

      // 3. KIỂM TRA LỖI VÀ THROW EXCEPTION
      if (!res.ok) {
        const error = new Error(
          responseData.message ||
            `HTTP Error: ${res.status} for ${method} ${path}`
        );
        error.status = res.status;
        error.data = responseData;
        throw error; // Lệnh này bắt buộc phải có
      }

      // Trả về dữ liệu nếu thành công (status 2xx)
      return {
        status: res.status,
        ok: res.ok,
        data: responseData,
        error: null,
      };
    } catch (error) {
      console.error("HTTP Request Error:", error);
      // Rất quan trọng: throw lại lỗi để initHome.js bắt được
      throw error;
    }
  }

  async get(path, options) {
    return await this._send(path, "GET", null, options);
  }

  async post(path, data, options) {
    return await this._send(path, "POST", data, options);
  }

  async put(path, data, options) {
    return await this._send(path, "PUT", data, options);
  }

  async patch(path, data, options) {
    return await this._send(path, "PATCH", data, options);
  }

  async delete(path, options) {
    return await this._send(path, "DELETE", null, options);
  }
}

const httpRequest = new HttpRequest();
export default httpRequest;
