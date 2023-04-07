module.export = {
    // parseInt(path);
    get: ({path}) => {
      const ind = path;
      if (ind) {
        return global.users[ind];
      } else {
        return global.users;
      }
    },
    post: ({query, payload}) => {
      payload = JSON.parse(payload);
      if (Object.entries(query).length !== 0) {
        global.users.push(query);
      } else if (Object.entries(payload).length !== 0) {
        global.users.push(payload);
      }
      return global.users;
    },
    delete: ({path}) => {
      const ind = path;
      global.users = global.users.filter((user, i) => {
        return i != ind;
      });
      return global.users;
    },
    patch: ({path, query, payload}) => {
      const ind = path;
      payload = JSON.parse(payload);
      global.users = global.users.map((user, i) => {
        if (i == ind) {
          if (Object.entries(query).length !== 0) {
            return query;
          } else if (Object.entries(payload).length !== 0) {
            return payload;
          }
        } else {
          return user;
        }
      });
      return global.users;
    },
    options: ({path}) => {
      return global.users;
    },
  };