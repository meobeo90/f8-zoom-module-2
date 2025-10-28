class HttpRequest {
  constructor() {
    this.baseUrl = "https://spotify.f8team.dev/api/";
  }

  // Hàm lấy token từ localStorage
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
          ...(options.headers || {}),
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
      const responseData = await res.json().catch(() => ({}));

      return {
        status: res.status,
        ok: res.ok,
        data: responseData,
        error: res.ok ? null : responseData.error || responseData.message,
      };
    } catch (error) {
      console.error("HTTP Request Error:", error);
      return {
        ok: false,
        data: null,
        status: 0,
        error: error.message || "Network error",
      };
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
