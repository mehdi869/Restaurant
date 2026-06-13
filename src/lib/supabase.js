// Mock Supabase client for portfolio demo without database credentials

class MockAuthClient {
  constructor() {
    this.session = this.getStoredSession();
  }

  getStoredSession() {
    const stored = localStorage.getItem("mock_session");
    return stored ? JSON.parse(stored) : null;
  }

  setStoredSession(session) {
    if (session) {
      localStorage.setItem("mock_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("mock_session");
    }
    this.session = session;
  }

  async signInWithPassword({ email, password }) {
    // Mock authentication - accept any email/password combo
    if (!email || !password) {
      return { error: new Error("Email and password required") };
    }

    const session = {
      user: { id: "mock-user-" + Date.now(), email },
      access_token: "mock-token-" + Date.now(),
    };
    this.setStoredSession(session);
    return { error: null };
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  onAuthStateChange(callback) {
    // Mock listener
    callback("INITIAL_SESSION", this.session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }

  async signOut() {
    this.setStoredSession(null);
    return { error: null };
  }
}

class MockTable {
  constructor(tableName, dbClient) {
    this.tableName = tableName;
    this.db = dbClient;
    this._filter = null;
    this._orderField = null;
    this._orderAsc = true;
  }

  from(table) {
    return new MockTable(table, this.db);
  }

  select() {
    this._operation = "select";
    return this;
  }

  insert(records) {
    this._operation = "insert";
    this._data = Array.isArray(records) ? records : [records];
    return this;
  }

  update(data) {
    this._operation = "update";
    this._data = data;
    return this;
  }

  eq(field, value) {
    this._filter = { field, value };
    return this;
  }

  order(field, options = {}) {
    this._orderField = field;
    this._orderAsc = options.ascending !== false;
    return this;
  }

  async select() {
    return { data: this._getData(), error: null };
  }

  async single() {
    const data = this._getData();
    return { data: data[0] || null, error: null };
  }

  async insert(records) {
    const data = Array.isArray(records) ? records : [records];
    const newRecords = data.map((r) => ({
      ...r,
      id: Date.now() + Math.random(),
    }));
    const table = this.db.data[this.tableName] || [];
    this.db.data[this.tableName] = [...table, ...newRecords];
    this.db.save(this.tableName);
    return { data: newRecords, error: null };
  }

  async update(data) {
    if (this._filter) {
      this.db.data[this.tableName] = (this.db.data[this.tableName] || []).map(
        (r) =>
          r[this._filter.field] === this._filter.value ? { ...r, ...data } : r,
      );
      this.db.save(this.tableName);
    }
    return { data, error: null };
  }

  _getData() {
    let data = this.db.data[this.tableName] || [];
    if (this._orderField) {
      data = [...data].sort((a, b) => {
        const aVal = a[this._orderField];
        const bVal = b[this._orderField];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this._orderAsc ? cmp : -cmp;
      });
    }
    return data;
  }
}

class MockDatabaseClient {
  constructor() {
    this.data = {
      orders: this.getStored("mock_orders", []),
      menu_items: this.getStored("mock_menu_items", []),
      order_items: this.getStored("mock_order_items", []),
    };
  }

  getStored(key, defaultValue) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  save(table) {
    localStorage.setItem(`mock_${table}`, JSON.stringify(this.data[table]));
  }

  from(table) {
    return new MockTable(table, this);
  }

  channel(name) {
    return {
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
      unsubscribe() {},
    };
  }
}

class MockSupabaseClient {
  constructor() {
    this.auth = new MockAuthClient();
    this._db = new MockDatabaseClient();
  }

  from(table) {
    return this._db.from(table);
  }

  channel(name) {
    return this._db.channel(name);
  }

  removeChannel(channel) {
    // Mock implementation - no-op
    return Promise.resolve();
  }
}

export const supabase = new MockSupabaseClient();
