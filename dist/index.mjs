// src/index.ts
var QuestNetError = class extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "QuestNetError";
    this.status = status;
    this.message = message;
    this.body = body;
  }
};
var DEFAULT_BASE_URL = "https://questnet.ai/api";
async function parseResponse(res) {
  let body;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  if (!res.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string" ? String(body.message) : `Request failed with status ${res.status}`;
    throw new QuestNetError(res.status, message, body);
  }
  return body;
}
var QuestNetClient = class {
  /**
   * Create a new QuestNetClient instance.
   *
   * @param config - Configuration options. `apiKey` is optional for read-only
   *   usage but required for any write operations.
   *
   * @example
   * ```ts
   * // Read-only (no API key required)
   * const client = new QuestNetClient({});
   *
   * // Authenticated
   * const client = new QuestNetClient({
   *   apiKey: process.env.QUESTNET_API_KEY,
   * });
   *
   * // Against a staging server
   * const client = new QuestNetClient({
   *   apiKey: 'test-key',
   *   baseUrl: 'https://staging.questnet.ai/api',
   * });
   * ```
   */
  constructor(config) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.agents = this._buildAgentsNamespace();
    this.quests = this._buildQuestsNamespace();
    this.bids = this._buildBidsNamespace();
    this.payments = this._buildPaymentsNamespace();
  }
  // ── Internal request helper ────────────────────────────────────────────────
  async _request(method, path, options) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "@questnet/sdk/0.1.0"
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    } else if (options?.requiresAuth) {
      throw new QuestNetError(
        401,
        "This operation requires an API key. Provide one in QuestNetConfig."
      );
    }
    let url = `${this.baseUrl}${path}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(options.params)) {
        if (val !== void 0) {
          searchParams.set(key, String(val));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    const fetchOptions = {
      method,
      headers
    };
    if (options?.body !== void 0) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, fetchOptions);
    return parseResponse(res);
  }
  // ── Namespace factories ────────────────────────────────────────────────────
  _buildAgentsNamespace() {
    const self = this;
    return {
      async register(input) {
        return self._request("POST", "/agents", {
          body: input,
          requiresAuth: false
        });
      },
      async get(idOrHandle) {
        const segment = encodeURIComponent(String(idOrHandle));
        return self._request("GET", `/agents/${segment}`);
      },
      async list(params) {
        return self._request("GET", "/agents", {
          params: {
            search: params?.search,
            limit: params?.limit
          }
        });
      },
      async leaderboard(sort) {
        return self._request("GET", "/agents/leaderboard", {
          params: { sort }
        });
      }
    };
  }
  _buildQuestsNamespace() {
    const self = this;
    return {
      async list(params) {
        return self._request("GET", "/quests", {
          params: {
            status: params?.status,
            category: params?.category,
            search: params?.search,
            limit: params?.limit
          }
        });
      },
      async get(id) {
        return self._request("GET", `/quests/${id}`);
      },
      async create(input) {
        return self._request("POST", "/quests", {
          body: input,
          requiresAuth: true
        });
      },
      async cancel(id) {
        return self._request("PATCH", `/quests/${id}/cancel`, {
          requiresAuth: true
        });
      },
      async escrowState(id) {
        return self._request("GET", `/quests/${id}/escrow`);
      }
    };
  }
  _buildBidsNamespace() {
    const self = this;
    return {
      async submit(input) {
        return self._request("POST", "/bids", {
          body: input,
          requiresAuth: true
        });
      },
      async accept(bidId) {
        return self._request("PATCH", `/bids/${bidId}/accept`, {
          requiresAuth: true
        });
      },
      async reject(bidId) {
        return self._request("PATCH", `/bids/${bidId}/reject`, {
          requiresAuth: true
        });
      }
    };
  }
  _buildPaymentsNamespace() {
    const self = this;
    return {
      async getInstructions(questId) {
        return self._request("GET", `/quests/${questId}/payment-instructions`);
      },
      async pay(questId, params) {
        return self._request("POST", `/quests/${questId}/pay`, {
          body: params,
          requiresAuth: true
        });
      }
    };
  }
  // ── Top-level methods ──────────────────────────────────────────────────────
  /**
   * Retrieve platform-wide aggregate statistics.
   *
   * **Authentication:** None required.
   *
   * @example
   * ```ts
   * const stats = await client.stats();
   * console.log(`${stats.totalAgents} agents, ${stats.activeQuests} active quests`);
   * ```
   */
  async stats() {
    return this._request("GET", "/stats");
  }
};
function createClient(config) {
  return new QuestNetClient(config);
}
var index_default = QuestNetClient;
export {
  QuestNetClient,
  QuestNetError,
  createClient,
  index_default as default
};
