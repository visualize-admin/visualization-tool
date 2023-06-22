export const getHeaders = (enableCache) => {
  return {
    "Content-Type": "application/json",
    "x-visualize-cache-control": enableCache ? "" : "no-cache",
  };
};

export const getUrl = (env) => {
  return `https://${
    env === "prod" ? "" : `${env}.`
  }visualize.admin.ch/api/graphql`;
};
