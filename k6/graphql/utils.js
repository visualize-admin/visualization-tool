export const headers = {
  "Content-Type": "application/json",
  "x-visualize-cache-control": "no-cache",
};

export const getUrl = (env) => {
  return `https://${env === "prod" ? "" : `${env}.`}visualize.admin.ch`;
};
