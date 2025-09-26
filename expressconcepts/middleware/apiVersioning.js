export const urlVersioning = (version) => (req, res, next) => {
  if (req.path.startsWith(`/api/${version}`)) {
    console.log("Version pass");
    next();
  } else {
    console.log("Version fail");
    res.status(404).json({
      success: "false",
      error: "API version is not supported",
    });
  }
};
//header versioning
export const headerVersioning = (version) => (req, res, next) => {
  if (req.get("Accept-Version") === version) {
    next();
  } else {
    res.status(404).json({
      success: "false",
      error: "API header version is not supported",
    });
  }
};
//content-type version
export const contentTypeVersion = (version) => (req, res, next) => {
  const contentType = req.get("Content-Type");
  if (
    contentType &&
    contentType.includes(`application/vnd.api.${version}+json`)
  ) {
    next();
  } else {
    res.status(404).json({
      success: "false",
      error: "API Content-Type version is not supported",
    });
  }
};
